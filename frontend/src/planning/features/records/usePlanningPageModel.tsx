import { Flag, LayoutTemplate, Milestone, Target } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { dataScope } from "../../../common/api/queryApi";
import { usePlanningQuery } from "../../api/planningQuery";
import type { PlanningRecord } from "../../entities/planning";

const icons = { release: Flag, goal: Target, milestone: Milestone, template: LayoutTemplate };
export function usePlanningPageModel({ kind }: { kind: PlanningRecord["kind"] }) {
  const { currentData, isFetching, error, refetch } = usePlanningQuery({ ...dataScope(), kind });
  const [params] = useSearchParams();
  const selectedGoal = kind === "goal" ? params.get("goal") : null;
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PlanningRecord | "new" | null>(null);
  const Icon = icons[kind];
  const items =
    currentData?.items.filter(
      (item) =>
        (!selectedGoal || String(item.id) === selectedGoal) &&
        `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return {
    currentData,
    isFetching,
    error,
    refetch,
    selectedGoal,
    search,
    setSearch,
    editing,
    setEditing,
    Icon,
    items,
    kind,
  };
}
