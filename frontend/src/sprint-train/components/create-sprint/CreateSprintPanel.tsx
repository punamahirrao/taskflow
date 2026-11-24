import type { ReactNode } from "react";

export function CreateSprintPanel({
  children,
  saving,
  onClose,
}: {
  children: ReactNode;
  saving: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sprint-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        {children}
      </section>
    </div>
  );
}
