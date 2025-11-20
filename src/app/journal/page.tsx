'use client';

import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalList } from "@/components/journal/journal-list";
import { useCollection } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SignInPrompt() {
    const { signIn } = useUser();
    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Please Sign In</h2>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-muted-foreground">You need to be logged in to create and view journal entries.</p>
                <Button onClick={() => signIn('google')}>Sign In with Google</Button>
            </CardContent>
        </Card>
    )
}

export default function JournalPage() {
  const { user, loading: userLoading, signIn } = useUser();
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
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                </Card>
            ): user ? (
                <JournalEntryForm />
            ) : (
                <SignInPrompt />
            )}
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
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
          ) : user ? (
            <JournalList entries={entries || []} />
          ) : (
             <Card className="h-full">
                <CardContent className="flex items-center justify-center h-[60vh]">
                     <p className="text-muted-foreground">Sign in to view your journal entries.</p>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </main>
  );
}
