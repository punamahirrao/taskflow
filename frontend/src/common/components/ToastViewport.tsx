import { useEffect } from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { notificationActions, type Toast } from "../store/notificationsSlice";
import { sessionActions } from "../store/sessionSlice";
import { projectActions } from "../store/projectsSlice";
import { boardActions } from "../store/boardsSlice";
import { dashboardActions } from "../store/dashboardSlice";
import { useTranslation } from "../shared/i18n/hooks/useTranslation";

const iconByKind = { success: CheckCircle2, error: CircleAlert, info: Info, warning: TriangleAlert };
const styleByKind = { success: "border-positive/30 bg-surface text-positive", error: "border-danger/30 bg-surface text-danger", info: "border-info/30 bg-surface text-info", warning: "border-warning/30 bg-surface text-warning" };
function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const Icon = iconByKind[toast.kind];
  useEffect(() => { const timer = window.setTimeout(() => dispatch(notificationActions.toastRemoved(toast.id)), toast.duration); return () => window.clearTimeout(timer); }, [dispatch, toast.duration, toast.id]);
  return <div role={toast.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex min-w-72 items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${styleByKind[toast.kind]}`}><Icon size={18} className="mt-0.5 shrink-0"/><p className="flex-1 text-content">{toast.message}</p><button type="button" aria-label={t("notifications.dismiss")} onClick={() => dispatch(notificationActions.toastRemoved(toast.id))} className="rounded p-1 text-muted hover:bg-subtle"><X size={15}/></button></div>;
}
export function ToastViewport() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.notifications.toasts);
  useEffect(() => {
    const clearSession = () => { dispatch(sessionActions.userChanged(null)); dispatch(projectActions.projectSelectionCleared()); dispatch(boardActions.boardsCleared()); dispatch(dashboardActions.dashboardCleared()); };
    window.addEventListener("taskflow:session-cleared", clearSession);
    return () => window.removeEventListener("taskflow:session-cleared", clearSession);
  }, [dispatch]);
  return <div role="region" aria-label="Notifications" aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2">{toasts.map((toast) => <ToastItem key={toast.id} toast={toast}/>)}</div>;
}
