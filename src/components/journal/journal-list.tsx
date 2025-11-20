'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { type DocumentData } from 'firebase/firestore';

interface JournalListProps {
  entries: DocumentData[];
}

export function JournalList({ entries }: JournalListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Past Entries</CardTitle>
        <CardDescription>Review your previous journal entries.</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
           <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">You have no journal entries yet.</p>
           </div>
        ) : (
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground">
                  {entry.date ? format(entry.date.toDate(), 'MMMM d, yyyy - h:mm a') : 'Date not available'}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-foreground/90">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
