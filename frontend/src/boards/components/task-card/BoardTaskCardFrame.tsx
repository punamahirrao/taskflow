import type { ReactNode } from "react";

export function BoardTaskCardFrame({
  taskId,
  title,
  onOpen,
  children,
}: {
  taskId: number;
  title: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <article
      data-testid={`board-task-${taskId}`}
      tabIndex={0}
      aria-label={`NEX-${taskId}: ${title}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group relative min-w-0 cursor-pointer rounded-lg border border-line bg-surface p-3 shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </article>
  );
}
