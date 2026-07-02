import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Professional, User } from '../types';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';
import SafetyCenter from './SafetyCenter';

interface ReportProfessionalPageProps {
  professionals: Professional[];
  isLoading?: boolean;
  currentUser: User | null;
  onLoginRequest: () => void;
}

const ReportProfessionalPage: React.FC<ReportProfessionalPageProps> = ({ professionals, isLoading = false, currentUser, onLoginRequest }) => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const professional = professionals.find(pro => pro.id === professionalId);

  if (!professional) {
    if (isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-bold text-gray-400">Cargando reporte...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/buscar" />;
  }

  const isOwner = currentUser?.role === 'PRO' && currentUser?.proId === professional.id;
  const toSlug = (value: string) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const profilePath = `/oficio/${toSlug(professional.name)}-${toSlug(professional.trade)}-${toSlug(professional.municipality || 'morelia')}`;

  return (
    <>
      <SEOHelmet
        title={`Reportar a ${professional.name} | EsMiOficio`}
        description="Reporta un problema con evidencia o solicita mediacion basica dentro de EsMiOficio."
        canonicalUrl={getAbsoluteUrl(`/reportar/${professional.id}`)}
        noindex
      />

      <div className="min-h-screen bg-background py-10">
        <div className="mx-auto max-w-5xl px-4">
          <Link to={profilePath} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al perfil
          </Link>

          <div className="mb-6 rounded-2xl bg-surface border border-border p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={professional.imageUrl}
                alt={professional.name}
                className="h-20 w-20 rounded-2xl object-cover border border-border bg-surface-light"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Reportar o mediar</h1>
                <p className="text-primary font-bold mt-1">{professional.name} · {professional.trade}</p>
                <p className="text-sm text-gray-400 mt-1">{professional.municipality || 'Morelia'}</p>
              </div>
            </div>

            {!currentUser && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Para reportar o pedir mediacion necesitas iniciar sesion. La navegacion general sigue disponible.
                </p>
                <button
                  onClick={onLoginRequest}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-background hover:bg-primary-hover transition-colors"
                >
                  Continuar con Google
                </button>
              </div>
            )}
          </div>

          <SafetyCenter
            professional={professional}
            currentUser={currentUser}
            isOwner={!!isOwner}
            onLoginRequest={onLoginRequest}
          />
        </div>
      </div>
    </>
  );
};

export default ReportProfessionalPage;
