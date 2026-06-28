import posthog from 'posthog-js';

export type AnalyticsEvent =
  | 'site_loaded'
  | 'phone_call_click'
  | 'whatsapp_click'
  | 'test_ride_click'
  | 'test_ride_form_submit'
  | 'primary_cta_click';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const isBrowser = typeof window !== 'undefined';

type AnalyticsWindow = Window & {
  posthog?: typeof posthog;
  __pogonAnalytics?: {
    packageLoaded: boolean;
    keyPresent: boolean;
    host: string;
    initialized: boolean;
  };
};

export const initAnalytics = () => {
  if (!isBrowser) {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.posthog = posthog;
  analyticsWindow.__pogonAnalytics = {
    packageLoaded: true,
    keyPresent: Boolean(posthogKey),
    host: posthogHost,
    initialized: false,
  };

  if (!posthogKey) {
    if (isBrowser) {
      console.warn('[posthog] Missing VITE_POSTHOG_KEY. Analytics is disabled for this build.');
    }
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    capture_pageview: true,
    person_profiles: 'identified_only',
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
    },
    loaded: (posthogInstance) => {
      analyticsWindow.__pogonAnalytics = {
        packageLoaded: true,
        keyPresent: true,
        host: posthogHost,
        initialized: true,
      };
      posthogInstance.capture('site_loaded', {
        source: 'posthog_js_init',
      });
    },
  });
};

export const trackEvent = (eventName: AnalyticsEvent, properties: Record<string, string> = {}) => {
  if (!isBrowser || !posthogKey) {
    console.info('[tracking]', eventName, properties);
    return;
  }

  posthog.capture(eventName, properties);
};
