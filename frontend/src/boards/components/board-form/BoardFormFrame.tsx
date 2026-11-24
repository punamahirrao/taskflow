import type { ReactNode } from "react";

export function BoardFormFrame({
  children,
  busy,
  onSubmit,
}: {
  children: ReactNode;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        aria-busy={busy}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-line bg-surface p-6 text-content shadow-xl"
      >
        {children}
      </form>
    </div>
  );
}
