'use client';

import { useState } from 'react';
import type { JsonSchemaLike, SchemaRecord, StructuredResult } from '@/types/platform';
import { CheckCircle2, ChevronDown, ChevronRight, Play, Save, Trash2, XCircle } from 'lucide-react';

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "priority": { "type": "string", "enum": ["low", "medium", "high"] },
    "estimate_hours": { "type": "number", "minimum": 0, "maximum": 200 },
    "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 5 }
  },
  "required": ["title", "priority"],
  "additionalProperties": false
}`;

const OUTCOME_STYLES: Record<string, { label: string; className: string }> = {
  valid: { label: 'Valid', className: 'bg-green-100 text-green-700' },
  invalid_json: { label: 'Unparseable JSON', className: 'bg-red-100 text-red-700' },
  schema_violation: { label: 'Schema violation', className: 'bg-amber-100 text-amber-700' },
  empty_response: { label: 'Empty response', className: 'bg-gray-100 text-gray-600' },
  llm_error: { label: 'LLM error', className: 'bg-red-100 text-red-700' },
};

interface SchemaPlaygroundProps {
  schemas: SchemaRecord[];
  result: StructuredResult | null;
  generating: boolean;
  loading: boolean;
  onGenerate: (
    prompt: string,
    schema?: JsonSchemaLike,
    schemaName?: string,
    maxAttempts?: number
  ) => void;
  onSaveSchema: (name: string, schema: JsonSchemaLike, description?: string) => void;
  onDeleteSchema: (name: string) => void;
}

export function SchemaPlayground({
  schemas,
  result,
  generating,
  loading,
  onGenerate,
  onSaveSchema,
  onDeleteSchema,
}: SchemaPlaygroundProps) {
  const [prompt, setPrompt] = useState(
    'Create a task for migrating the billing service to Postgres.'
  );
  const [schemaText, setSchemaText] = useState(EXAMPLE_SCHEMA);
  const [schemaName, setSchemaName] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  /** Parse the editor contents, surfacing a syntax error instead of throwing. */
  const parseSchema = (): JsonSchemaLike | null => {
    try {
      const parsed = JSON.parse(schemaText) as JsonSchemaLike;
      setParseError(null);
      return parsed;
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    // A saved schema takes precedence over whatever sits in the editor
    if (selectedSchema) {
      onGenerate(prompt, undefined, selectedSchema, maxAttempts);
      return;
    }

    const schema = parseSchema();
    if (schema) onGenerate(prompt, schema, undefined, maxAttempts);
  };

  const handleSave = () => {
    if (!schemaName.trim()) return;
    const schema = parseSchema();
    if (schema) {
      onSaveSchema(schemaName.trim(), schema);
      setSchemaName('');
    }
  };

  const handlePickSchema = (name: string) => {
    setSelectedSchema(name);
    const record = schemas.find((s) => s.name === name);
    if (record) setSchemaText(JSON.stringify(record.schema, null, 2));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full resize-none rounded border px-3 py-2 text-sm"
              placeholder="Describe what to generate..."
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">JSON Schema</label>
              {schemas.length > 0 && (
                <select
                  value={selectedSchema}
                  onChange={(e) => handlePickSchema(e.target.value)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  <option value="">Use editor below</option>
                  {schemas.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (v{s.version})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              value={schemaText}
              onChange={(e) => {
                setSchemaText(e.target.value);
                setSelectedSchema('');
                setParseError(null);
              }}
              rows={14}
              spellCheck={false}
              className={`w-full resize-none rounded border px-3 py-2 font-mono text-xs ${
                parseError ? 'border-red-300' : ''
              }`}
            />
            {parseError && <p className="mt-1 text-xs text-red-600">{parseError}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              placeholder="Save as (name)"
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={handleSave}
              disabled={loading || !schemaName.trim()}
              className="flex items-center gap-1.5 rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={13} />
              Save
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Max attempts</label>
            <input
              type="number"
              min={1}
              max={6}
              value={maxAttempts}
              onChange={(e) =>
                setMaxAttempts(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))
              }
              className="w-16 rounded border px-2 py-1 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="ml-auto flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Play size={13} />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {!result && !generating && (
            <div className="flex h-full min-h-48 items-center justify-center rounded-lg border border-dashed text-center text-sm text-gray-400">
              Run a generation to see the validation and repair rounds
            </div>
          )}

          {generating && (
            <div className="flex h-full min-h-48 items-center justify-center rounded-lg border text-sm text-gray-500">
              Generating and validating...
            </div>
          )}

          {result && (
            <>
              <div
                className={`rounded-lg border p-3 ${
                  result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {result.success ? 'Valid output' : 'Failed validation'}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {result.total_attempts} attempt{result.total_attempts === 1 ? '' : 's'} ·{' '}
                    {result.duration_ms}ms
                  </span>
                </div>
                {result.error && <p className="mt-2 text-xs text-red-700">{result.error}</p>}
              </div>

              {result.data !== null && (
                <div className="rounded-lg border">
                  <div className="border-b px-3 py-2 text-xs font-medium text-gray-600">
                    Validated output
                  </div>
                  <pre className="max-h-64 overflow-auto p-3 font-mono text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="rounded-lg border">
                <div className="border-b px-3 py-2 text-xs font-medium text-gray-600">
                  Attempts — each failure feeds its errors into the next prompt
                </div>
                <div className="divide-y">
                  {result.attempts.map((attempt) => {
                    const style = OUTCOME_STYLES[attempt.outcome] ?? OUTCOME_STYLES.llm_error;
                    const isOpen = expanded === attempt.attempt;

                    return (
                      <div key={attempt.attempt}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : attempt.attempt)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                        >
                          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <span className="text-xs font-medium">Attempt {attempt.attempt}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${style.className}`}
                          >
                            {style.label}
                          </span>
                          {attempt.errors.length > 0 && (
                            <span className="text-[10px] text-gray-500">
                              {attempt.errors.length} error{attempt.errors.length === 1 ? '' : 's'}
                            </span>
                          )}
                          <span className="ml-auto text-[10px] text-gray-400">
                            {attempt.duration_ms}ms
                          </span>
                        </button>

                        {isOpen && (
                          <div className="space-y-2 bg-gray-50 px-3 py-2">
                            {attempt.errors.length > 0 && (
                              <div>
                                <p className="mb-1 text-[10px] font-medium uppercase text-gray-500">
                                  Validation errors
                                </p>
                                <ul className="space-y-0.5">
                                  {attempt.errors.map((err, i) => (
                                    <li key={i} className="font-mono text-[11px] text-red-700">
                                      {err.path || '(root)'}: {err.message}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              <p className="mb-1 text-[10px] font-medium uppercase text-gray-500">
                                Raw model output
                              </p>
                              <pre className="max-h-40 overflow-auto rounded border bg-white p-2 font-mono text-[11px]">
                                {attempt.raw_output || '(empty)'}
                              </pre>
                            </div>

                            {attempt.repair_prompt && (
                              <div>
                                <p className="mb-1 text-[10px] font-medium uppercase text-gray-500">
                                  Repair prompt sent next
                                </p>
                                <pre className="max-h-40 overflow-auto rounded border border-blue-200 bg-blue-50 p-2 font-mono text-[11px]">
                                  {attempt.repair_prompt}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {schemas.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b px-4 py-2.5">
            <h3 className="text-sm font-medium">Registered schemas ({schemas.length})</h3>
          </div>
          <div className="divide-y">
            {schemas.map((schema) => (
              <div key={schema.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{schema.name}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                      v{schema.version}
                    </span>
                  </div>
                  {schema.description && (
                    <p className="truncate text-xs text-gray-500">{schema.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handlePickSchema(schema.name)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDeleteSchema(schema.name)}
                    className="rounded border p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
