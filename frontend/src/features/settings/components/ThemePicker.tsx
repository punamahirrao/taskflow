import { BriefcaseBusiness, Check, Moon, Sun } from "lucide-react";
import type { ThemeName, ThemeOption } from "../../../entities/theme";
import { THEME_OPTIONS } from "../../../entities/theme";

const ICONS = { original: Sun, professional: BriefcaseBusiness, night: Moon };

export function ThemePicker({ selected, onSelect }: { selected: ThemeName; onSelect: (theme: ThemeName) => void }) {
  return <fieldset><legend className="text-sm font-semibold text-slate-800">Choose a theme</legend><p className="mt-1 text-xs text-slate-500">Your preference is saved on this device and applies throughout TaskFlow.</p><div className="mt-4 grid gap-3 lg:grid-cols-3">{THEME_OPTIONS.map((option) => <ThemeCard key={option.id} option={option} selected={selected === option.id} onSelect={() => onSelect(option.id)} />)}</div></fieldset>;
}

function ThemeCard({ option, selected, onSelect }: { option: ThemeOption; selected: boolean; onSelect: () => void }) {
  const Icon = ICONS[option.id];
  return <button type="button" aria-pressed={selected} onClick={onSelect} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${selected ? "border-indigo-400 bg-indigo-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}>
    <div className="flex items-start justify-between"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon size={16} className="text-indigo-600" />{option.name}</span>{selected && <Check size={17} className="text-indigo-600" />}</div>
    <p className="mt-2 min-h-9 text-xs leading-5 text-slate-500">{option.description}</p>
    <div className="mt-4 flex overflow-hidden rounded-lg border border-black/5"><div className="h-12 flex-1" style={{ background: option.palette[0] }} /><div className="h-12 flex-1" style={{ background: option.palette[1] }} /><div className="h-12 flex-1" style={{ background: option.palette[2] }} /><div className="h-12 flex-1" style={{ background: option.palette[3] }} /></div>
  </button>;
}
