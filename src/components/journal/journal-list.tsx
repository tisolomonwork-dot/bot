'use client';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { type DocumentData } from 'firebase/firestore';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface JournalListProps {
  entries: DocumentData[];
}

export function JournalList({ entries }: JournalListProps) {
  return (
    <div className="h-full">
        {entries.length === 0 ? (
           <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">You have no journal entries yet.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link href={`/journal/${entry.id}`} key={entry.id}>
                <Card className={cn("transition-all hover:border-primary/50", entry.isInsight && "bg-lime-200/10 border-lime-400/20")}>
                  <CardHeader>
                      <div className="flex justify-between items-center">
                          <div className='flex items-baseline gap-2'>
                              <p className="font-semibold text-foreground">
                              {entry.date ? format(entry.date.toDate(), 'dd MMM, yyyy') : 'Date not available'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                              {entry.date ? format(entry.date.toDate(), 'EEEE') : ''}
                              </p>
                          </div>
                          {entry.isInsight && <Lightbulb className="h-5 w-5 text-lime-400" />}
                      </div>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                          {entry.content}
                      </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
