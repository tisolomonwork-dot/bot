import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <div className="grid auto-rows-max items-start gap-4 lg:max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <SettingsForm />
      </div>
    </div>
  );
}
