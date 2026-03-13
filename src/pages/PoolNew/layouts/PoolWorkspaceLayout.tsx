import { ReactNode } from "react";

interface PoolWorkspaceLayoutProps {
    left: ReactNode;
    middle: ReactNode;
    right?: ReactNode;
}

export default function PoolWorkspaceLayout({ left, middle, right }: PoolWorkspaceLayoutProps) {
    return (
        <div className="mt-0 flex w-full min-h-[640px] flex-col bg-black/40 lg:flex-row">
            {left}
            {middle}
            {right ? right : null}
        </div>
    );
}
