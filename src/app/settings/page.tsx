import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
    return (
        <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings, API keys, and preferences.</p>
            <div className="mt-6">
                <SettingsForm />
            </div>
        </main>
    );
}
