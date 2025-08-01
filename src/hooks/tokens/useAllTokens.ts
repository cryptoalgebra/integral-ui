import { NATIVE_NAME, NATIVE_SYMBOL } from "config";
import { TokenFieldsFragment, useAllTokensQuery } from "@/graphql/generated/graphql";
import { useTokensState } from "@/state/tokensStore";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { Address } from "viem";
import { useChainId } from "wagmi";
import { useClients } from "../graphql/useClients";

export function useAllTokens(showNativeToken: boolean = true) {
    const chainId = useChainId();

    const { infoClient } = useClients();

    const { data: allTokens, loading } = useAllTokensQuery({
        client: infoClient,
    });

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
                symbol: NATIVE_SYMBOL[chainId],
                name: NATIVE_NAME[chainId],
                decimals: 18,
                derivedMatic: 1,
            });

        for (const token of allTokens.tokens.filter((token) => !tokensBlackList.includes(token.id as Address))) {
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
