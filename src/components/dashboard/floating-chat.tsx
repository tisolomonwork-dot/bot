'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { AiChat } from '@/components/ai-advisor/ai-chat';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
        <span className="sr-only">Open AI Chat</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 bg-background/90 backdrop-blur-sm">
          <AiChat />
        </DialogContent>
      </Dialog>
    </>
  );
}
