'use client';

import { ToolAgentPanel } from '@/components/tool-agent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ToolAgentPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/chat">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Chat
          </Button>
        </Link>
      </div>
      <ToolAgentPanel />
    </div>
  );
}
