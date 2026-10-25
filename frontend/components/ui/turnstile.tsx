'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ShieldCheck } from 'lucide-react';

interface TurnstileProps {
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// Official Cloudflare Always-Pass Test Sitekey (for development and preview)
// Users can override this with NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY in production
const DEFAULT_TEST_SITEKEY = '1x00000000000000000000AA';

export function Turnstile({
  onVerify,
  onExpire,
  onError,
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [verified, setVerified] = useState(false);

  const sitekey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY || DEFAULT_TEST_SITEKEY;

  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme: 'light',
        size: 'flexible',
        callback: (token: string) => {
          setVerified(true);
          onVerify?.(token);
        },
        'expired-callback': () => {
          setVerified(false);
          onExpire?.();
        },
        'error-callback': () => {
          setVerified(false);
          onError?.();
        },
      });
    } catch (e) {
      console.warn('Turnstile render warning:', e);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [isScriptReady, sitekey, onVerify, onExpire, onError]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setIsScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-[65px] min-w-[300px]" />

      {verified && (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Cloudflare Human Verified
        </div>
      )}
    </div>
  );
}
