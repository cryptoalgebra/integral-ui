import { cn } from "@/utils/common/cn";
import React, { FC } from "react";

interface CardInfoProps {
    title: string;
    additional?: string;
    className?: string;
    children?: React.ReactNode;
}

export const CardInfo: FC<CardInfoProps> = ({ title, children, additional, className }) => {
    return (
        <div className={cn("flex items-start flex-col gap-2 rounded-lg border-card-border border bg-card-dark p-4", className)}>
            <h3 className="font-bold text-xs text-text-100/75">{title}</h3>
            <div className="flex justify-between w-full items-end">
                <div className="flex items-center mr-auto text-lg font-bold">{children}</div>
                {additional && <p className="max-sm:hidden text-sm text-text-100/75">{additional}</p>}
            </div>
        </div>
    );
};
