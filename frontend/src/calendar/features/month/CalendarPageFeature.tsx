import { CalendarPageView } from "../../components/month/CalendarPageView";
import { useCalendarPageModel } from "./useCalendarPageModel";
export function CalendarPageFeature() {
  const model = useCalendarPageModel();
  return <CalendarPageView model={model} />;
}
