'use client';

import { JournalEntryDialog } from "@/components/journal/journal-entry-dialog";
import { JournalList } from "@/components/journal/journal-list";
import { useCollection } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const entriesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "journal"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
  }, [user, firestore]);

  const { data: entries, loading: entriesLoading } = useCollection(entriesQuery);
  const isLoading = userLoading || entriesLoading;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
            <div className="text-left max-w-3xl mx-auto mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
                <p className="text-lg text-muted-foreground mt-1">
                    Reflect on your trades, strategies, and market observations.
                </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : (
                    <JournalList entries={entries || []} />
                )}
            </div>
        </main>
        <footer className="sticky bottom-0 bg-gradient-to-t from-background to-transparent p-4 flex justify-center">
            <Button size="lg" className="rounded-full shadow-lg" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Start a new entry
            </Button>
        </footer>
        <JournalEntryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
