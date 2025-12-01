import { useGetBlockByTimestampQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useMemo } from "react";
import { Address, erc4626Abi, erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

const SECONDS_IN_DAY = 60 * 60 * 24;

export function useBoostedTokenAPR(tokenAddress: Address | undefined) {
    const { blocksClient } = useClients();

    const yesterdayTimestamp = useMemo(() => {
        const now = Math.floor(Date.now() / 1000);
        return now - SECONDS_IN_DAY;
    }, []);

    const { data: blockData, loading: blockLoading } = useGetBlockByTimestampQuery({
        variables: {
            timestampFrom: (yesterdayTimestamp - 600).toString(), // 10 min window
            timestampTo: yesterdayTimestamp.toString(),
        },
        client: blocksClient,
        skip: !tokenAddress,
    });

    const yesterdayBlockNumber = blockData?.blocks?.[0]?.number ? BigInt(blockData.blocks[0].number) : undefined;

    const { data: currentData, isLoading: currentLoading } = useReadContracts({
        contracts: tokenAddress
            ? [
                  { address: tokenAddress, abi: erc4626Abi, functionName: "totalAssets" },
                  { address: tokenAddress, abi: erc4626Abi, functionName: "totalSupply" },
                  { address: tokenAddress, abi: erc20Abi, functionName: "decimals" },
              ]
            : [],
        query: {
            enabled: !!tokenAddress,
        },
    });

    const { data: historicalData, isLoading: historicalLoading } = useReadContracts({
        contracts:
            tokenAddress && yesterdayBlockNumber
                ? [
                      { address: tokenAddress, abi: erc4626Abi, functionName: "totalAssets" },
                      { address: tokenAddress, abi: erc4626Abi, functionName: "totalSupply" },
                  ]
                : [],
        blockNumber: yesterdayBlockNumber,
        query: {
            enabled: !!tokenAddress && !!yesterdayBlockNumber,
        },
    });

    const { totalAssets, totalSupply, decimalsNumber, prevTotalAssets, prevTotalSupply } = useMemo(() => {
        if (!currentData || !historicalData) return {};

        const [totalAssetsResult, totalSupplyResult, decimalsResult] = currentData;
        const [prevTotalAssetsResult, prevTotalSupplyResult] = historicalData;

        const totalAssets = totalAssetsResult?.result as bigint | undefined;
        const totalSupply = totalSupplyResult?.result as bigint | undefined;
        const decimalsNumber = decimalsResult?.result as number | undefined;
        const prevTotalAssets = prevTotalAssetsResult?.result as bigint | undefined;
        const prevTotalSupply = prevTotalSupplyResult?.result as bigint | undefined;

        return { totalAssets, totalSupply, decimalsNumber, prevTotalAssets, prevTotalSupply };
    }, [currentData, historicalData]);

    const apr = useMemo(() => {
        if (!totalAssets || !totalSupply || !decimalsNumber || !prevTotalAssets || !prevTotalSupply) {
            return 0;
        }

        if (totalSupply === 0n || prevTotalSupply === 0n) {
            return 0;
        }

        const shareValue = Number(totalAssets) / Number(totalSupply);
        const prevShareValue = Number(prevTotalAssets) / Number(prevTotalSupply);

        if (prevShareValue === 0) {
            return 0;
        }

        const dailyGrowth = shareValue / prevShareValue - 1;
        return dailyGrowth * 365 * 100;
    }, [decimalsNumber, prevTotalAssets, prevTotalSupply, totalAssets, totalSupply]);

    const isLoading = blockLoading || currentLoading || historicalLoading;

    return {
        data: apr,
        isLoading,
    };
}
