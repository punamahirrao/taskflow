import type { ComponentPropsWithoutRef } from "react";
import { Page } from "../common/components/styled";

export const DashboardPageShell = ({ className = "", ...props }: ComponentPropsWithoutRef<"main">) => <Page className={`bg-subtle p-6 md:p-8 ${className}`} {...props} />;
export const DashboardPageHeader = ({ className = "", ...props }: ComponentPropsWithoutRef<"header">) => <header className={`mb-8 flex flex-wrap items-start justify-between gap-4 ${className}`} {...props} />;
