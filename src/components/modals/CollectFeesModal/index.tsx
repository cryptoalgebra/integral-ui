import CurrencyLogo from "@/components/common/CurrencyLogo";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { enabledModules } from "config";
import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
import { useCollectCallback } from "@/hooks/positions/useCollectCallback";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { IDerivedMintInfo } from "@/state/mintStore";
import { formatAmount } from "@/utils";
import { useMemo, useState } from "react";
import { Address } from "viem";

const { ReceiveTokensSelector } = BoostedPoolsModule.components;
const { useOmegaCollectCallback } = BoostedPoolsModule.hooks;

interface CollectFeesModalProps {
    mintInfo: IDerivedMintInfo;
    positionId: number;
    amount0: ReturnType<typeof usePositionFees>["amount0"];
    amount1: ReturnType<typeof usePositionFees>["amount1"];
    amount0Usd: ReturnType<typeof usePositionFees>["amount0Usd"];
    amount1Usd: ReturnType<typeof usePositionFees>["amount1Usd"];
}

const CollectFeesModal = ({ mintInfo, positionId, amount0, amount1, amount0Usd, amount1Usd }: CollectFeesModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [token0Unwrap, setToken0Unwrap] = useState(false);
    const [token1Unwrap, setToken1Unwrap] = useState(false);

    const zeroRewards = amount0?.equalTo("0") && amount1?.equalTo("0");

    const token0 = amount0?.currency;
    const token1 = amount1?.currency;

    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;
    const hasAnyBoostedToken = isBoostedToken0 || isBoostedToken1;
    const shouldUseOmegaRouter = enabledModules.BoostedPoolsModule && hasAnyBoostedToken;

    // Use Omega router for boosted tokens when module is enabled, native for regular tokens
    const omegaCollect = useOmegaCollectCallback({
        positionId,
        amount0,
        amount1,
        token0Unwrap,
        token1Unwrap,
        token0Address: mintInfo.currencies.CURRENCY_A?.wrapped.address as Address,
        token1Address: mintInfo.currencies.CURRENCY_B?.wrapped.address as Address,
    });

    const nativeCollect = useCollectCallback({
        positionId,
        amount0,
        amount1,
        token0Address: mintInfo.currencies.CURRENCY_A?.wrapped.address as Address,
        token1Address: mintInfo.currencies.CURRENCY_B?.wrapped.address as Address,
    });

    const { collectCallback, isLoading, isPending, isPermitLoading, needsPermit, config: collectConfig } = useMemo(
        () => (shouldUseOmegaRouter ? omegaCollect : { ...nativeCollect, isPermitLoading: false, needsPermit: false }),
        [shouldUseOmegaRouter, omegaCollect, nativeCollect]
    );

    const isDisabled = zeroRewards || isLoading || isPending || isPermitLoading || (!needsPermit && !collectConfig);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size={"md"}
                    variant={"primary"}
                    disabled={zeroRewards || isLoading || isPending}
                    className="min-w-[108px] rounded-2xl"
                >
                    {isLoading || isPending ? <Loader /> : "Collect fees"}
                </Button>
            </DialogTrigger>
            <DialogContent className="md:min-w-[500px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Collect Fees</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col p-2 gap-2 bg-card-dark rounded-lg">
                        <div className="flex items-center gap-6 justify-between">
                            <div className="flex gap-2 items-center">
                                <CurrencyLogo className="inline" currency={amount0?.currency} size={20} />
                                <span>{amount0?.currency?.symbol}</span>
                            </div>

                            <div className="flex gap-1 items-end">
                                <span>{formatAmount(amount0?.toExact() || 0, 6)}</span>
                                <span className="opacity-50 text-sm">(${formatAmount(amount0Usd || 0, 2)})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 justify-between">
                            <div className="flex gap-2 items-center">
                                <CurrencyLogo className="inline" currency={amount1?.currency} size={20} />
                                <span>{amount1?.currency?.symbol}</span>
                            </div>

                            <div className="flex gap-1 items-end">
                                <span>{formatAmount(amount1?.toExact() || 0, 6)}</span>
                                <span className="opacity-50 text-sm">(${formatAmount(amount1Usd || 0, 2)})</span>
                            </div>
                        </div>
                    </div>

                    <ReceiveTokensSelector
                        token0={amount0?.currency}
                        token1={amount1?.currency}
                        amount0={amount0}
                        amount1={amount1}
                        token0Unwrap={token0Unwrap}
                        token1Unwrap={token1Unwrap}
                        onToken0UnwrapChange={setToken0Unwrap}
                        onToken1UnwrapChange={setToken1Unwrap}
                        disabled={isLoading || isPending}
                    />

                    <Button variant={"primary"} disabled={isDisabled} onClick={collectCallback}>
                        {isLoading || isPending || isPermitLoading ? <Loader /> : needsPermit ? "Sign Permit" : "Collect Fees"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CollectFeesModal;
