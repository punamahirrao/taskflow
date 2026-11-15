import type { ComponentPropsWithoutRef } from "react";
import { Page } from "../common/components/styled";

export const BoardsPageShell = ({ className = "", ...props }: ComponentPropsWithoutRef<"main">) => <Page className={`p-5 md:p-8 ${className}`} {...props} />;
export const BoardPageHeader = ({ className = "", ...props }: ComponentPropsWithoutRef<"header">) => <header className={`mb-7 flex flex-wrap items-end justify-between gap-4 ${className}`} {...props} />;
export const BoardPageTitle = ({ className = "", ...props }: ComponentPropsWithoutRef<"h1">) => <h1 className={`mt-1 text-3xl font-bold tracking-tight text-content ${className}`} {...props} />;
