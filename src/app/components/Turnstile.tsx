import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const [error, setError] = useState('');
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!siteKey || !container.current) return;
    let disposed = false;
    let widgetId = '';

    const fail = (errorCode?: unknown) => {
      if (disposed) return;
      onTokenRef.current('');
      setError('Bezbednosna provera nije mogla da se učita. Osvežite stranicu i pokušajte ponovo.');
      const safeCode = typeof errorCode === 'string' && /^\d{3,8}$/.test(errorCode) ? errorCode : 'UNAVAILABLE';
      console.error({ component: 'Turnstile', errorCode: safeCode });
    };

    const render = () => {
      if (disposed || widgetId || !container.current || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(container.current, {
          sitekey: siteKey,
          action: 'checkout',
          appearance: 'always',
          callback: (token: string) => {
            setError('');
            onTokenRef.current(token);
          },
          'expired-callback': () => onTokenRef.current(''),
          'timeout-callback': () => onTokenRef.current(''),
          'error-callback': fail,
          theme: 'dark',
        });
      } catch {
        fail();
      }
    };

    let script = document.querySelector<HTMLScriptElement>('script[data-pogon-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.pogonTurnstile = 'true';
      document.head.appendChild(script);
    }

    if (window.turnstile) render();
    else {
      script.addEventListener('load', render, { once: true });
      script.addEventListener('error', fail, { once: true });
    }

    return () => {
      disposed = true;
      script?.removeEventListener('load', render);
      script?.removeEventListener('error', fail);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return <p className="text-xs text-amber-200">Bezbednosna provera nije konfigurisana.</p>;
  return (
    <div>
      <div ref={container} className="min-h-[65px]" />
      {error && <p role="alert" className="mt-2 text-xs leading-5 text-amber-200">{error}</p>}
    </div>
  );
}
