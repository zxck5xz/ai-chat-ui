'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Code } from 'lucide-react';
import type { TopRepo } from '@/types/code-review';

interface TopReposProps {
  repos: TopRepo[];
}

export function TopRepos({ repos }: TopReposProps) {
  if (!repos || repos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No repository data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Repositories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {repos.map((repo, index) => (
            <div key={repo.repo} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                <Folder className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-[200px]">{repo.repo}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{repo.review_count} reviews</span>
                <span>•</span>
                <span>{repo.total_issues || 0} issues</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
