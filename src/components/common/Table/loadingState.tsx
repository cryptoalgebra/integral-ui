import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => (
    <div className="flex flex-col w-full gap-4">
        {[1, 2, 3, 4].map((v) => (
            <Skeleton key={`table-skeleton-${v}`} className="h-12 w-full rounded-lg bg-panel" />
        ))}
    </div>
);
