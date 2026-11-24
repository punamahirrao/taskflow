import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useEffect, useRef, type ReactNode } from "react";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";

export function StoryDetailsFrame({
  task,
  onClose,
  backlogDrawerOpen = false,
  drawerClassName = "",
  open = true,
  children,
}: Pick<
  SprintStoryDetailsDrawerProps,
  "task" | "onClose" | "backlogDrawerOpen" | "drawerClassName" | "open"
> & { children: ReactNode }) {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!drawerRef.current?.contains(event.target as Node)) onClose();
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  return (
    <aside
      ref={drawerRef}
      data-testid="sprint-story-details"
      aria-label={t("sprintTrain.detailsFor", { title: task.title })}
      aria-hidden={!open}
      className={`sprint-story-drawer flex flex-col border-l border-slate-200 bg-white shadow-2xl ${backlogDrawerOpen ? "with-backlog" : ""} ${drawerClassName} ${open ? "" : "is-closing"}`}
    >
      {children}
    </aside>
  );
}
