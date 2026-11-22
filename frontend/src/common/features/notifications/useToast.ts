import { useCallback } from "react";
import { useAppDispatch } from "../../store";
import { notificationActions, type ToastKind } from "../../store/notificationsSlice";

let nextId = 0;
export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (kind: ToastKind, message: string, duration = 4500) => {
      dispatch(
        notificationActions.toastAdded({
          id: `${Date.now()}-${nextId++}`,
          kind,
          message,
          duration,
        }),
      );
    },
    [dispatch],
  );
}
