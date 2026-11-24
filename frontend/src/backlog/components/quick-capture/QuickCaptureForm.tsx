import type { ReactNode } from "react";

export function QuickCaptureForm({
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
      className="space-y-4"
    >
      {children}
    </form>
  );
}
