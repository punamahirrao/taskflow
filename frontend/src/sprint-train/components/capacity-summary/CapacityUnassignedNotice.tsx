export function CapacityUnassignedNotice({
  unassigned,
  outsideTeam,
  onReviewStories,
}: {
  unassigned: number;
  outsideTeam: number;
  onReviewStories: () => void;
}) {
  return (
    <div className="capacity-notice">
      <span>
        {unassigned} pts unassigned
        {outsideTeam > 0 ? ` · ${outsideTeam} pts assigned outside this team` : ""}
      </span>
      <button onClick={onReviewStories}>Review sprint stories</button>
    </div>
  );
}
