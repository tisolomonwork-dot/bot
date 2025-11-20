'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Lightbulb, CircleDashed } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function EntryPage() {
  const router = useRouter();
  const params = useParams();
  const { entryId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const entryRef = useMemo(() => {
    if (!firestore || !entryId) return null;
    return doc(firestore, 'journal', entryId as string);
  }, [firestore, entryId]);

  const { data: entry, loading: entryLoading } = useDoc(entryRef);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entryRef) return;
    setIsSaving(true);
    try {
      await updateDoc(entryRef, {
        content: content,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'Journal entry updated.' });
      router.push('/journal');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the entry.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFormattedDate = () => {
    if (!entry?.date) return { line1: '', line2: '' };
    const date = entry.date.toDate();
    return {
      line1: format(date, 'dd MMM, yyyy'),
      line2: format(date, 'EEEE'),
    };
  };

  if (entryLoading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 bg-lime-200/20">
          <Skeleton className="h-10 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  const { line1: dateLine1, line2: dateLine2 } = getFormattedDate();

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F5]">
      <header className="flex items-center justify-between p-4 bg-lime-200/20 text-foreground">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <p className="font-semibold">{dateLine1}</p>
            <p className="text-sm text-muted-foreground">{dateLine2}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Lightbulb className="h-6 w-6" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
          >
            {isSaving ? <CircleDashed className="animate-spin" /> : 'Publish'}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full w-full resize-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
          placeholder="Start writing your thoughts..."
        />
      </main>
    </div>
  );
}
