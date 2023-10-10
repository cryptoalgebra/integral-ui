import Loader from "@/components/common/Loader";
import { LimitOrder } from "@/components/common/Table/limitOrderColumns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { usePrepareAlgebraLimitOrderPluginKill } from "@/generated";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { useState } from "react";
import { Address, useContractWrite } from "wagmi";

const KillLimitOrderModal = ({ pool, ticks, liquidity, zeroToOne, owner }: LimitOrder) => {

    const [value, setValue] = useState([50])

    const liquidityToRemove = BigInt(liquidity) * BigInt(value[0]) / 100n

    const { config: killConfig } = usePrepareAlgebraLimitOrderPluginKill({
        args: [
            {
                token0: pool.token0.address as Address,
                token1: pool.token1.address as Address
            },
            ticks.tickLower,
            ticks.tickUpper,
            BigInt(liquidityToRemove),
            zeroToOne,
            owner
        ]
    })

    const { data: killData, write: kill } = useContractWrite(killConfig)

    const { isLoading: isKillLoading } = useTransitionAwait(killData?.hash, 'Remove liquidity')

    return <Dialog>
        <DialogTrigger asChild>
            <Button variant={'outline'} size={'sm'} >Remove</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl bg-card-dark" style={{ borderRadius: '32px' }}>
            <DialogHeader>
                <DialogTitle className="font-bold select-none">Remove liquidity</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6">

                <h2 className="text-3xl font-bold select-none">{`${value}%`}</h2>

                <div className="flex gap-2">
                    <Button
                        variant={'icon'}
                        className="border border-card-border"
                        size={'sm'}
                        onClick={() => setValue([25])}>25%</Button>
                    <Button
                        variant={'icon'}
                        className="border border-card-border"
                        size={'sm'}
                        onClick={() => setValue([50])}>50%</Button>
                    <Button
                        variant={'icon'}
                        className="border border-card-border"
                        size={'sm'}
                        onClick={() => setValue([75])}>75%</Button>
                    <Button
                        variant={'icon'}
                        className="border border-card-border"
                        size={'sm'}
                        onClick={() => setValue([100])}>100%</Button>
                </div>

                <Slider
                    value={value}
                    id="liquidity-percent"
                    max={100}
                    defaultValue={value}
                    step={1}
                    onValueChange={(v) => setValue(v)}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    aria-label="Liquidity Percent"
                />

                <Button disabled={value[0] === 0 || isKillLoading} onClick={() => kill && kill()}>
                    {isKillLoading ? <Loader /> : 'Remove Liquidity'}
                </Button>

            </div>

        </DialogContent>
    </Dialog>

}

export default KillLimitOrderModal;