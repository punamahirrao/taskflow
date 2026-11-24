import type { ReactNode } from "react";
import { BoardPageShell } from "../../BoardPageLayout.styles";

export function BoardsDirectoryLayout({ children }: { children: ReactNode }) {
  return (
    <BoardPageShell>
      <div className="mx-auto max-w-[1500px]">{children}</div>
    </BoardPageShell>
  );
}
