import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { rebaseRewardAbi, useReadVoterGetCurrentPeriod } from "@/generated";
import { votingRewardABI } from "config/abis";
import { useVeTOKENs } from "./useVeTOKENs";
import { REBASE_REWARD } from "config/contract-addresses";
import { useAllGauges } from "./useAllGauges";
import { RewardToken } from "../types/voting";
import { Address, formatUnits } from "viem";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { TOKENS } from "config/tokens";
import { useNativePriceUSD } from "@/hooks/common/useNativePriceUSD";
import { VeTOKENRewards } from "../types/veTOKEN";

export function useVeTOKENRewards(): { data: VeTOKENRewards[] | undefined; isLoading: boolean; refetch: () => void } {
    const chainId = useChainId();
    const { veTOKENs } = useVeTOKENs(true);
    const veTOKENIds = veTOKENs.map((ve) => ve.tokenId);

    const { tokens, isLoading: tokensLoading } = useAllTokens();

    const { data: gaugeList, isLoading: gaugesLoading } = useAllGauges();

    const { data: currentPeriod } = useReadVoterGetCurrentPeriod();

    const contracts = useMemo(() => {
        if (!veTOKENIds.length || !gaugeList?.length || !currentPeriod) return [];

        const calls: any[] = [];

        // Rebase per tokenId
        veTOKENIds.forEach((id) => {
            calls.push({
                address: REBASE_REWARD[chainId],
                abi: rebaseRewardAbi,
                functionName: "earnedForTokenId",
                args: [id],
            });
        });

        // VotingReward per gauge + tokenId
        gaugeList.forEach((g) => {
            veTOKENIds.forEach((id) => {
                calls.push({
                    address: g.votingReward,
                    abi: votingRewardABI,
                    functionName: "earnedForTokenId",
                    args: [id],
                });
            });
        });

        return calls;
    }, [veTOKENIds, gaugeList, currentPeriod, chainId]);

    const { nativePriceUSD } = useNativePriceUSD();
    const { formatted: tokenPriceUSD } = useUSDCPrice(TOKENS[chainId].TOKEN);

    const { data: results, isLoading, refetch } = useReadContracts({
        contracts,
        query: { enabled: contracts.length > 0 },
    });

    // Step 3. Format data
    const formatted: VeTOKENRewards[] | undefined = useMemo(() => {
        if (!results || !results.length || !veTOKENIds.length || !gaugeList.length || !tokens.length) return undefined;

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

        const res: VeTOKENRewards[] = veTOKENIds.map((id) => ({
            tokenId: id,
            votingRewardList: [],
            rebaseAmount: 0n,
            rebaseAmountUsd: 0,
        }));

        let callIndex = 0;

        // 1. Rebase results
        veTOKENIds.forEach((_, idx) => {
            const rebaseResult = results[callIndex]?.result;
            callIndex++;

            if (rebaseResult) {
                const [amounts] = rebaseResult as [bigint[], Address[]];
                res[idx].rebaseAmount = amounts?.[0] ?? 0n;
                res[idx].rebaseAmountUsd = Number(formatUnits(res[idx].rebaseAmount, TOKENS[chainId].TOKEN.decimals)) * tokenPriceUSD;
            }
        });

        // 2. VotingReward results
        gaugeList?.forEach((g) => {
            veTOKENIds.forEach((_, idx) => {
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
    }, [results, veTOKENIds, gaugeList, tokens, nativePriceUSD, chainId, tokenPriceUSD]);

    return { data: formatted, isLoading: isLoading || gaugesLoading || tokensLoading, refetch };
}
