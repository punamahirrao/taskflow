import type { ReactNode } from "react";
import { BoardPageShell, BoardPageStyles } from "../../BoardPageLayout.styles";

export function BoardWorkspaceLayout({
  children,
  drawerOpen,
}: {
  children: ReactNode;
  drawerOpen: boolean;
}) {
  return (
    <BoardPageShell
      $drawerOpen={drawerOpen}
      className={drawerOpen ? "board-page-details-open" : undefined}
    >
      <BoardPageStyles />
      <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
    </BoardPageShell>
  );
}
