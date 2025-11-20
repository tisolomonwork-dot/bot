'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { JournalEntryForm } from './journal-entry-form';

interface JournalEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JournalEntryDialog({ open, onOpenChange }: JournalEntryDialogProps) {

    const handleSave = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
                <DialogDescription>
                    What's on your mind? Log a trade, a feeling, or an observation.
                </DialogDescription>
                </DialogHeader>
                <JournalEntryForm onSave={handleSave} />
            </DialogContent>
        </Dialog>
    );
}
