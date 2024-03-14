import {
    TokenFieldsFragment,
    useNativePriceQuery,
} from '@/graphql/generated/graphql';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

export function useRewardEarnedUSD({
    token,
    reward,
}: {
    token: TokenFieldsFragment;
    reward: bigint;
}): number {
    const { data: nativePrice } = useNativePriceQuery();

    return useMemo(() => {
        const formattedRewardEarned = Number(
            formatUnits(reward, token.decimals)
        );

        const rewardUSD =
            token.derivedMatic *
            formattedRewardEarned *
            nativePrice?.bundles[0].maticPriceUSD;

        return rewardUSD;
    }, [nativePrice, token, reward]);
}
