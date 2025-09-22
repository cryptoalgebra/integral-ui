import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { rebaseRewardAbi, useReadVoterGetCurrentPeriod } from "@/generated";
import { votingRewardABI } from "config/abis";
import { useVeALGBs } from "./useVeALGBs";
import { REBASE_REWARD } from "config/contract-addresses";
import { useAllGauges } from "./useAllGauges";
import { RewardToken } from "../types/voting";
import { Address, formatUnits } from "viem";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { VeALGBRewards } from "../types";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { STABLECOINS } from "config/tokens";
import { useNativePriceUSD } from "@/hooks/common/useNativePriceUSD";

export function useVeALGBRewards(): { data: VeALGBRewards[] | undefined; isLoading: boolean; refetch: () => void } {
    const chainId = useChainId();
    const { veALGBs } = useVeALGBs(true);
    const veAlgbIds = veALGBs.map((ve) => ve.tokenId);

    const { tokens, isLoading: tokensLoading } = useAllTokens();

    const { data: gaugeList, isLoading: gaugesLoading } = useAllGauges();

    const { data: currentPeriod } = useReadVoterGetCurrentPeriod();

    const contracts = useMemo(() => {
        if (!veAlgbIds.length || !gaugeList?.length || !currentPeriod) return [];

        const calls: any[] = [];

        // Rebase per tokenId
        veAlgbIds.forEach((id) => {
            calls.push({
                address: REBASE_REWARD[chainId],
                abi: rebaseRewardAbi,
                functionName: "earnedForTokenId",
                args: [id],
            });
        });

        // VotingReward per gauge + tokenId
        gaugeList.forEach((g) => {
            veAlgbIds.forEach((id) => {
                calls.push({
                    address: g.votingReward,
                    abi: votingRewardABI,
                    functionName: "earnedForTokenId",
                    args: [id],
                });
            });
        });

        return calls;
    }, [veAlgbIds, gaugeList, currentPeriod, chainId]);

    const { nativePriceUSD } = useNativePriceUSD();
    const { formatted: algbPriceUSD } = useUSDCPrice(STABLECOINS[chainId].ALGB);

    const { data: results, isLoading, refetch } = useReadContracts({
        contracts,
        query: { enabled: contracts.length > 0 },
    });

    // Step 3. Format data
    const formatted: VeALGBRewards[] | undefined = useMemo(() => {
        if (!results || !results.length || !veAlgbIds.length || !gaugeList.length || !tokens.length) return undefined;

        // helper to get decimals by token address
        const getDecimalsByTokenAddress = (tokenAddress: Address) => {
            const token = tokens.find((t) => t.id.toLowerCase() === tokenAddress.toLowerCase());
            return Number(token?.decimals || 18);
        };

        // helper to get price by token address
        const getPriceByTokenAddress = (tokenAddress: Address) => {
            const token = tokens.find((t) => t.id.toLowerCase() === tokenAddress.toLowerCase());
            return Number(token?.derivedMatic || 0) * nativePriceUSD;
        };

        const res: VeALGBRewards[] = veAlgbIds.map((id) => ({
            tokenId: id,
            votingRewardList: [],
            rebaseAmount: 0n,
            rebaseAmountUsd: 0,
        }));

        let callIndex = 0;

        // 1. Rebase results
        veAlgbIds.forEach((_, idx) => {
            const rebaseResult = results[callIndex]?.result;
            callIndex++;

            if (rebaseResult) {
                const [amounts] = rebaseResult as [bigint[], Address[]];
                res[idx].rebaseAmount = amounts?.[0] ?? 0n;
                res[idx].rebaseAmountUsd = Number(formatUnits(res[idx].rebaseAmount, STABLECOINS[chainId].ALGB.decimals)) * algbPriceUSD;
            }
        });

        // 2. VotingReward results
        gaugeList?.forEach((g) => {
            veAlgbIds.forEach((_, idx) => {
                const vrResult = results[callIndex]?.result;
                callIndex++;

                if (vrResult) {
                    const [amounts, tokens] = vrResult as [bigint[], Address[]];

                    const rewardTokenList: RewardToken[] = tokens.map((t, i) => {
                        const address = t;
                        const amount = amounts[i] ?? 0n;
                        const decimals = getDecimalsByTokenAddress(address);
                        const amountUsd = getPriceByTokenAddress(address) * Number(formatUnits(amount, decimals));

                        return {
                            address,
                            amount,
                            decimals,
                            amountUsd,
                        };
                    });

                    res[idx].votingRewardList.push({
                        votingReward: g.votingReward,
                        rewardTokenList,
                    });
                }
            });
        });

        return res;
    }, [results, veAlgbIds, gaugeList, tokens, nativePriceUSD, chainId, algbPriceUSD]);

    return { data: formatted, isLoading: isLoading || gaugesLoading || tokensLoading, refetch };
}
