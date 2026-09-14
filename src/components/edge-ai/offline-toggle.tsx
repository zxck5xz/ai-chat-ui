'use client';

import { useState, useEffect } from 'react';

interface OfflineToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function OfflineToggle({ enabled, onToggle }: OfflineToggleProps) {
  const [swRegistered, setSwRegistered] = useState(false);
  const [cachedModels, setCachedModels] = useState<string[]>([]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        setSwRegistered(regs.length > 0);
      });
    }
  }, []);

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('/sw.js');
      setSwRegistered(true);
    } catch {
      // Service worker registration failed
    }
  };

  return (
    <div className="p-3 rounded-lg border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Privacy Mode</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            All inference runs on-device. No data leaves your browser.
          </p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Privacy mode active — zero data leaves browser
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Worker</span>
              <span className={swRegistered ? 'text-emerald-600' : 'text-muted-foreground'}>
                {swRegistered ? 'Registered' : 'Not registered'}
              </span>
            </div>

            {!swRegistered && (
              <button
                onClick={registerServiceWorker}
                className="w-full text-xs px-2 py-1.5 rounded border bg-background hover:bg-secondary"
              >
                Register Service Worker
              </button>
            )}

            {cachedModels.length > 0 && (
              <div>
                <span className="text-muted-foreground">Cached Models:</span>
                <ul className="mt-1 space-y-0.5">
                  {cachedModels.map((m) => (
                    <li key={m} className="text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {!enabled && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>When privacy mode is off:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Cloud fallback is available for complex tasks</li>
            <li>Inference metrics are logged to the server</li>
            <li>Usage analytics help improve the experience</li>
          </ul>
        </div>
      )}
    </div>
  );
}
