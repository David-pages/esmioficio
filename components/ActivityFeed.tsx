import React, { useEffect, useState } from 'react';
import { ActivityEvent } from '../types';
import { supabase } from '../lib/supabaseClient';
import { getRelativeTimeText, mapActivityEventRow } from '../lib/trust';

const eventCopy = (event: ActivityEvent) => {
  const trade = (event.trade || 'profesional').toLowerCase();
  const city = event.city || 'Morelia';
  const zone = event.zone || 'zona local';

  if (event.type === 'search_performed') return `Alguien busco un ${trade} en ${city}.`;
  if (event.type === 'contact_attempt') return `Alguien intento contactar a un ${trade} en ${city}.`;
  if (event.type === 'contact_unlocked') return `Un ${trade} fue contactado en ${zone}.`;
  if (event.type === 'profile_view') return `Alguien vio un perfil de ${trade} en ${city}.`;
  return `Hubo actividad reciente de ${trade} en ${city}.`;
};

const ActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('activity_events_public')
      .select('id,type,professional_id,city,zone,trade,created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      const fallback = await supabase
        .from('activity_events')
        .select('id,type,professional_id,city,zone,trade,created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      setEvents(data.map(mapActivityEventRow));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    const onUpdate = () => loadEvents();
    window.addEventListener('activityEventsUpdated', onUpdate);
    return () => window.removeEventListener('activityEventsUpdated', onUpdate);
  }, []);

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Actividad real en Morelia</h2>
            <p className="text-sm text-gray-400">Senales anonimas de busquedas, contactos y perfiles vistos.</p>
          </div>
          <span className="activity-badge">Ultimos eventos reales</span>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-surface-light/60 animate-pulse"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.slice(0, 10).map(event => (
                <div key={event.id} className="flex items-start gap-3 rounded-xl bg-surface-light/40 border border-border px-4 py-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">bolt</span>
                  <div>
                    <p className="text-sm text-gray-200 leading-snug">{eventCopy(event)}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{getRelativeTimeText(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-primary/50 mb-2">handshake</span>
              <p className="text-gray-400 font-medium">Estamos sumando profesionales confiables en Morelia.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ActivityFeed;
