import type { ReactNode } from "react";

export function BoardCardOpenArea({
  children,
  onOpen,
}: {
  children: ReactNode;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className="flex flex-1 flex-col p-5 text-left">
      {children}
    </button>
  );
}
