import { useEffect, useRef } from "react";

let openDialogs = 0;
let originalOverflow = "";
export function useDialogBehavior(onClose: () => void, disabled = false) {
  const closeRef = useRef(onClose);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    closeRef.current = onClose;
    disabledRef.current = disabled;
  }, [onClose, disabled]);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"], dialog[open]'),
    ).at(-1);
    if (!openDialogs++) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selector) ?? []).filter(
        (element) => element.getClientRects().length > 0,
      );
    if (dialog && !dialog.contains(document.activeElement)) (focusable()[0] ?? dialog).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      const top = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"], dialog[open]'),
      ).at(-1);
      if (dialog !== top) return;
      if (event.key === "Escape" && !disabledRef.current) {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const elements = focusable(),
          first = elements[0],
          last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first || !dialog?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || !dialog?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (!--openDialogs) document.body.style.overflow = originalOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
}
