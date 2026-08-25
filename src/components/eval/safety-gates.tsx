'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { SafetyGate, GateCheckResult } from '@/types/eval';

interface SafetyGatesProps {
  gates: SafetyGate[];
  gateCheckResult: GateCheckResult | null;
}

export function SafetyGates({ gates, gateCheckResult }: SafetyGatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Safety Gates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gates.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No safety gates configured
          </div>
        ) : (
          <div className="space-y-3">
            {gates.map((gate) => {
              const violation = gateCheckResult?.violations.find(v => v.metric === gate.metric);
              const passed = !violation;

              return (
                <div
                  key={gate.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {passed ? (
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{gate.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {gate.metric}: {gate.threshold}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {violation && (
                      <span className="text-sm text-red-500">
                        Actual: {violation.actual.toFixed(2)}
                      </span>
                    )}
                    <Badge variant={gate.enabled ? (passed ? 'default' : 'destructive') : 'secondary'}>
                      {gate.enabled ? (passed ? 'Pass' : 'Fail') : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {gateCheckResult && (
          <div className={`mt-4 p-3 rounded-lg ${gateCheckResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`font-medium ${gateCheckResult.passed ? 'text-green-700' : 'text-red-700'}`}>
              {gateCheckResult.passed ? 'All gates passed' : `${gateCheckResult.violations.length} gate(s) failed`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
