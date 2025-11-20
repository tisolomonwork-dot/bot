'use client';

import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalList } from "@/components/journal/journal-list";
import { useCollection } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

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
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
            <p className="text-lg text-muted-foreground mt-2">
            Reflect on your trades, strategies, and market observations.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-1">
                {userLoading ? (
                    <Skeleton className="h-80 w-full" />
                ): (
                    <JournalEntryForm />
                )}
            </div>
            <div className="lg:col-span-2">
            {isLoading ? (
                <Skeleton className="h-[60vh] w-full" />
            ) : (
                <JournalList entries={entries || []} />
            )}
            </div>
        </div>
        </main>
    </div>
  );
}
