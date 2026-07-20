type MetaPixelFunction = (...args: unknown[]) => void;

type MetaPixelWindow = Window & {
  fbq?: MetaPixelFunction;
};

export const trackMetaLead = (source: string) => {
  if (typeof window === 'undefined') return;

  const fbq = (window as MetaPixelWindow).fbq;
  if (typeof fbq !== 'function') return;

  fbq('track', 'Lead', {
    content_name: 'Website lead form',
    content_category: source,
  });
};
