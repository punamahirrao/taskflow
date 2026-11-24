import type { ReactNode } from "react";

export function CreateSprintForm({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => Promise<void>;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="space-y-3"
    >
      {children}
    </form>
  );
}
