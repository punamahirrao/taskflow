import { WorkNavigationList } from "../../components/navigation/WorkNavigationList";
import type { WorkTab } from "../../entities/work";
export function WorkNavigation({ activeTab }: { activeTab: WorkTab }) {
  return <WorkNavigationList activeTab={activeTab} />;
}
