import type { ReactNode } from "react";
import { MyWorkStyles } from "../../MyWork.styles";
import { WorkPageHeader } from "./WorkPageHeader";
export function WorkPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="my-work" data-testid="page-my-work">
      <MyWorkStyles />
      <WorkPageHeader />
      {children}
    </main>
  );
}
