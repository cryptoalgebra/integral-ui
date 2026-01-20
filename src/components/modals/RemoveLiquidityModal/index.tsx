import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { enabledModules } from "config";
import { Deposit } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useBurnCallback } from "@/hooks/positions/useBurnCallback";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from "@/state/burnStore";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
const { useOmegaBurnCallback } = BoostedPoolsModule.hooks;
const { ReceiveTokensSelector } = BoostedPoolsModule.components;

interface RemoveLiquidityModalProps {
    positionId: number;
}

const RemoveLiquidityModal = ({ positionId }: RemoveLiquidityModalProps) => {
    const [sliderValue, setSliderValue] = useState([50]);
    const [token0Unwrap, setToken0Unwrap] = useState(false);
    const [token1Unwrap, setToken1Unwrap] = useState(false);

    const { refetch: refetchAllPositions } = usePositions();

    const { position, refetch: refetchPosition } = usePosition(positionId);

    const { percent } = useBurnState();

    const { onPercentSelect } = useBurnActionHandlers();

    const { farmingClient } = useClients();

    const derivedInfo = useDerivedBurnInfo(position, true);

    const { position: positionSDK, liquidityPercentage, feeValue0, feeValue1, liquidityValue0, liquidityValue1 } = derivedInfo;

    const token0 = liquidityValue0?.currency;
    const token1 = liquidityValue1?.currency;

    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;
    const hasAnyBoostedToken = isBoostedToken0 || isBoostedToken1;
    const shouldUseOmegaRouter = enabledModules.BoostedPoolsModule && hasAnyBoostedToken;

    // Use Omega router for boosted tokens when module is enabled, native for regular tokens
    const omegaBurn = useOmegaBurnCallback({
        positionId,
        positionSDK,
        liquidityPercentage,
        token0Unwrap,
        token1Unwrap,
        token0Address: position?.token0 as Address,
        token1Address: position?.token1 as Address,
        percent,
    });

    const nativeBurn = useBurnCallback({
        positionId,
        positionSDK,
        liquidityPercentage,
        feeValue0,
        feeValue1,
        token0Address: position?.token0 as Address,
        token1Address: position?.token1 as Address,
        percent,
    });

    const {
        burnCallback,
        isLoading: isRemoveLoading,
        isPending,
        isPermitLoading,
        isSuccess,
        needsPermit,
        config: removeLiquidityConfig,
    } = useMemo(() => (shouldUseOmegaRouter ? omegaBurn : { ...nativeBurn, isPermitLoading: false, needsPermit: false }), [
        shouldUseOmegaRouter,
        omegaBurn,
        nativeBurn,
    ]);

    const isDisabled = sliderValue[0] === 0 || isRemoveLoading || isPending || isPermitLoading || (!needsPermit && !removeLiquidityConfig);

    useEffect(() => {
        onPercentSelect(sliderValue[0]);
    }, [sliderValue, onPercentSelect]);

    const [isOpen, setIsOpen] = useState(false);

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isSuccess) return;
        let interval: NodeJS.Timeout;

        /* pool positions refetch */
        Promise.all([refetchPosition(), refetchAllPositions()])

            /* farming deposits refetch */
            .then(() => {
                handleCloseModal?.();
                if (sliderValue[0] !== 100) return;
                interval = setInterval(
                    () =>
                        farmingClient.refetchQueries({
                            include: ["Deposits"],
                            onQueryUpdated: (query, { result: diff }) => {
                                const currentPos = diff.deposits.find(
                                    (deposit: Deposit) => deposit.id.toString() === positionId.toString()
                                );
                                if (!currentPos) return;

                                if (currentPos.eternalFarming === null) {
                                    clearInterval(interval);
                                } else {
                                    query.refetch().then();
                                }
                            },
                        }),
                    2000
                );
            });

        return () => clearInterval(interval);
    }, [isSuccess, refetchPosition, refetchAllPositions, sliderValue, farmingClient, positionId]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"} className="w-full">
                    Remove Liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="md:min-w-[500px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Remove Liquidity</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <h2 className="text-3xl font-bold select-none">{`${sliderValue}%`}</h2>

                    <div className="flex gap-2">
                        {[25, 50, 75, 100].map((v) => (
                            <Button
                                key={`liquidity-percent-${v}`}
                                disabled={isRemoveLoading}
                                variant={sliderValue[0] === v ? "iconHover" : "icon"}
                                className="border border-card-border"
                                size={"sm"}
                                onClick={() => setSliderValue([v])}
                            >
                                {v}%
                            </Button>
                        ))}
                    </div>

                    <Slider
                        value={sliderValue}
                        id="liquidity-percent"
                        max={100}
                        defaultValue={sliderValue}
                        step={1}
                        onValueChange={(v) => setSliderValue(v)}
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        aria-label="Liquidity Percent"
                        disabled={isRemoveLoading}
                    />

                    <CurrencyAmounts
                        amount0Parsed={liquidityValue0?.toSignificant(24)}
                        amount1Parsed={liquidityValue1?.toSignificant(24)}
                        token0={liquidityValue0?.currency}
                        token1={liquidityValue1?.currency}
                    />

                    <ReceiveTokensSelector
                        token0={liquidityValue0?.currency}
                        token1={liquidityValue1?.currency}
                        amount0={liquidityValue0}
                        amount1={liquidityValue1}
                        token0Unwrap={token0Unwrap}
                        token1Unwrap={token1Unwrap}
                        onToken0UnwrapChange={setToken0Unwrap}
                        onToken1UnwrapChange={setToken1Unwrap}
                        disabled={isRemoveLoading}
                    />

                    <Button variant={"primary"} disabled={isDisabled} onClick={burnCallback}>
                        {isRemoveLoading || isPending || isPermitLoading ? <Loader /> : needsPermit ? "Sign Permit" : "Remove Liquidity"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

RemoveLiquidityModal.whyDidYouRender = true;

export default RemoveLiquidityModal;
