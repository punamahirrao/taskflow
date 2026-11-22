import type { ComponentPropsWithoutRef } from "react";

/** Semantic HTML tags that carry the shared Tailwind design system. */
export const Page = ({ className = "", ...props }: ComponentPropsWithoutRef<"main">) => (
  <main className={`min-h-screen min-w-0 bg-canvas text-content ${className}`} {...props} />
);
export const Panel = ({ className = "", ...props }: ComponentPropsWithoutRef<"section">) => (
  <section
    className={`rounded-2xl border border-line bg-surface shadow-sm ${className}`}
    {...props}
  />
);
export const PanelTitle = ({ className = "", ...props }: ComponentPropsWithoutRef<"h2">) => (
  <h2 className={`text-sm font-semibold text-content ${className}`} {...props} />
);
export const MutedText = ({ className = "", ...props }: ComponentPropsWithoutRef<"p">) => (
  <p className={`text-sm text-muted ${className}`} {...props} />
);
export const PrimaryButton = ({ className = "", ...props }: ComponentPropsWithoutRef<"button">) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
