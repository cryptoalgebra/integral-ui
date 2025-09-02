import { formatAmount } from "@/utils";
import { ETERNAL_FARMINGS_API, fetcher } from "config";
import { useMemo } from "react";
import useSWR from "swr";

export function useFarmingAPR({ farmingId }: { farmingId: string }): string {
    const { data: farmingsAPR } = useSWR(ETERNAL_FARMINGS_API, fetcher);

    return useMemo(() => {
        if (!farmingsAPR) {
            return "0";
        }

        const farmingAPR = farmingsAPR[farmingId];

        if (!farmingAPR || farmingAPR <= 0) return "0";

        return formatAmount(farmingAPR, 2);
    }, [farmingId, farmingsAPR]);
}
