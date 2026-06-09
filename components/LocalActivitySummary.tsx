import React, { useEffect, useMemo, useState } from 'react';
import { ActivityEvent } from '../types';
import { mapActivityEventRow } from '../lib/trust';
import { supabase } from '../lib/supabaseClient';

interface LocalActivitySummaryProps {
  trade?: string | null;
  city?: string | null;
}

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const tradeLabel = (trade?: string | null) => {
  const clean = (trade || '').trim();
  if (!clean) return 'profesionales';
  return clean.length > 34 ? `${clean.slice(0, 34)}...` : clean;
};

const LocalActivitySummary: React.FC<LocalActivitySummaryProps> = ({ trade, city }) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const dayStartIso = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('activity_events_public')
      .select('id,type,professional_id,city,zone,trade,created_at')
      .gte('created_at', dayStartIso)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      const fallback = await supabase
        .from('activity_events')
        .select('id,type,professional_id,city,zone,trade,created_at')
        .gte('created_at', dayStartIso)
        .order('created_at', { ascending: false })
        .limit(100);
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      setEvents(data.map(mapActivityEventRow));
    } else {
      setEvents([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    const onUpdate = () => loadEvents();
    window.addEventListener('activityEventsUpdated', onUpdate);
    return () => window.removeEventListener('activityEventsUpdated', onUpdate);
  }, [dayStartIso]);

  const summary = useMemo(() => {
    const normalizedTrade = normalize(trade || '');
    const normalizedCity = normalize(city || '');

    const matchesTrade = (event: ActivityEvent) => {
      if (!normalizedTrade) return true;
      const eventTrade = normalize(event.trade || '');
      if (!eventTrade) return false;
      return eventTrade.includes(normalizedTrade) || normalizedTrade.includes(eventTrade);
    };

    const matchesCity = (event: ActivityEvent) => {
      if (!normalizedCity) return true;
      const eventCity = normalize(event.city || '');
      const eventZone = normalize(event.zone || '');
      if (!eventCity && !eventZone) return false;
      return eventCity.includes(normalizedCity) || normalizedCity.includes(eventCity) || eventZone.includes(normalizedCity);
    };

    const scopedEvents = events.filter(event => matchesTrade(event) && matchesCity(event));
    return {
      searches: scopedEvents.filter(event => event.type === 'search_performed').length,
      contacts: scopedEvents.filter(event => event.type === 'contact_unlocked').length
    };
  }, [events, trade, city]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 animate-pulse">
        <div className="h-4 w-2/3 rounded bg-surface-light"></div>
      </div>
    );
  }

  const label = tradeLabel(trade);
  const cityText = city || 'tu zona';

  if (summary.searches === 0 && summary.contacts === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-gray-400">
          Aun no hay actividad real de hoy para {label} en {cityText}. Cuando alguien busque o contacte dentro de EsMiOficio, aparecera aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm text-gray-200">
        Hoy <span className="font-black text-primary">{summary.searches}</span> {summary.searches === 1 ? 'persona busco' : 'personas buscaron'} {label} en {cityText}
        {summary.contacts > 0 && (
          <> y <span className="font-black text-primary">{summary.contacts}</span> {summary.contacts === 1 ? 'contacto se abrio' : 'contactos se abrieron'} desde EsMiOficio</>
        )}.
      </p>
      <p className="mt-1 text-[11px] text-gray-500">Solo mostramos actividad real registrada dentro de la webapp.</p>
    </div>
  );
};

export default LocalActivitySummary;
