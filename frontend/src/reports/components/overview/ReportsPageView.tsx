import type { useReportsPageModel } from "../../features/overview/useReportsPageModel";
import { ReportsOverview } from "./ReportsOverview";
export function ReportsPageView({ model }: { model: ReturnType<typeof useReportsPageModel> }) {
  return (
    <main data-testid="page-reports" className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
      <ReportsOverview model={model} />
    </main>
  );
}
