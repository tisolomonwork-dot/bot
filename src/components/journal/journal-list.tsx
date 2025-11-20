import type { JournalEntry } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Past Entries</CardTitle>
        <CardDescription>Review your previous journal entries.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground">
                  {format(entry.date, 'MMMM d, yyyy - h:mm a')}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-foreground/90">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
