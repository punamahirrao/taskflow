export function BoardTaskTitle({ taskId, title }: { taskId: number; title: string }) {
  return (
    <>
      <span className="mb-1 block text-[11px] font-bold tracking-wide text-accent">
        NEX-{taskId}
      </span>
      <h4 className="line-clamp-2 break-words text-sm font-semibold leading-5 text-content">
        {title}
      </h4>
    </>
  );
}
