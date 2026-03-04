import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { Deposit } from "@/graphql/generated/graphql";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useClients } from "@/hooks/graphql/useClients";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from "@/state/burnStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { NonfungiblePositionManager, Percent } from "@cryptoalgebra/custom-pools-sdk";
import { NONFUNGIBLE_POSITION_MANAGER } from "config/contract-addresses";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

interface RemoveLiquidityModalProps {
    positionId: number;
    enableActions: boolean;
    triggerClassName?: string;
    triggerVariant?: "primaryLink" | "outline" | "ghost" | "icon";
}

const RemoveLiquidityModal = ({ positionId, enableActions, triggerClassName, triggerVariant }: RemoveLiquidityModalProps) => {
    const [sliderValue, setSliderValue] = useState([50]);

    const { txDeadline } = useUserState();
    const { address: account } = useAccount();
    const chainId = useChainId();

    const { refetch: refetchAllPositions } = usePositions();

    const { position, refetch: refetchPosition } = usePosition(positionId);

    const { percent } = useBurnState();

    const { onPercentSelect } = useBurnActionHandlers();

    const { farmingClient } = useClients();

    const derivedInfo = useDerivedBurnInfo(position, true);

    const { position: positionSDK, liquidityPercentage, feeValue0, feeValue1, liquidityValue0, liquidityValue1 } = derivedInfo;

    const { calldata, value } = useMemo(() => {
        if (!positionSDK || !positionId || !liquidityPercentage || !feeValue0 || !feeValue1 || !account || percent === 0)
            return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.removeCallParameters(positionSDK, {
            tokenId: String(positionId),
            liquidityPercentage,
            slippageTolerance: new Percent(1, 100),
            deadline: Date.now() + txDeadline * 1000,
            collectOptions: {
                expectedCurrencyOwed0: feeValue0,
                expectedCurrencyOwed1: feeValue1,
                recipient: account,
            },
        });
    }, [positionId, positionSDK, txDeadline, feeValue0, feeValue1, liquidityPercentage, account, percent]);

    const removeLiquidityConfig = calldata
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainId],
              args: [calldata as `0x${string}`[]] as const,
              value: BigInt(value || 0),
          }
        : calldata;

    const { data: removeLiquidityData, writeContract: removeLiquidity, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading: isRemoveLoading, isSuccess } = useTransactionAwait(removeLiquidityData, {
        title: "Remove liquidity",
        tokenA: position?.token0 as Address,
        tokenB: position?.token1 as Address,
        type: TransactionType.POOL,
    });

    const isDisabled = sliderValue[0] === 0 || isRemoveLoading || !removeLiquidity || isPending;

    useEffect(() => {
        onPercentSelect(sliderValue[0]);
    }, [sliderValue]);

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
    }, [isSuccess]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant || "outline"} className={triggerClassName || "w-full"}>
                    Remove Liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="md:min-w-[500px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Remove Liquidity</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <h2 className="text-3xl font-bold select-none">{`${sliderValue}%`}</h2>

                    { enableActions && <div className="flex gap-2">
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
                    </div> }

                    { enableActions && <Slider
                        value={sliderValue}
                        id="liquidity-percent"
                        max={100}
                        defaultValue={sliderValue}
                        step={1}
                        onValueChange={(v) => setSliderValue(v)}
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        aria-label="Liquidity Percent"
                        disabled={isRemoveLoading}
                    /> }

                    <CurrencyAmounts
                        amount0Parsed={liquidityValue0?.toSignificant(24)}
                        amount1Parsed={liquidityValue1?.toSignificant(24)}
                        token0={liquidityValue0?.currency}
                        token1={liquidityValue1?.currency}
                    />

                    <Button variant={'primary'} disabled={isDisabled} onClick={() => removeLiquidityConfig && removeLiquidity(removeLiquidityConfig)}>
                        {isRemoveLoading || isPending ? <Loader /> : "Remove Liquidity"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

RemoveLiquidityModal.whyDidYouRender = true;

export default RemoveLiquidityModal;
