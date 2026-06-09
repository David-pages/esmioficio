import { supabase } from './supabaseClient';

export type AnalyticsEventType =
  | 'profile_view'
  | 'whatsapp_click'
  | 'phone_click'
  | 'service_request_created'
  | 'service_marked_hired'
  | 'service_completed'
  | 'review_created'
  | 'professional_saved'
  | 'search_performed';

type AnalyticsEventInput = {
  eventType: AnalyticsEventType;
  userId?: string | null;
  professionalId?: string | null;
  serviceRequestId?: string | null;
  city?: string | null;
  state?: string | null;
  trade?: string | null;
  metadata?: Record<string, unknown>;
};

export const recordAnalyticsEvent = async (event: AnalyticsEventInput) => {
  try {
    const { error } = await supabase.from('analytics_events').insert([{
      event_type: event.eventType,
      user_id: event.userId || null,
      professional_id: event.professionalId || null,
      service_request_id: event.serviceRequestId || null,
      city: event.city || null,
      state: event.state || null,
      trade: event.trade || null,
      metadata: event.metadata || {}
    }]);
    if (error) {
      console.warn('Analytics event was not recorded. Apply supabase-admin-analytics.sql if metrics are needed.', error);
    }
  } catch (error) {
    console.warn('Analytics event was not recorded. Apply supabase-admin-analytics.sql if metrics are needed.', error);
  }
};
