import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import Loader from "@/components/common/Loader";
import { LimitOrder } from "@/components/common/Table/limitOrdersColumns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { CUSTOM_POOL_DEPLOYER_LIMIT_ORDER } from "@/constants/addresses";
import { usePrepareAlgebraLimitOrderPluginKill } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useMemo, useState } from "react";
import { Address, useChainId, useContractWrite } from "wagmi";

const KillLimitOrderModal = ({ pool, ticks, liquidity, zeroToOne, owner, positionLO }: LimitOrder) => {
    const [value, setValue] = useState([50]);

    const chainId = useChainId();

    const liquidityToRemove = (BigInt(liquidity) * BigInt(value[0])) / 100n;

    const { amount0Parsed, amount1Parsed } = useMemo(() => {
        const amount0 = (Number(positionLO.amount0.toExact()) * value[0]) / 100;
        const amount1 = (Number(positionLO.amount1.toExact()) * value[0]) / 100;

        return {
            amount0Parsed: zeroToOne ? amount0.toString() : amount1.toString(),
            amount1Parsed: zeroToOne ? amount1.toString() : amount0.toString(),
        };
    }, [positionLO.amount0, positionLO.amount1, value, zeroToOne]);

    const { config: killConfig } = usePrepareAlgebraLimitOrderPluginKill({
        args: [
            {
                token0: pool.token0.address as Address,
                token1: pool.token1.address as Address,
                deployer: CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[chainId],
            },
            ticks.tickLower,
            ticks.tickUpper,
            BigInt(liquidityToRemove),
            zeroToOne,
            owner,
        ],
    });

    const { data: killData, write: kill } = useContractWrite(killConfig);

    const { isLoading: isKillLoading } = useTransactionAwait(killData?.hash, {
        type: TransactionType.LIMIT_ORDER,
        title: `Withdraw ${amount0Parsed || amount1Parsed} ${amount0Parsed ? pool.token0.symbol : pool.token1.symbol}`,
        tokenA: amount0Parsed ? (pool.token0.wrapped.address as Address) : undefined,
        tokenB: amount1Parsed ? (pool.token1.wrapped.address as Address) : undefined,
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"} size={"sm"}>
                    Withdraw
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[500px] rounded-3xl bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Withdraw limit order liquidity</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <h2 className="text-3xl font-bold select-none">{`${value}%`}</h2>

                    <div className="flex gap-2">
                        <Button variant={"icon"} className="border border-card-border" size={"sm"} onClick={() => setValue([25])}>
                            25%
                        </Button>
                        <Button variant={"icon"} className="border border-card-border" size={"sm"} onClick={() => setValue([50])}>
                            50%
                        </Button>
                        <Button variant={"icon"} className="border border-card-border" size={"sm"} onClick={() => setValue([75])}>
                            75%
                        </Button>
                        <Button variant={"icon"} className="border border-card-border" size={"sm"} onClick={() => setValue([100])}>
                            100%
                        </Button>
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

                    <CurrencyAmounts
                        amount0Parsed={amount0Parsed}
                        amount1Parsed={amount1Parsed}
                        token0={pool.token0}
                        token1={pool.token1}
                    />

                    <Button disabled={value[0] === 0 || isKillLoading} onClick={() => kill && kill()}>
                        {isKillLoading ? <Loader /> : "Withdraw Liquidity"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default KillLimitOrderModal;
