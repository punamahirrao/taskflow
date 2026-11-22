import { useCallback, useEffect, useState } from "react";
import type { Sprint } from "../../features/tasks/entities/task";
import { updateSprint } from "../../features/tasks/api/sprints";
import {
  getSprintCapacity,
  logSprintAbsence,
  logSprintHoliday,
  removeAvailabilityEntry,
  saveCapacityPlan,
} from "../api/capacity";
import type { AbsenceInput, HolidayInput, SprintCapacity } from "../entities/capacity";

type Draft = Record<number, { points: string; allocation: string }>;
const draftFrom = (data: SprintCapacity): Draft =>
  Object.fromEntries(
    data.members.map((member) => [
      member.id,
      {
        points: member.baseline_points?.toString() ?? "",
        allocation: member.allocation_percent.toString(),
      },
    ]),
  );
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Could not save capacity. Please try again.";

export function useSprintCapacity(sprint: Sprint, onSprintUpdated: (sprint: Sprint) => void) {
  const [data, setData] = useState<SprintCapacity | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<"absence" | "holiday" | null>(null);
  const [expanded, setExpanded] = useState({ calendar: false, absences: false, holidays: false });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = (resetDraft = false) =>
      getSprintCapacity(sprint.id)
        .then((result) => {
          if (!active) return;
          setData(result);
          if (resetDraft) {
            setDraft(draftFrom(result));
            setDirty(false);
          }
          setError("");
        })
        .catch((cause: unknown) => {
          if (active) setError(errorMessage(cause));
        });
    void refresh(true);
    const onDataChanged = (event: Event) => {
      const path = (event as CustomEvent<string>).detail;
      if (/^\/tasks\/(?:\d+\/)?$/.test(path ?? "")) void refresh();
    };
    window.addEventListener("taskflow:data-changed", onDataChanged);
    return () => {
      active = false;
      window.removeEventListener("taskflow:data-changed", onDataChanged);
    };
  }, [sprint.id, retry]);

  const mutate = useCallback(
    async (operation: () => Promise<SprintCapacity>, message: string, resetPlan = false) => {
      setBusy(true);
      setError("");
      setNotice("");
      try {
        const result = await operation();
        setData(result);
        if (resetPlan) {
          setDraft(draftFrom(result));
          setDirty(false);
        }
        setNotice(message);
        return true;
      } catch (cause) {
        setError(errorMessage(cause));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const savePlan = () => {
    if (!data) return Promise.resolve(false);
    return mutate(
      () =>
        saveCapacityPlan(
          sprint.id,
          data.members.map((member) => ({
            user_id: member.id,
            baseline_points:
              draft[member.id].points.trim() === "" ? null : Number(draft[member.id].points),
            allocation_percent: Number(draft[member.id].allocation),
          })),
        ),
      "Team plan saved.",
      true,
    );
  };

  const saveAvailability = async (input: AbsenceInput | HolidayInput) => {
    const saved = await mutate(
      () =>
        "name" in input ? logSprintHoliday(sprint.id, input) : logSprintAbsence(sprint.id, input),
      "Availability saved.",
    );
    if (saved) setForm(null);
    return saved;
  };

  const removeEntry = (kind: "absences" | "holidays", id: number) =>
    mutate(
      () => removeAvailabilityEntry(sprint.id, kind, id),
      kind === "absences" ? "Time off removed." : "Holiday removed.",
    );

  const applyForecast = async () => {
    if (!data || data.summary.suggested_capacity_points === null) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await updateSprint(sprint.id, {
        capacity_points: data.summary.suggested_capacity_points,
      });
      onSprintUpdated(saved);
      setNotice(`Sprint capacity set to ${saved.capacity_points} pts.`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return {
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
    retry: () => setRetry((value) => value + 1),
    savePlan,
    saveAvailability,
    removeEntry,
    applyForecast,
  };
}
