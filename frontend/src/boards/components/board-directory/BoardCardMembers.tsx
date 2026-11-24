import type { BoardCardProps } from "../../entities/boardCard";

export function BoardCardMembers({ board }: Pick<BoardCardProps, "board">) {
  return (
    <div className="flex -space-x-2">
      {board.members.slice(0, 4).map((member) => (
        <span
          key={member.id}
          title={member.name}
          className="grid size-8 place-items-center overflow-hidden rounded-full border-2 border-surface bg-subtle text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-content"
        >
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="size-full object-cover" />
          ) : (
            member.name.slice(0, 2).toUpperCase()
          )}
        </span>
      ))}
      {board.member_count > 4 && (
        <span className="grid size-8 place-items-center rounded-full border-2 border-surface bg-subtle text-[calc(10px*var(--taskflow-font-scale,1))] text-content">
          +{board.member_count - 4}
        </span>
      )}
    </div>
  );
}
