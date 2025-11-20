import { StrategiesTabs } from "@/components/strategies/strategies-tabs";

export default function StrategiesPage() {
    return (
        <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
            <h1 className="text-3xl font-bold">Trading Strategies</h1>
            <p className="text-muted-foreground">AI-powered market scanners and analysis.</p>
            <div className="mt-6">
                <StrategiesTabs />
            </div>
        </main>
    );
}
