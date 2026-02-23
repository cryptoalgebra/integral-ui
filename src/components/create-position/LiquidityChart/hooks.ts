import { useEffect, useMemo, useRef } from "react";
import { Pool } from "@cryptoalgebra/custom-pools-sdk";
import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { ChartEntry } from "./types";

export function useDensityChartData({
    pool,
    isSorted,
}: {
    pool: Pool | undefined | null;
    isSorted: boolean;
}) {
    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice, ticksLoading },
    } = useInfoTickData();
    const lastPoolKeyRef = useRef<string | null>(null);
    const fetchFnRef = useRef(fetchTicksSurroundingPrice);

    useEffect(() => {
        fetchFnRef.current = fetchTicksSurroundingPrice;
    }, [fetchTicksSurroundingPrice]);

    useEffect(() => {
        if (!pool) return;

        const poolKey = `${pool.deployer}:${pool.token0.address}:${pool.token1.address}:${pool.tickSpacing.toString()}`;
        if (lastPoolKeyRef.current === poolKey) return;
        lastPoolKeyRef.current = poolKey;

        fetchFnRef.current(pool);
    }, [pool]);

    const formattedData = useMemo(() => {
        if (!ticksResult) {
            return undefined;
        }

        const data = ticksResult.ticksProcessed;
        const newData: ChartEntry[] = [];

        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const activeLiquidity = Number(tick.liquidityActive.toString());
            if (activeLiquidity <= 0) continue;

            const isCurrent = tick.tickIdx === ticksResult.activeTickIdx;

            newData.push({
                activeLiquidity,
                price0: isSorted ? Number(tick.price0) : Number(tick.price1),
                price1: isSorted ? Number(tick.price1) : Number(tick.price0),
                isCurrent,
            });
        }

        return newData;
    }, [ticksResult, isSorted]);

    return {
        formattedData,
        isLoading: ticksLoading && !formattedData,
    };
}
