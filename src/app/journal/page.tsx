'use client';

import { JournalEntryDialog } from "@/components/journal/journal-entry-dialog";
import { JournalList } from "@/components/journal/journal-list";
import { useCollection } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { collection, query, orderBy, where, limit, startAfter, getDocs, type QueryDocumentSnapshot, type DocumentData } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entries, setEntries] = useState<DocumentData[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);

  const baseQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "journal"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
  }, [user, firestore]);

  const fetchInitialEntries = useCallback(async () => {
    if (!baseQuery) return;
    setInitialLoading(true);
    try {
      const q = query(baseQuery, limit(PAGE_SIZE));
      const documentSnapshots = await getDocs(q);
      const newEntries = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(newEntries);
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(documentSnapshots.docs.length === PAGE_SIZE);
    } catch (e) {
      console.error("Error fetching initial entries:", e);
    } finally {
      setInitialLoading(false);
    }
  }, [baseQuery]);

  useEffect(() => {
    if (user && firestore) {
      fetchInitialEntries();
    }
  }, [user, firestore, fetchInitialEntries]);


  const loadMore = async () => {
    if (!baseQuery || !lastVisible) return;
    setMoreLoading(true);
    try {
        const q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE));
        const documentSnapshots = await getDocs(q);
        const newEntries = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(prev => [...prev, ...newEntries]);
        const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(documentSnapshots.docs.length === PAGE_SIZE);
    } catch(e) {
        console.error("Error loading more entries:", e);
    } finally {
        setMoreLoading(false);
    }
  };

  const isLoading = userLoading || initialLoading;

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
                    <>
                      <JournalList entries={entries || []} />
                      {hasMore && (
                        <div className="text-center mt-8">
                           <Button onClick={loadMore} disabled={moreLoading}>
                            {moreLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Load More
                           </Button>
                        </div>
                      )}
                    </>
                )}
            </div>
        </main>
        <footer className="sticky bottom-0 bg-gradient-to-t from-background to-transparent p-4 flex justify-center">
            <Button size="lg" className="rounded-full shadow-lg" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Start a new entry
            </Button>
        </footer>
        <JournalEntryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={fetchInitialEntries} />
    </div>
  );
}
