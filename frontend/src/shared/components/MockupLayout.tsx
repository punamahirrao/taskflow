import type { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6"><h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p><p className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Mockup – sample data</p></header>
    {children}
  </div></main>;
}

export const Card = ({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) =>
  <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{title && <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>}{children}</section>;

export const Avatar = ({ name, color = "bg-purple-100 text-purple-700" }: { name: string; color?: string }) =>
  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`}>{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>;
