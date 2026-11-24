import type { ReactNode } from "react";

export function OrganizationProjectFrame({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <article className="organization-project-card" aria-label={name}>
      {children}
    </article>
  );
}
