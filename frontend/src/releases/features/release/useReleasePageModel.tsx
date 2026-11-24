import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { dataScope } from "../../../common/api/queryApi";
import { useReleasesQuery } from "../../api/releases";
import type { Release } from "../../entities/release";
const stateOrder = ["in_progress", "changes_requested", "ready", "planned", "done"];
export function useReleasePageModel() {
  const query = useReleasesQuery(dataScope());
  const { currentData } = query;
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Release | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const items = [...(currentData?.items ?? [])].sort(
    (a, b) => stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state),
  );
  const visible = items.filter(
    (release) =>
      (!filter || release.state === filter) &&
      `${release.name} ${release.goals.map((goal) => goal.name).join(" ")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const selected =
    visible.find((release) => String(release.id) === params.get("release")) ?? visible[0];
  const numberInReview = items.filter((item) => item.state === "in_progress").length;
  const numberReady = items.filter((item) => item.state === "ready").length;

  return {
    query,
    currentData,
    setParams,
    editing,
    setEditing,
    search,
    setSearch,
    filter,
    setFilter,
    items,
    visible,
    selected,
    numberInReview,
    numberReady,
  };
}
