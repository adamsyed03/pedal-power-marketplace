import posthog from 'posthog-js';

export type AnalyticsEvent =
  | 'phone_call_click'
  | 'whatsapp_click'
  | 'test_ride_click'
  | 'test_ride_form_submit'
  | 'primary_cta_click';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const isBrowser = typeof window !== 'undefined';

export const initAnalytics = () => {
  if (!isBrowser || !posthogKey) {
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    capture_pageview: true,
    person_profiles: 'identified_only',
  });
};

export const trackEvent = (eventName: AnalyticsEvent, properties: Record<string, string> = {}) => {
  if (!isBrowser || !posthogKey) {
    console.info('[tracking]', eventName, properties);
    return;
  }

  posthog.capture(eventName, properties);
};
