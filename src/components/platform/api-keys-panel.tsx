'use client';

import { useState } from 'react';
import type { ApiKey, CreatedKey, Scope, TierLimits } from '@/types/platform';
import { Check, Copy, KeyRound, RotateCw, Trash2, TriangleAlert } from 'lucide-react';

const ALL_SCOPES: Scope[] = [
  'agent:run',
  'agent:stream',
  'structured:generate',
  'schema:read',
  'schema:write',
  'usage:read',
  'admin',
];

interface ApiKeysPanelProps {
  keys: ApiKey[];
  newKey: CreatedKey | null;
  limits: TierLimits | null;
  loading: boolean;
  onCreate: (name: string, options: { scopes?: Scope[]; expiresInDays?: number }) => void;
  onRevoke: (keyId: string) => void;
  onRotate: (keyId: string) => void;
  onDismissNewKey: () => void;
}

export function ApiKeysPanel({
  keys,
  newKey,
  limits,
  loading,
  onCreate,
  onRevoke,
  onRotate,
  onDismissNewKey,
}: ApiKeysPanelProps) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [expiresInDays, setExpiresInDays] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => k.status === 'active');
  const atCap = limits ? activeKeys.length >= limits.max_keys : false;

  const toggleScope = (scope: Scope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreate = () => {
    if (!name.trim() || atCap) return;
    onCreate(name.trim(), {
      scopes: scopes.length > 0 ? scopes : undefined,
      expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
    });
    setName('');
    setScopes([]);
    setExpiresInDays('');
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey.plaintext_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the key stays visible for manual selection
    }
  };

  return (
    <div className="space-y-4">
      {/* The plaintext key exists only in this panel — never fetched again */}
      {newKey && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-900">{newKey.warning}</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded border border-amber-200 bg-white px-2 py-1.5 font-mono text-xs">
                  {newKey.plaintext_key}
                </code>
                <button
                  onClick={copyKey}
                  className="flex shrink-0 items-center gap-1 rounded border border-amber-300 bg-white px-2 py-1.5 text-xs hover:bg-amber-100"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button
                onClick={onDismissNewKey}
                className="mt-2 text-xs text-amber-700 underline hover:text-amber-900"
              >
                I have saved it — dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <KeyRound size={14} />
          Create API key
        </h3>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. production-backend)"
            className="w-full rounded border px-3 py-2 text-sm"
          />

          <div>
            <p className="mb-1.5 text-xs text-gray-500">
              Scopes — leave empty to use the tier defaults
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SCOPES.map((scope) => (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`rounded-full border px-2 py-0.5 font-mono text-xs ${
                    scopes.includes(scope)
                      ? 'border-blue-300 bg-blue-100 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value.replace(/\D/g, ''))}
              placeholder="Expires in days (optional)"
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim() || atCap}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create key'}
            </button>
          </div>

          {limits && (
            <p className={`text-xs ${atCap ? 'text-red-600' : 'text-gray-500'}`}>
              {activeKeys.length} / {limits.max_keys} active keys on the {limits.tier} tier
              {atCap && ' — revoke a key or upgrade to create more'}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-2.5">
          <h3 className="text-sm font-medium">Keys ({keys.length})</h3>
        </div>

        {keys.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No keys yet. Create one above to start calling the metered API.
          </p>
        ) : (
          <div className="divide-y">
            {keys.map((key) => (
              <div key={key.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{key.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        key.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {key.status}
                    </span>
                  </div>

                  <code className="mt-0.5 block font-mono text-xs text-gray-500">
                    {key.key_prefix}…
                  </code>

                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at
                      ? ` · Last used ${new Date(key.last_used_at).toLocaleString()}`
                      : ' · Never used'}
                    {key.expires_at &&
                      ` · Expires ${new Date(key.expires_at).toLocaleDateString()}`}
                  </p>
                </div>

                {key.status === 'active' && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => onRotate(key.id)}
                      title="Rotate — revokes this key and issues a replacement"
                      className="rounded border p-1.5 text-gray-600 hover:bg-gray-50"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      onClick={() =>
                        confirmRevoke === key.id ? onRevoke(key.id) : setConfirmRevoke(key.id)
                      }
                      onBlur={() => setConfirmRevoke(null)}
                      title="Revoke"
                      className={`rounded border p-1.5 ${
                        confirmRevoke === key.id
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {confirmRevoke === key.id ? (
                        <span className="text-xs">Confirm?</span>
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
