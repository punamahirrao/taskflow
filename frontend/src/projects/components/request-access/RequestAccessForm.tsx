import type { ReactNode } from "react";
import { CreateProjectForm } from "../../Projects.styles";

export function RequestAccessForm({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => Promise<void>;
}) {
  return (
    <CreateProjectForm
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      {children}
    </CreateProjectForm>
  );
}
