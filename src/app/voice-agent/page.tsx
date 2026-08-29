'use client';

import { VoiceAgentPanel } from '@/components/voice-agent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VoiceAgentPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link href="/chat">
          <Button variant="ghost" className="flex items-center gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to Chat
          </Button>
        </Link>
      </div>
      <VoiceAgentPanel />
    </div>
  );
}
