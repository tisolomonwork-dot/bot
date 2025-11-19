import { StrategiesTabs } from "@/components/strategies/strategies-tabs";

export default function StrategiesPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <div className="grid auto-rows-max items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Strategies & Signals</h1>
        <StrategiesTabs />
      </div>
    </div>
  );
}
