'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { DeployApproval } from '@/types/eval';

interface DeployApprovalsProps {
  approvals: DeployApproval[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function DeployApprovals({ approvals, loading, onApprove, onReject }: DeployApprovalsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deploy Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const resolvedApprovals = approvals.filter(a => a.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Deploy Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 && resolvedApprovals.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No deploy approvals
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Pending</div>
                <div className="space-y-2">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="font-medium">Deploy Request</div>
                          <div className="text-sm text-muted-foreground">
                            {approval.model_version} • {approval.total_cases} cases • {approval.avg_latency_ms?.toFixed(0)}ms
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onApprove(approval.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(approval.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Approvals */}
            {resolvedApprovals.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">History</div>
                <div className="space-y-2">
                  {resolvedApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg opacity-75">
                      <div className="flex items-center gap-3">
                        {approval.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">Deploy Request</div>
                          <div className="text-sm text-muted-foreground">
                            {approval.model_version} • {new Date(approval.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant={approval.status === 'approved' ? 'default' : 'destructive'}>
                        {approval.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
