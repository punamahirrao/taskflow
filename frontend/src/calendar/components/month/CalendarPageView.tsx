import { PaddedPage } from "../../../common/components/styled";
import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";
import { CalendarEmptyState } from "./CalendarEmptyState";
import { CalendarGridViewport } from "./CalendarGridViewport";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarLoadError } from "./CalendarLoadError";
import { CalendarLoading } from "./CalendarLoading";

export function CalendarPageView({ model }: { model: ReturnType<typeof useCalendarPageModel> }) {
  const { events, isFetching, error } = model;
  return (
    <PaddedPage>
      <CalendarHeader model={model} />

      {error && <CalendarLoadError model={model} />}
      {isFetching && <CalendarLoading />}

      <CalendarGridViewport model={model} />

      {!isFetching && !error && !events.length && <CalendarEmptyState />}
    </PaddedPage>
  );
}
