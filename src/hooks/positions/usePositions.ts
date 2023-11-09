import { algebraPositionManagerABI } from "@/abis"
import { ALGEBRA_POSITION_MANAGER } from "@/constants/addresses"
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id"
import { useAlgebraPositionManagerBalanceOf } from "@/generated"
import { Token, computePoolAddressZkSync } from "@cryptoalgebra/integral-sdk"
import { useMemo } from "react"
import { Address, useAccount, useContractReads } from "wagmi"

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
    tokensOwed0: bigint;
    tokensOwed1: bigint;
    pool: Address;
}

function usePositionsFromTokenIds(tokenIds: any[] | undefined): { isLoading: boolean; positions: PositionFromTokenId[] | undefined } {

    const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => tokenId) : []), [tokenIds])

    const { data: results, isLoading, isError, error } = useContractReads({
        contracts: inputs.map(x => ({
            address: ALGEBRA_POSITION_MANAGER,
            abi: algebraPositionManagerABI,
            functionName: 'positions',
            args: [[Number(x)]]
        })),
        cacheTime: 10_000
    })

    const { address: account } = useAccount()

    const positions = useMemo(() => {
        if (!isLoading && !isError && tokenIds && !error) {
            return results?.filter(v => !v.error).map((call, i) => {
                const tokenId = tokenIds[i]
                const result = call.result as any

                const pool = computePoolAddressZkSync({
                    tokenA: new Token(DEFAULT_CHAIN_ID, result[2], 18),
                    tokenB: new Token(DEFAULT_CHAIN_ID, result[3], 18)
                }) as Address

                return {
                    tokenId,
                    feeGrowthInside0LastX128: result[7],
                    feeGrowthInside1LastX128: result[8],
                    liquidity: result[6],
                    nonce: result[0],
                    operator: result[1],
                    tickLower: result[4],
                    tickUpper: result[5],
                    token0: result[2],
                    token1: result[3],
                    tokensOwed0: result[9],
                    tokensOwed1: result[10],
                    pool
                }
            })
        }
        return undefined
    }, [isLoading, isError, error, results, tokenIds, account])

    return useMemo(() => {
        return {
            isLoading,
            positions
        }
    }, [isLoading, positions])
}

export function usePositions() {

    const { address: account } = useAccount()

    const { data: balanceResult, isLoading: balanceLoading } = useAlgebraPositionManagerBalanceOf({
        args: account ? [account] : undefined,
        cacheTime: 10_000
    })

    const tokenIdsArgs: [Address, number][] = useMemo(() => {

        if (!balanceResult || !account) return []

        const tokenRequests: any[] = []

        for (let i = 0; i < balanceResult; i++) {
            tokenRequests.push([account, i])
        }

        return tokenRequests
    }, [account, balanceResult])


    const { data: tokenIdResults, isLoading: someTokenIdsLoading } = useContractReads({
        contracts: tokenIdsArgs.map((args) => ({
            address: ALGEBRA_POSITION_MANAGER,
            abi: algebraPositionManagerABI,
            functionName: 'tokenOfOwnerByIndex',
            args
        })),
        cacheTime: 10_000
    })

    const tokenIds = useMemo(() => {
        if (account) {
            return tokenIdResults
                ?.map(({ result }) => result)
                .filter((result) => !!result)
                .map((result) => result)
        }
        return []
    }, [account, tokenIdResults])

    const { positions, isLoading: positionsLoading } = usePositionsFromTokenIds(tokenIds)

    return {
        loading: someTokenIdsLoading || balanceLoading || positionsLoading,
        positions
    }
}

export function usePosition(tokenId: string | number | undefined): { loading: boolean; position: PositionFromTokenId | undefined } {
    
    const tokenIdArr = useMemo(() => {
        if (!tokenId) return
        return [tokenId]
    }, [tokenId])

    const { isLoading, positions } = usePositionsFromTokenIds(tokenIdArr)

    return useMemo(() => {
        return {
            loading: isLoading,
            position: positions?.[0],
        }
    }, [isLoading, positions])
}
