import { cn } from "@/utils/common/cn";
import { ChevronDownIcon } from "lucide-react";

interface HeaderItemProps {
    children?: React.ReactNode;
    className?: string;
    sort?: () => void;
    isAsc?: boolean;
}

export const HeaderItem = ({ children, className, sort, isAsc }: HeaderItemProps) => (
    <span
        onClick={() => sort && sort()}
        className={cn(
            "inline-flex select-none items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted duration-150",
            className,
            sort && "cursor-pointer hover:text-text",
        )}
    >
        {children}
        {sort && <ChevronDownIcon size={12} className={cn(isAsc ? "rotate-180" : "rotate-0", "text-text-muted duration-150")} />}
    </span>
);
