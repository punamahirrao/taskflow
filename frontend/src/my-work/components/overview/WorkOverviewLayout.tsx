import type { ReactNode } from "react";
export function WorkOverviewLayout({
  summary,
  tasks,
  calendar,
  approvals,
  time,
  activity,
}: {
  summary: ReactNode;
  tasks: ReactNode;
  calendar: ReactNode;
  approvals: ReactNode;
  time: ReactNode;
  activity: ReactNode;
}) {
  return (
    <>
      {summary}
      <div className="my-work-main-grid">
        {tasks}
        {calendar}
      </div>
      <div className="my-work-bottom-grid">
        {approvals}
        {time}
        {activity}
      </div>
    </>
  );
}
