import type { ReactNode } from "react";

export function BoardCardFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="flex items-center justify-between border-t border-line px-5 py-3">
      {children}
    </footer>
  );
}
