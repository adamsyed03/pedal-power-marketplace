import posthog from 'posthog-js';

export type AnalyticsEvent =
  | 'site_loaded'
  | 'phone_call_click'
  | 'whatsapp_click'
  | 'test_ride_click'
  | 'test_ride_form_submit'
  | 'primary_cta_click'
  | 'savings_quiz_route_view';

const fallbackPosthogKey = 'phc_AsUGwDMvHs5gKmH5ayPcu2kWPFHRijRJD4fq43CoE56e';
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || fallbackPosthogKey;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const isBrowser = typeof window !== 'undefined';
const posthogKeySource = import.meta.env.VITE_POSTHOG_KEY ? 'env' : 'fallback';

type AnalyticsWindow = Window & {
  posthog?: typeof posthog;
  __pogonAnalytics?: {
    packageLoaded: boolean;
    keyPresent: boolean;
    host: string;
    initialized: boolean;
    keySource: 'env' | 'fallback';
    sessionId?: string;
    sessionRecordingStarted?: boolean;
    sessionReplayUrl?: string;
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
    keySource: posthogKeySource,
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
      enabled: true,
      maskAllInputs: true,
    },
    loaded: (posthogInstance) => {
      analyticsWindow.__pogonAnalytics = {
        packageLoaded: true,
        keyPresent: true,
        keySource: posthogKeySource,
        host: posthogHost,
        initialized: true,
        sessionId: posthogInstance.get_session_id(),
        sessionRecordingStarted: posthogInstance.sessionRecordingStarted(),
        sessionReplayUrl: posthogInstance.get_session_replay_url(),
      };
      posthogInstance.startSessionRecording(true);
      window.setTimeout(() => {
        analyticsWindow.__pogonAnalytics = {
          packageLoaded: true,
          keyPresent: true,
          keySource: posthogKeySource,
          host: posthogHost,
          initialized: true,
          sessionId: posthogInstance.get_session_id(),
          sessionRecordingStarted: posthogInstance.sessionRecordingStarted(),
          sessionReplayUrl: posthogInstance.get_session_replay_url(),
        };
        posthogInstance.capture('session_replay_debug', {
          source: 'posthog_js_init',
          keySource: posthogKeySource,
          sessionRecordingStarted: String(posthogInstance.sessionRecordingStarted()),
          sessionReplayUrl: posthogInstance.get_session_replay_url(),
        });
      }, 1500);
      posthogInstance.capture('site_loaded', {
        source: 'posthog_js_init',
        keySource: posthogKeySource,
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
