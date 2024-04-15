import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { usePrepareAlgebraPositionManagerMulticall } from "@/generated";
import { farmingClient } from "@/graphql/clients";
import { Deposit } from "@/graphql/generated/graphql";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from "@/state/burnStore";
import { useUserState } from "@/state/userStore";
import { NonfungiblePositionManager, Percent } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo, useState } from "react";
import { Address, useAccount, useContractWrite } from "wagmi";

interface RemoveLiquidityModalProps {
    positionId: number;
}

const RemoveLiquidityModal = ({ positionId }: RemoveLiquidityModalProps) => {

    const [sliderValue, setSliderValue] = useState([50])

    const { txDeadline } = useUserState()
    const { address: account } = useAccount();

    const { refetch: refetchAllPositions } = usePositions();

    const { position, refetch: refetchPosition } = usePosition(positionId);

    const { percent } = useBurnState();

    const { onPercentSelect } = useBurnActionHandlers()

    const derivedInfo = useDerivedBurnInfo(position, false);

    const {
        position: positionSDK,
        liquidityPercentage,
        feeValue0,
        feeValue1,
    } = derivedInfo;

    const { calldata, value } = useMemo(() => {
        if (
            !positionSDK ||
            !positionId ||
            !liquidityPercentage ||
            !feeValue0 ||
            !feeValue1 ||
            !account ||
            percent === 0
        )
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
    }, [
        positionId,
        positionSDK,
        txDeadline,
        feeValue0,
        feeValue1,
        liquidityPercentage,
        account,
        percent,
    ]);

    const { config: removeLiquidityConfig } = usePrepareAlgebraPositionManagerMulticall({
        args: calldata && [calldata as `0x${string}`[]],
        value: BigInt(value || 0),
        enabled: Boolean(calldata)
    });

    const { data: removeLiquidityData, write: removeLiquidity } = useContractWrite(removeLiquidityConfig)

    const { isLoading: isRemoveLoading, isSuccess } = useTransitionAwait(
        removeLiquidityData?.hash,
        'Remove liquidity',
        '',
        '',
        position?.token0 as Address,
        position?.token1 as Address
    )

    const isDisabled = sliderValue[0] === 0 || isRemoveLoading || !removeLiquidity

    useEffect(() => {
        onPercentSelect(sliderValue[0])
    }, [sliderValue])

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
                if(sliderValue[0] !== 100) return;
                interval = setInterval(
                    () =>
                        farmingClient.refetchQueries({
                            include: ['Deposits'],
                            onQueryUpdated: (query, { result: diff }) => {
                                const currentPos = diff.deposits.find(
                                    (deposit: Deposit) =>
                                        deposit.id.toString() === positionId.toString()
                                );
                                if (!currentPos) return;

                                if (currentPos.eternalFarming === null) {
                                    query.refetch().then(() => {
                                        clearInterval(interval);
                                    });
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

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={'outline'} className="w-full" >Remove Liquidity</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl bg-card-dark" style={{ borderRadius: '32px' }}>
            <DialogHeader>
                <DialogTitle className="font-bold select-none">Remove Liquidity</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6">

                <h2 className="text-3xl font-bold select-none">{`${sliderValue}%`}</h2>

                <div className="flex gap-2">
                    {[25, 50, 75, 100].map((v) => (
                        <Button
                            disabled={isRemoveLoading}
                            variant={'icon'}
                            className="border border-card-border"
                            size={'sm'}
                            onClick={() => setSliderValue([v])}>{v}%</Button>
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

                <Button disabled={isDisabled} onClick={() => removeLiquidity && removeLiquidity()}>
                    {isRemoveLoading ? <Loader /> : 'Remove Liquidity'}
                </Button>

            </div>

        </DialogContent>
    </Dialog>


}

RemoveLiquidityModal.whyDidYouRender = true

export default RemoveLiquidityModal;