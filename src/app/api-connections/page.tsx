import { SettingsForm } from "@/components/settings/settings-form";

export default function ApiConnectionsPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <div className="grid auto-rows-max items-start gap-4 lg:max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight">API Connections</h1>
        <p className="text-muted-foreground">Manage your exchange API keys below. You can also find these settings under the main Settings page.</p>
        <SettingsForm />
      </div>
    </div>
  );
}
