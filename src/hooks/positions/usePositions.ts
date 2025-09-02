import { nonfungiblePositionManagerABI, NONFUNGIBLE_POSITION_MANAGER } from "config";
import { ADDRESS_ZERO, Token, computeCustomPoolAddress, computePoolAddress } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { Address } from "viem";
import { useReadNonfungiblePositionManagerBalanceOf } from "@/generated";

export interface PositionFromTokenId {
    tokenId: number;
    feeGrowthInside0LastX128: bigint;
    feeGrowthInside1LastX128: bigint;
    liquidity: bigint;
    nonce: string;
    operator: string;
    tickLower: bigint;
    tickUpper: bigint;
    token0: Address;
    token1: Address;
    deployer: Address;
    tokensOwed0: bigint;
    tokensOwed1: bigint;
    pool: Address;
}

function usePositionsFromTokenIds(tokenIds: any[] | undefined): {
    isLoading: boolean;
    positions: PositionFromTokenId[] | undefined;
    refetch: () => void;
} {
    const chainId = useChainId();

    const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => tokenId) : []), [tokenIds]);

    const {
        data: results,
        isLoading,
        isError,
        error,
        refetch,
    } = useReadContracts<readonly { result: any; error: any }[]>({
        contracts: inputs.map((x) => ({
            address: NONFUNGIBLE_POSITION_MANAGER[chainId],
            abi: nonfungiblePositionManagerABI,
            functionName: "positions",
            args: [[Number(x)]],
        })),
    });

    const positions = useMemo(() => {
        if (!isLoading && !isError && tokenIds && !error) {
            return results
                ?.filter((v) => !v.error)
                .map((call, i) => {
                    const tokenId = tokenIds[i];
                    const result = call.result as any;
                    const isBasePool = result[4] === ADDRESS_ZERO;

                    const pool = (
                        isBasePool
                            ? computePoolAddress({
                                  tokenA: new Token(chainId, result[2], 18),
                                  tokenB: new Token(chainId, result[3], 18),
                              })
                            : computeCustomPoolAddress({
                                  tokenA: new Token(chainId, result[2], 18),
                                  tokenB: new Token(chainId, result[3], 18),
                                  customPoolDeployer: result[4],
                              })
                    ) as Address;

                    return {
                        tokenId,
                        feeGrowthInside0LastX128: result[8],
                        feeGrowthInside1LastX128: result[9],
                        liquidity: result[7],
                        nonce: result[0],
                        operator: result[1],
                        tickLower: result[5],
                        tickUpper: result[6],
                        token0: result[2],
                        token1: result[3],
                        deployer: result[4],
                        tokensOwed0: result[10],
                        tokensOwed1: result[11],
                        pool,
                    };
                });
        }
        return undefined;
    }, [isLoading, isError, error, results, tokenIds, chainId]);

    return useMemo(() => {
        return {
            isLoading,
            positions,
            refetch,
        };
    }, [isLoading, positions, refetch]);
}

export function usePositions() {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const { data: balanceResult, isLoading: balanceLoading } = useReadNonfungiblePositionManagerBalanceOf({
        args: account ? [account] : undefined,
        query: {
            enabled: !!account,
        },
    });

    const tokenIdsArgs: [Address, number][] = useMemo(() => {
        if (!balanceResult || !account) return [];

        const tokenRequests: any[] = [];

        for (let i = 0; i < balanceResult; i++) {
            tokenRequests.push([account, i]);
        }

        return tokenRequests;
    }, [account, balanceResult]);

    const { data: tokenIdResults, isLoading: someTokenIdsLoading } = useReadContracts<readonly { result: any; error: any }[]>({
        contracts: tokenIdsArgs.map((args) => ({
            address: NONFUNGIBLE_POSITION_MANAGER[chainId],
            abi: nonfungiblePositionManagerABI,
            functionName: "tokenOfOwnerByIndex",
            args,
        })),
    });

    const tokenIds = useMemo(() => {
        if (account) {
            return tokenIdResults
                ?.map(({ result }) => result)
                .filter((result) => !!result)
                .map((result) => result);
        }
        return [];
    }, [account, tokenIdResults]);

    const { positions, isLoading: positionsLoading, refetch } = usePositionsFromTokenIds(tokenIds);

    return {
        loading: someTokenIdsLoading || balanceLoading || positionsLoading,
        positions,
        refetch,
    };
}

export function usePosition(tokenId: string | number | undefined): {
    loading: boolean;
    position: PositionFromTokenId | undefined;
    refetch: () => void;
} {
    const tokenIdArr = useMemo(() => {
        if (!tokenId) return;
        return [tokenId];
    }, [tokenId]);

    const { isLoading, positions, refetch } = usePositionsFromTokenIds(tokenIdArr);

    return useMemo(() => {
        return {
            loading: isLoading,
            position: positions?.[0],
            refetch,
        };
    }, [isLoading, positions, refetch]);
}
