import type { ReactNode } from "react";

export function StoryDetailsFieldsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-2">
      <dl>{children}</dl>
    </div>
  );
}
