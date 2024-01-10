import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { usePrepareAlgebraPositionManagerCreateAndInitializePoolIfNecessary } from "@/generated";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { useDerivedMintInfo, useMintActionHandlers } from "@/state/mintStore";
import { INITIAL_POOL_FEE, Token, computePoolAddress, encodeSqrtRatioX96, toHex } from "@cryptoalgebra/integral-sdk";
import { useState } from "react";
import { Address } from "viem";
import { useContractWrite } from "wagmi";

export function CreatePoolModal() {

    const [token0, setToken0] = useState<Address>()
    const [token1, setToken1] = useState<Address>()

    const currencyA = useCurrency(token0)
    const currencyB = useCurrency(token1)

    const poolAddress = token0 && token1 ? computePoolAddress({
        tokenA: new Token(DEFAULT_CHAIN_ID, token0, 18),
        tokenB: new Token(DEFAULT_CHAIN_ID, token1, 18),
    }) as Address : undefined

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress ?? undefined,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined
    )

    const { onStartPriceInput } = useMintActionHandlers(mintInfo.noLiquidity)

    const sqrtRatioX96 = mintInfo.price ? encodeSqrtRatioX96(mintInfo.price.numerator, mintInfo.price.denominator) : undefined

    const [sortedToken0, sortedToken1] = currencyA && currencyB ? currencyA.wrapped.sortsBefore(currencyB.wrapped) ? [token0, token1] : [token1, token0] : [undefined, undefined]

    const { config: createPoolConfig } = usePrepareAlgebraPositionManagerCreateAndInitializePoolIfNecessary({
        enabled: Boolean(token0 && token1 && sqrtRatioX96),
        args: sortedToken0 && sortedToken1 && sqrtRatioX96 ? [
            sortedToken0,
            sortedToken1,
            BigInt(toHex(sqrtRatioX96))
        ] : undefined
    })

    const { data: createPoolData, write: createPool } = useContractWrite(createPoolConfig)

    const { isLoading } = useTransitionAwait(createPoolData?.hash, 'Create Pool')

    return <Dialog>
        <DialogTrigger asChild>
            <Button size={'md'} className="whitespace-nowrap" >Create Pool</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl bg-card-dark" style={{ borderRadius: '32px' }}>
            <DialogHeader>
                <DialogTitle className="font-bold select-none">Create Pool</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">

                <div>
                    <div>First Token</div>
                    <Input onChange={v => setToken0(v.target.value as Address)} />
                </div>
                <div>
                    <div>Second Token</div>
                    <Input onChange={v => setToken1(v.target.value as Address)} />
                </div>
                <div>
                    <div>Initial Price</div>
                    <Input onChange={v => onStartPriceInput(v.target.value)} />
                </div>

                <Button onClick={() => createPool && createPool()}>  {isLoading ? <Loader /> : 'Create Pool'}</Button>

            </div>
        </DialogContent>
    </Dialog>
}