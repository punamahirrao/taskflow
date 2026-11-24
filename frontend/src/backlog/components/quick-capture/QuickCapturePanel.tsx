import type { ReactNode } from "react";

export function QuickCapturePanel({
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-title"
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        {children}
      </section>
    </div>
  );
}
