import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { SecurityState } from "@/hooks/pools/usePool";
import { STATUS_COLORS, STATUS_DESCRIPTIONS, STATUS_LABELS } from "@/types/pool-security-state";
import { cn } from "@/utils";

interface Props {
    status: number | undefined | null;
}

const SecurityStatusTag = ({ status }: Props) => {

    if (status === undefined || status === null || status === SecurityState.ENABLED) return null

    return <HoverCard>
        <HoverCardTrigger>
            <div
                className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap pointer-events-none",
                    STATUS_COLORS[status]
                )}
            >
                {STATUS_LABELS[status]}
            </div>
        </HoverCardTrigger>
        <HoverCardContent>
            {STATUS_DESCRIPTIONS[status]}
        </HoverCardContent>
    </HoverCard>

}

export default SecurityStatusTag;