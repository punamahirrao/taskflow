import Avatar from "../../../common/components/Avatar";

export function BoardTaskAssignee({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-line/70 pt-2">
      <Avatar name={name} photoUrl={photoUrl} size={26} />
      <span className="truncate text-xs font-medium text-muted">{name}</span>
    </div>
  );
}
