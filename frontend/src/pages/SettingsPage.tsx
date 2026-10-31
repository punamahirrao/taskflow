import { Palette } from "lucide-react";
import { ThemePicker } from "../features/settings/components/ThemePicker";
import { useTheme } from "../features/settings/hooks/useTheme";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-5xl">
    <header className="mb-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Make TaskFlow yours</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Settings</h2><p className="mt-2 text-sm text-slate-500">Personalize how TaskFlow looks on this device.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Palette size={19} /></span><div><h3 className="font-semibold text-slate-900">Appearance</h3><p className="text-xs text-slate-500">Current theme: <span className="font-semibold">{theme === "professional" ? "Professional" : theme === "night" ? "Night" : "Original"}</span></p></div></div><ThemePicker selected={theme} onSelect={setTheme} /></section>
  </div></main>;
}
