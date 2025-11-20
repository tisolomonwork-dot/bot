'use client';

import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalList } from "@/components/journal/journal-list";
import { useCollection } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Reflect on your trades, strategies, and market observations.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1">
          <JournalEntryForm />
        </div>
        <div className="lg:col-span-2">
          {userLoading || entriesLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <JournalList entries={entries || []} />
          )}
        </div>
      </div>
    </main>
  );
}

// Add Skeleton Card for loading state
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full">{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);
const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">{children}</div>
);
