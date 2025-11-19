"use client";

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AiChat } from '@/components/ai-advisor/ai-chat';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-7 w-7" />
        <span className="sr-only">Open AI Chat</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
            <AiChat />
        </DialogContent>
      </Dialog>
    </>
  );
}
