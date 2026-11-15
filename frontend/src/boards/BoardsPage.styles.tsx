import type { ComponentPropsWithoutRef } from "react";
import { Page } from "../common/components/styled";

export const BoardWorkPageShell = ({ className = "", ...props }: ComponentPropsWithoutRef<"main">) => <Page className={`p-5 md:p-8 ${className}`} {...props} />;
export const BoardWorkHeader = ({ className = "", ...props }: ComponentPropsWithoutRef<"header">) => <header className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`} {...props} />;
