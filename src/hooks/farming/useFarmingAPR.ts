import { fetcher } from "@/constants/api";
import { useMemo } from "react";
import useSWR from "swr";

import AlgebraConfig from "@/algebra.config";

export function useFarmingAPR({ farmingId }: { farmingId: string }): string {
  const { data: farmingsAPR } = useSWR(
    AlgebraConfig.API.eternalFarmsAPR,
    fetcher
  );

  return useMemo(() => {
    if (!farmingsAPR) {
      return 0;
    }

    const farmingAPR = farmingsAPR[farmingId];

    if (farmingAPR === -1) return 0;

    if (farmingAPR >= 100) return farmingAPR.toFixed();

    if (farmingAPR < 100) return farmingAPR.toFixed(2);
  }, [farmingId, farmingsAPR]);
}
