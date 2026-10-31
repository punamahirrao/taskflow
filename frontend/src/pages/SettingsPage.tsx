import { Palette } from "lucide-react";
import { ThemePicker } from "../features/settings/components/ThemePicker";
import { useTheme } from "../features/settings/hooks/useTheme";
import { useTranslation } from "../shared/i18n/hooks/useTranslation";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [pendingLanguage, setPendingLanguage] = useState(language);
  const [languageSaved, setLanguageSaved] = useState(false);

  function saveLanguage() {
    setLanguage(pendingLanguage);
    setLanguageSaved(true);
  }

  return <main data-testid="page-settings" className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-5xl">
    <header className="mb-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Make TaskFlow yours</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{t("settings.title")}</h2><p className="mt-2 text-sm text-slate-500">{t("settings.subtitle")}</p></header>
    <section aria-labelledby="appearance-heading" className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Palette size={19} /></span><div><h3 id="appearance-heading" className="font-semibold text-slate-900">{t("settings.appearance")}</h3><p className="text-xs text-slate-500">{t("settings.currentTheme")}: <span className="font-semibold">{t(`theme.${theme}`)}</span></p></div></div><ThemePicker selected={theme} onSelect={setTheme} /></section>
    <section aria-labelledby="language-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="max-w-md"><h3 id="language-heading" className="font-semibold text-slate-900">{t("settings.language")}</h3><p className="mt-1 text-xs text-slate-500">{t("settings.languageDescription")}</p><label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="language-select">{t("settings.language")}</label><select id="language-select" data-testid="settings-language-select" value={pendingLanguage} onChange={(event) => { setPendingLanguage(event.target.value as "en" | "sv"); setLanguageSaved(false); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"><option value="en">{t("language.english")}</option><option value="sv">{t("language.swedish")}</option></select><div className="mt-4 flex items-center gap-3"><button type="button" data-testid="settings-language-save" onClick={saveLanguage} disabled={pendingLanguage === language} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{t("common.save")}</button>{languageSaved && <p role="status" className="text-sm text-emerald-700">{t("settings.languageSaved")}</p>}</div></div></section>
  </div></main>;
}
