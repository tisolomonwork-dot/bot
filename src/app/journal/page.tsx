import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalList } from "@/components/journal/journal-list";
import { journalEntries } from "@/lib/mock-data";

export default function JournalPage() {
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
            <JournalList entries={journalEntries} />
        </div>
      </div>
    </main>
  );
}
