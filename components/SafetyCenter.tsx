import React, { useEffect, useState } from 'react';
import { MediationCase, Professional, Report, User } from '../types';
import { compressImageToWebP } from '../lib/trust';
import { supabase } from '../lib/supabaseClient';

interface SafetyCenterProps {
  professional: Professional;
  currentUser: User | null;
  isOwner: boolean;
  onLoginRequest: () => void;
}

const REPORT_REASONS = [
  'Trabajo inconcluso',
  'Desacuerdo en precio',
  'Falta de respuesta',
  'Problema con tiempos de entrega',
  'Problema con calidad del servicio',
  'Otro'
];

const BLOCKED_WORDS = ['estafador', 'ratero', 'fraudulento'];

const normalizeReportRow = (row: any): Report => ({
  id: row.id,
  professionalId: row.professional_id,
  userId: row.user_id,
  reason: row.reason,
  description: row.description || '',
  evidenceUrls: Array.isArray(row.evidence_urls) ? row.evidence_urls : [],
  professionalResponse: row.professional_response || null,
  status: row.status,
  createdAt: row.created_at,
  resolvedAt: row.resolved_at || null
});

const normalizeMediationRow = (row: any): MediationCase => ({
  id: row.id,
  professionalId: row.professional_id,
  clientId: row.client_id,
  reportId: row.report_id || null,
  status: row.status,
  clientMessage: row.client_message || '',
  professionalResponse: row.professional_response || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at || null,
  closedAt: row.closed_at || null
});

const SafetyCenter: React.FC<SafetyCenterProps> = ({ professional, currentUser, isOwner, onLoginRequest }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [mediations, setMediations] = useState<MediationCase[]>([]);
  const [reportForm, setReportForm] = useState({
    reason: REPORT_REASONS[0],
    description: '',
    isSerious: false
  });
  const [mediationMessage, setMediationMessage] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const containsBlockedWords = (value: string) => {
    const lower = value.toLowerCase();
    return BLOCKED_WORDS.some(word => lower.includes(word));
  };

  const loadSafetyData = async () => {
    if (!currentUser) {
      setReports([]);
      setMediations([]);
      return;
    }

    const reportQuery = supabase
      .from(isOwner ? 'professional_reports_safe' : 'reports')
      .select(isOwner
        ? 'id,professional_id,reason,description,evidence_urls,professional_response,status,created_at,resolved_at'
        : 'id,professional_id,user_id,reason,description,evidence_urls,professional_response,status,created_at,resolved_at'
      )
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    const mediationQuery = supabase
      .from(isOwner ? 'professional_mediations_safe' : 'mediation_cases')
      .select(isOwner
        ? 'id,professional_id,report_id,status,client_message,professional_response,created_at,updated_at,closed_at'
        : 'id,professional_id,client_id,report_id,status,client_message,professional_response,created_at,updated_at,closed_at'
      )
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    const [{ data: reportData, error: reportError }, { data: mediationData, error: mediationError }] = await Promise.all([
      isOwner ? reportQuery : reportQuery.eq('user_id', currentUser.id),
      isOwner ? mediationQuery : mediationQuery.eq('client_id', currentUser.id)
    ]);

    if (!reportError && reportData) setReports(reportData.map(normalizeReportRow));
    if (!mediationError && mediationData) setMediations(mediationData.map(normalizeMediationRow));
  };

  useEffect(() => {
    loadSafetyData();
  }, [professional.id, currentUser?.id, isOwner]);

  const handleEvidenceChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const selected = Array.from<File>(event.target.files ?? []);
    if (selected.length === 0) return;

    try {
      const processed: File[] = [];
      for (const file of selected.slice(0, 5)) {
        processed.push(await compressImageToWebP(file));
      }
      setEvidenceFiles(prev => [...prev, ...processed].slice(0, 5));
      setStatusMessage('Evidencia lista para adjuntar.');
    } catch (error: any) {
      setStatusMessage(error.message || 'No se pudo procesar la evidencia.');
    } finally {
      event.target.value = '';
    }
  };

  const uploadEvidence = async (userId = currentUser?.id) => {
    if (!userId) return [];
    const urls: string[] = [];

    for (const file of evidenceFiles) {
      const path = `${professional.id}/${userId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('report-evidence').upload(path, file, {
        contentType: file.type,
        upsert: false
      });
      if (error) throw error;

      urls.push(path);
    }

    return urls;
  };

  const handleSubmitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!currentUser) {
      onLoginRequest();
      return;
    }

    const description = reportForm.description.trim();
    if (description.length < 20) {
      setStatusMessage('Describe lo ocurrido con al menos 20 caracteres.');
      return;
    }
    if (containsBlockedWords(description)) {
      setStatusMessage('Usa lenguaje neutral. Evita palabras acusatorias o destructivas.');
      return;
    }
    if (reportForm.isSerious && evidenceFiles.length === 0) {
      setStatusMessage('Para reportes graves se requiere al menos una evidencia.');
      return;
    }

    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        onLoginRequest();
        return;
      }

      const evidenceUrls = await uploadEvidence(authData.user.id);
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          professional_id: professional.id,
          user_id: authData.user.id,
          reason: reportForm.reason,
          description,
          evidence_urls: evidenceUrls,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      setReports(prev => [normalizeReportRow(data), ...prev]);
      setReportForm({ reason: REPORT_REASONS[0], description: '', isSerious: false });
      setEvidenceFiles([]);
      setStatusMessage('Reporte enviado para revision.');
    } catch (error: any) {
      setStatusMessage(error.message || 'No se pudo enviar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMediation = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!currentUser) {
      onLoginRequest();
      return;
    }

    const message = mediationMessage.trim();
    if (message.length < 20) {
      setStatusMessage('Explica la mediacion con al menos 20 caracteres.');
      return;
    }
    if (containsBlockedWords(message)) {
      setStatusMessage('Usa lenguaje neutral para que la mediacion sea revisable.');
      return;
    }

    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        onLoginRequest();
        return;
      }

      const { data, error } = await supabase
        .from('mediation_cases')
        .insert([{
          professional_id: professional.id,
          client_id: authData.user.id,
          status: 'open',
          client_message: message
        }])
        .select()
        .single();

      if (error) throw error;
      setMediations(prev => [normalizeMediationRow(data), ...prev]);
      setMediationMessage('');
      setStatusMessage('Mediacion abierta. EsMiOficio ayudara a documentar y solicitar respuesta.');
    } catch (error: any) {
      setStatusMessage(error.message || 'No se pudo abrir la mediacion.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfessionalResponse = async (kind: 'report' | 'mediation', id: string, response: string) => {
    const cleanResponse = response.trim();
    if (cleanResponse.length < 10) {
      setStatusMessage('La respuesta debe tener al menos 10 caracteres.');
      return;
    }

    const table = kind === 'report' ? 'reports' : 'mediation_cases';
    const updatePayload = kind === 'report'
      ? { professional_response: cleanResponse }
      : { professional_response: cleanResponse, status: 'waiting_client' };

    const { error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', id)
      .eq('professional_id', professional.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage('Respuesta enviada.');
    loadSafetyData();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">balance</span>
          Problemas con un servicio
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          En EsMiOficio no hacemos el trabajo, pero ayudamos a que nadie se esconda.
          Documentamos el caso y solicitamos respuesta; no es un servicio legal ni promete devoluciones o reparaciones obligatorias.
        </p>
      </div>

      {!isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleSubmitReport} className="rounded-2xl bg-surface-light/30 border border-border p-5 space-y-4">
            <h4 className="text-white font-bold">Reportar con evidencia</h4>
            <select
              value={reportForm.reason}
              onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
            >
              {REPORT_REASONS.map(reason => <option key={reason}>{reason}</option>)}
            </select>
            <textarea
              value={reportForm.description}
              onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
              rows={4}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-primary outline-none"
              placeholder="Describe lo ocurrido con lenguaje neutral."
            />
            <label className="flex items-start gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={reportForm.isSerious}
                onChange={e => setReportForm({ ...reportForm, isSerious: e.target.checked })}
                className="mt-0.5"
              />
              <span>Es un reporte grave. Requiere al menos una evidencia.</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-bold text-primary cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">attach_file</span>
              Adjuntar evidencia
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleEvidenceChange} />
            </label>
            {evidenceFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {evidenceFiles.map((file, index) => <span key={`${file.name}-${index}`} className="activity-badge">{file.name}</span>)}
              </div>
            )}
            <button disabled={saving} className="w-full bg-primary text-background font-black py-3 rounded-lg hover:bg-primary-hover disabled:opacity-50">
              Enviar reporte
            </button>
          </form>

          <form onSubmit={handleCreateMediation} className="rounded-2xl bg-surface-light/30 border border-border p-5 space-y-4">
            <h4 className="text-white font-bold">Solicitar mediacion</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              EsMiOficio ayuda a documentar el caso y pedir respuesta al profesional.
            </p>
            <textarea
              value={mediationMessage}
              onChange={e => setMediationMessage(e.target.value)}
              rows={7}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-primary outline-none"
              placeholder="Explica que necesitas documentar o aclarar."
            />
            <button disabled={saving} className="w-full bg-surface border border-primary/40 text-primary font-black py-3 rounded-lg hover:bg-primary/10 disabled:opacity-50">
              Abrir mediacion
            </button>
          </form>
        </div>
      )}

      {statusMessage && <p className="text-sm text-gray-400">{statusMessage}</p>}

      {currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface-light/20 border border-border p-5">
            <h4 className="text-white font-bold mb-3">{isOwner ? 'Reportes recibidos' : 'Tus reportes'}</h4>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="rounded-xl bg-surface border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-white">{report.reason}</span>
                      <span className="activity-badge">{report.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{report.description}</p>
                    {report.evidenceUrls.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {report.evidenceUrls.slice(0, 3).map(url => (
                          <EvidenceImage key={url} pathOrUrl={url} />
                        ))}
                      </div>
                    )}
                    {report.professionalResponse ? (
                      <p className="mt-3 text-xs text-gray-300 border-t border-border pt-3">Respuesta: {report.professionalResponse}</p>
                    ) : isOwner && (
                      <ResponseBox onSubmit={(response) => handleProfessionalResponse('report', report.id, response)} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay reportes visibles para esta cuenta.</p>
            )}
          </div>

          <div className="rounded-2xl bg-surface-light/20 border border-border p-5">
            <h4 className="text-white font-bold mb-3">{isOwner ? 'Mediaciones relacionadas' : 'Tus mediaciones'}</h4>
            {mediations.length > 0 ? (
              <div className="space-y-3">
                {mediations.map(item => (
                  <div key={item.id} className="rounded-xl bg-surface border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-white">Mediacion</span>
                      <span className="activity-badge">{item.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.clientMessage}</p>
                    {item.professionalResponse ? (
                      <p className="mt-3 text-xs text-gray-300 border-t border-border pt-3">Respuesta: {item.professionalResponse}</p>
                    ) : isOwner && (
                      <ResponseBox onSubmit={(response) => handleProfessionalResponse('mediation', item.id, response)} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay mediaciones visibles para esta cuenta.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const ResponseBox: React.FC<{ onSubmit: (response: string) => void }> = ({ onSubmit }) => {
  const [response, setResponse] = useState('');
  return (
    <div className="mt-3 border-t border-border pt-3 space-y-2">
      <textarea
        value={response}
        onChange={e => setResponse(e.target.value)}
        rows={3}
        className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-xs text-white resize-none focus:border-primary outline-none"
        placeholder="Responder con lenguaje neutral"
      />
      <button
        type="button"
        onClick={() => {
          onSubmit(response);
          setResponse('');
        }}
        className="w-full bg-primary text-background font-bold py-2 rounded-lg text-xs hover:bg-primary-hover"
      >
        Enviar respuesta
      </button>
    </div>
  );
};

const EvidenceImage: React.FC<{ pathOrUrl: string }> = ({ pathOrUrl }) => {
  const [src, setSrc] = useState(pathOrUrl.startsWith('http') ? pathOrUrl : '');

  useEffect(() => {
    let mounted = true;
    const loadSignedUrl = async () => {
      if (pathOrUrl.startsWith('http')) {
        setSrc(pathOrUrl);
        return;
      }
      const { data } = await supabase.storage.from('report-evidence').createSignedUrl(pathOrUrl, 3600);
      if (mounted && data?.signedUrl) setSrc(data.signedUrl);
    };
    loadSignedUrl();
    return () => {
      mounted = false;
    };
  }, [pathOrUrl]);

  if (!src) {
    return <div className="h-14 w-14 rounded-lg bg-surface-light border border-border"></div>;
  }

  return (
    <img
      src={src}
      alt="Evidencia permitida"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
      className="h-14 w-14 rounded-lg object-cover bg-surface-light"
    />
  );
};

export default SafetyCenter;
