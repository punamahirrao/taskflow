import { TrainFront } from "lucide-react";
import type { SprintTrainHeaderProps } from "../../entities/header";

export function SprintTrainBrand({
  projectName,
  role,
  sectionLabel,
}: Pick<SprintTrainHeaderProps, "projectName" | "role" | "sectionLabel">) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white"
        aria-hidden="true"
      >
        <TrainFront size={21} />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold">{projectName}</h1>
        <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-medium uppercase tracking-wide text-slate-500">
          {sectionLabel}
        </p>
      </div>
      {role && (
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-wide text-indigo-700">
          {role}
        </span>
      )}
    </div>
  );
}
