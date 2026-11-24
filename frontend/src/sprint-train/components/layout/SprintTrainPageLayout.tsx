import type { ReactNode } from "react";
import { SprintTrainStyles } from "../../SprintTrain.styles";

export function SprintTrainPageLayout({
  children,
  drawerOpen,
}: {
  children: ReactNode;
  drawerOpen: boolean;
}) {
  return (
    <main
      className={`sprint-train-page min-w-0 bg-slate-50 text-slate-900 ${drawerOpen ? "is-backlog-open" : ""}`}
    >
      <SprintTrainStyles />
      {children}
    </main>
  );
}
