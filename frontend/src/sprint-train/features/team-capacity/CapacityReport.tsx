import type { CapacityReportProps } from "../../entities/capacityPlanning";
import type { AbsenceInput, HolidayInput } from "../../entities/capacity";
import { useSprintCapacity } from "../../hooks/useSprintCapacity";
import { SprintPlanningDetails } from "../sprint-planning/SprintPlanningDetails";
import { CapacitySummary } from "../capacity-summary/CapacitySummary";
import AvailabilityForm from "../availability/AvailabilityForm";
import { CapacityLoadState } from "../../components/team-capacity/CapacityLoadState";
import { CapacitySprintSummary } from "../../components/team-capacity/CapacitySprintSummary";
import { CapacityReportNotice } from "../../components/team-capacity/CapacityReportNotice";
import { CapacityDatesNotice } from "../../components/team-capacity/CapacityDatesNotice";
import { CapacityDisclaimer } from "../../components/team-capacity/CapacityDisclaimer";
import { CapacityPlanForm } from "../../components/capacity-plan/CapacityPlanForm";
import { CapacityMemberTable } from "../../components/capacity-plan/CapacityMemberTable";
import { CapacityCalendar } from "../../components/capacity-calendar/CapacityCalendar";
import { CapacityLogsLayout } from "../../components/capacity-logs/CapacityLogsLayout";
import { CapacityLogPanel } from "../../components/capacity-logs/CapacityLogPanel";
import { CapacityLogList } from "../../components/capacity-logs/CapacityLogList";
import { CapacityLogEmptyState } from "../../components/capacity-logs/CapacityLogEmptyState";
import { CapacityLogMore } from "../../components/capacity-logs/CapacityLogMore";
import { CapacityAbsenceEntry } from "../../components/capacity-logs/CapacityAbsenceEntry";
import { CapacityHolidayEntry } from "../../components/capacity-logs/CapacityHolidayEntry";

export function CapacityReport({ sprint, onSprintUpdated, onReviewStories }: CapacityReportProps) {
  const capacity = useSprintCapacity(sprint, onSprintUpdated);
  const {
    data,
    draft,
    setDraft,
    dirty,
    setDirty,
    busy,
    error,
    notice,
    form,
    setForm,
    expanded,
    setExpanded,
  } = capacity;
  if (!data) return <CapacityLoadState error={error} onRetry={capacity.retry} />;
  const summary = data.summary;
  const canLog = data.members.some((member) => member.can_log_absence);
  const memberName = (id: number) =>
    data.members.find((member) => member.id === id)?.name ?? "Team member";
  const canForecast =
    !busy &&
    !dirty &&
    summary.suggested_capacity_points !== null &&
    sprint.capacity_points !== summary.suggested_capacity_points;
  function changeDraft(id: number, field: "points" | "allocation", value: string) {
    setDraft((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
    setDirty(true);
  }
  async function saveAvailability(input: AbsenceInput | HolidayInput) {
    await capacity.saveAvailability(input);
  }
  const days = data.calendar.slice(0, expanded.calendar ? undefined : 35);
  const absences = data.absences.slice(0, expanded.absences ? undefined : 4);
  const holidays = data.holidays.slice(0, expanded.holidays ? undefined : 4);
  return (
    <>
      <CapacitySprintSummary
        name={sprint.name}
        canManage={data.can_manage}
        canForecast={canForecast}
        workingDays={data.working_days}
        holidayDays={data.holiday_days}
        timeOffMembers={summary.members_with_time_off}
        onForecast={() => void capacity.applyForecast()}
      >
        <SprintPlanningDetails
          sprint={sprint}
          canEdit={data.can_manage}
          onSaved={onSprintUpdated}
        />
      </CapacitySprintSummary>
      {error && <CapacityReportNotice message={error} error />}
      {notice && <CapacityReportNotice message={notice} />}
      {!data.has_dates && <CapacityDatesNotice />}
      <CapacitySummary data={data} sprint={sprint} onReviewStories={onReviewStories} />
      <CapacityPlanForm
        canManage={data.can_manage}
        busy={busy}
        dirty={dirty}
        memberCount={data.members.length}
        onSave={capacity.savePlan}
      >
        <CapacityMemberTable
          members={data.members}
          workingDays={data.working_days}
          canManage={data.can_manage}
          draft={draft}
          busy={busy}
          onDraft={changeDraft}
        />
      </CapacityPlanForm>
      {data.calendar.length > 0 && (
        <CapacityCalendar
          days={days}
          totalCount={data.calendar.length}
          memberCount={summary.member_count}
          expanded={expanded.calendar}
          onToggle={() => setExpanded((current) => ({ ...current, calendar: !current.calendar }))}
        />
      )}
      <CapacityLogsLayout>
        <CapacityLogPanel
          label="Time off logs"
          title="Time off"
          count={data.absences.length}
          canAdd={canLog}
          disabled={busy || !data.has_dates}
          addLabel="Log absence"
          onToggleForm={() => setForm(form === "absence" ? null : "absence")}
        >
          {form === "absence" && (
            <AvailabilityForm
              kind="absence"
              members={data.members.filter((member) => member.can_log_absence)}
              start={sprint.start_date ?? ""}
              end={sprint.end_date ?? ""}
              busy={busy}
              onSave={saveAvailability}
              onCancel={() => setForm(null)}
            />
          )}
          <CapacityLogList>
            {absences.map((entry) => (
              <CapacityAbsenceEntry
                key={entry.id}
                entry={entry}
                memberName={memberName(entry.user_id)}
                busy={busy}
                onRemove={() => void capacity.removeEntry("absences", entry.id)}
              />
            ))}
          </CapacityLogList>
          {!data.absences.length && (
            <CapacityLogEmptyState message="No time off logged for this sprint." />
          )}
          {data.absences.length > 4 && (
            <CapacityLogMore
              count={data.absences.length}
              expanded={expanded.absences}
              onToggle={() =>
                setExpanded((current) => ({ ...current, absences: !current.absences }))
              }
            />
          )}
        </CapacityLogPanel>
        <CapacityLogPanel
          label="Team holidays"
          title="Team holidays"
          count={data.holidays.length}
          canAdd={data.can_manage}
          disabled={busy || !data.has_dates}
          addLabel="Log holiday"
          onToggleForm={() => setForm(form === "holiday" ? null : "holiday")}
        >
          {form === "holiday" && (
            <AvailabilityForm
              kind="holiday"
              members={[]}
              start={sprint.start_date ?? ""}
              end={sprint.end_date ?? ""}
              busy={busy}
              onSave={saveAvailability}
              onCancel={() => setForm(null)}
            />
          )}
          <CapacityLogList>
            {holidays.map((entry) => (
              <CapacityHolidayEntry
                key={entry.id}
                entry={entry}
                busy={busy}
                onRemove={() => void capacity.removeEntry("holidays", entry.id)}
              />
            ))}
          </CapacityLogList>
          {!data.holidays.length && (
            <CapacityLogEmptyState message="No team holidays in this sprint." />
          )}
          {data.holidays.length > 4 && (
            <CapacityLogMore
              count={data.holidays.length}
              expanded={expanded.holidays}
              onToggle={() =>
                setExpanded((current) => ({ ...current, holidays: !current.holidays }))
              }
            />
          )}
        </CapacityLogPanel>
      </CapacityLogsLayout>
      <CapacityDisclaimer />
    </>
  );
}
