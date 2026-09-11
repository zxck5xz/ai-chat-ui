'use client';

import { DebatePanel } from '@/components/debate';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HelpButton } from '@/components/shared';

export default function DebatePage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/chat">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Chat
          </Button>
        </Link>
        <HelpButton feature="multi-agent-debate" />
      </div>
      <DebatePanel />
    </div>
  );
}
