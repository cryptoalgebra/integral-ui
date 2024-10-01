import {
    DEFAULT_NATIVE_NAME,
    DEFAULT_NATIVE_SYMBOL,
} from '@/constants/default-chain-id';
import {
    TokenFieldsFragment,
    useAllTokensQuery,
} from '@/graphql/generated/graphql';
import { useTokensState } from '@/state/tokensStore';
import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import { Address } from 'viem';
import { useChainId } from 'wagmi';

export function useAllTokens(showNativeToken: boolean = true) {
    const chainId = useChainId();

    const { data: allTokens, loading } = useAllTokensQuery();

    const { importedTokens } = useTokensState();

    const tokensBlackList: Address[] = useMemo(() => [], []);

    const mergedTokens = useMemo(() => {
        const tokens = new Map<Address, TokenFieldsFragment>();
        
        if (!allTokens) {
            const _importedTokens = Object.values(importedTokens[chainId] || []);
            for (const token of _importedTokens) {
                tokens.set(token.id.toLowerCase() as Address, {
                    ...token,
                    derivedMatic: 0,
                });
            }
            return [...tokens].map(([, token]) => ({ ...token }));
        }

        if (showNativeToken)
            tokens.set(ADDRESS_ZERO, {
                id: ADDRESS_ZERO,
                symbol: DEFAULT_NATIVE_SYMBOL,
                name: DEFAULT_NATIVE_NAME,
                decimals: 18,
                derivedMatic: 1,
            });

        for (const token of allTokens.tokens.filter(
            (token) => !tokensBlackList.includes(token.id as Address)
        )) {
            tokens.set(token.id.toLowerCase() as Address, { ...token });
        }

        const _importedTokens = Object.values(importedTokens[chainId] || []);

        for (const token of _importedTokens) {
            tokens.set(token.id.toLowerCase() as Address, {
                ...token,
                derivedMatic: 0,
            });
        }

        return [...tokens].map(([, token]) => ({ ...token }));
    }, [allTokens, importedTokens, tokensBlackList, chainId, showNativeToken]);

    return useMemo(
        () => ({
            tokens: mergedTokens,
            isLoading: loading || Boolean(allTokens && !mergedTokens.length),
        }),
        [mergedTokens, allTokens, loading]
    );
}
