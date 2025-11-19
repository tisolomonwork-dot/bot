
'use client'
import { AiChat } from '@/components/ai-advisor/ai-chat';

export default function AiAdvisorPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <div className="grid auto-rows-max items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Advisor</h1>
        <AiChat />
      </div>
    </div>
  );
}
