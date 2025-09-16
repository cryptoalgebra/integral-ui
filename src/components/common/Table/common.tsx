import { cn } from "@/utils/common/cn";
import { ChevronDownIcon } from "lucide-react";

interface HeaderItemProps {
    children?: React.ReactNode;
    className?: string;
    sort?: () => void;
    isAsc?: boolean;
}

export const HeaderItem = ({ children, className, sort, isAsc }: HeaderItemProps) => (
    <div>
        <span
            onClick={() => sort && sort()}
            className={cn(
                "inline-flex items-center gap-2 rounded-xl px-2 py-1 duration-300 -ml-2 select-none",
                className,
                sort && "hover:bg-card-hover border border-transparent hover:border-card-border cursor-pointer"
            )}
        >
            {children}
            {sort && <ChevronDownIcon size={16} className={`${isAsc ? "rotate-180" : "rotate-0"} duration-300`} />}
        </span>
    </div>
);
