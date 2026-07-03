import { getSettings } from "@/lib/radar/settings";
import { SettingsForm } from "../_components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <p className="r-eyebrow">Configuration</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Settings</h1>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
