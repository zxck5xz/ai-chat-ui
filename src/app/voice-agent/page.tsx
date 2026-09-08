'use client';

import { VoiceAgentPanel } from '@/components/voice-agent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HelpButton } from '@/components/shared';

export default function VoiceAgentPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8 flex items-center justify-between">
        <Link href="/chat">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Chat
          </Button>
        </Link>
        <HelpButton feature="voice-agent" />
      </div>
      <VoiceAgentPanel />
    </div>
  );
}
