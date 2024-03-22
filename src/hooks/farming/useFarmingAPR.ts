import { ETERNAL_FARMINGS_API, fetcher } from '@/constants/api';
import { useMemo } from 'react';
import useSWR from 'swr';

export function useFarmingAPR({ farmingId }: { farmingId: string }): string {
    const { data: farmingsAPR } = useSWR(ETERNAL_FARMINGS_API, fetcher);

    return useMemo(() => {
        if (!farmingsAPR) {
            return 0;
        }

        const farmingAPR = farmingsAPR[farmingId];

        if (farmingAPR === -1) return 0;

        if (farmingAPR > 100) return farmingAPR.toFixed();

        if (farmingAPR < 10) return farmingAPR.toFixed(2);

        return farmingAPR;
    }, [farmingId, farmingsAPR]);
}
