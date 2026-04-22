import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { SecurityState } from "@/hooks/pools/usePool";
import { STATUS_COLORS, STATUS_DESCRIPTIONS, STATUS_LABELS } from "@/types/pool-security-state";
import { cn } from "@/utils";

interface Props {
    status: number | undefined | null;
}

const SecurityStatusTag = ({ status }: Props) => {
    if (status === undefined || status === null || status === SecurityState.ENABLED) return null;

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div
                    className={cn(
                        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-text",
                        STATUS_COLORS[status],
                    )}
                >
                    <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                    Registry {STATUS_LABELS[status]}
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="max-w-xs text-sm leading-6 text-text-muted">{STATUS_DESCRIPTIONS[status]}</HoverCardContent>
        </HoverCard>
    );
};

export default SecurityStatusTag;
