import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Deposit } from "@/graphql/generated/graphql";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useNFTPermit, NFTPermitState } from "@/hooks/common/useNFTPermit";
import { useClients } from "@/hooks/graphql/useClients";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from "@/state/burnStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { Percent } from "@cryptoalgebra/custom-pools-sdk";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

interface RemoveLiquidityModalProps {
    positionId: number;
}

const RemoveLiquidityModal = ({ positionId }: RemoveLiquidityModalProps) => {
    const [sliderValue, setSliderValue] = useState([50]);
    const [token0Unwrap, setToken0Unwrap] = useState(false);
    const [token1Unwrap, setToken1Unwrap] = useState(false);

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

    // Determine if tokens are boosted
    const token0 = positionSDK?.pool.token0;
    const token1 = positionSDK?.pool.token1;
    const isBoostedToken0 = token0 && (token0.isBoosted);
    const isBoostedToken1 = token1 && (token1.isBoosted);

    // NFT Permit for OmegaRouter
    const { permitState, permitCallback, permitSignature, isLoading: isPermitLoading } = useNFTPermit({
        tokenId: positionId,
        spender: chainId ? OMEGA_ROUTER[chainId] : undefined,
    });

    const needsPermit = permitState === NFTPermitState.NOT_PERMITTED;

    const { calldata, value } = useMemo(() => {
        if (!positionSDK || !positionId || !liquidityPercentage || !feeValue0 || !feeValue1 || !account || percent === 0 || !permitSignature)
            return { calldata: undefined, value: undefined };


        return OmegaRouter.removeCallParameters(positionSDK, {
            tokenId: String(positionId),
            liquidityPercentage,
            slippageTolerance: new Percent(1, 100),
            deadline: Date.now() + txDeadline * 1000,
            burnToken: liquidityPercentage.equalTo(new Percent(1)),
            token0Unwrap,
            token1Unwrap,
            permit: permitSignature,
            recipient: account,
        });
    }, [positionId, positionSDK, txDeadline, feeValue0, feeValue1, liquidityPercentage, account, percent, token0Unwrap, token1Unwrap, permitSignature]);

    const removeLiquidityConfig = useMemo(() => {
        if (!calldata) return undefined;

        return {
            to: OMEGA_ROUTER[chainId],
            data: calldata as `0x${string}`,
            value: BigInt(value || 0),
        };
    }, [calldata, value, chainId]);

    const { data: removeLiquidityData, sendTransactionAsync: removeLiquidity, isPending } = useSendTransaction();

    const { isLoading: isRemoveLoading, isSuccess } = useTransactionAwait(removeLiquidityData, {
        title: "Remove liquidity",
        tokenA: position?.token0 as Address,
        tokenB: position?.token1 as Address,
        type: TransactionType.POOL,
    });

    const isDisabled = sliderValue[0] === 0 || isRemoveLoading || isPending || isPermitLoading || (!needsPermit && !removeLiquidityConfig);

    const handleRemoveLiquidity = async () => {
        if (needsPermit) {
            await permitCallback();
            return;
        }

        if (!removeLiquidityConfig) return;

        removeLiquidity(removeLiquidityConfig);
    };

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

                    {(isBoostedToken0 || isBoostedToken1) && (
                        <div className="flex flex-col gap-3 p-4 bg-card-dark rounded-2xl border border-card-border">
                            <h3 className="text-sm font-semibold text-muted-foreground">Receive tokens as:</h3>
                            
                            {isBoostedToken0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            {token0Unwrap ? unwrappedToken(token0.underlying).symbol : token0.symbol}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {token0Unwrap 
                                                ? `Receive ${unwrappedToken(token0.underlying).symbol} (underlying)` 
                                                : `Receive ${token0.symbol} (boosted)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {token0Unwrap ? "Underlying" : "Boosted"}
                                        </span>
                                        <Switch 
                                            checked={token0Unwrap} 
                                            onCheckedChange={setToken0Unwrap}
                                            disabled={isRemoveLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {isBoostedToken1 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            {token1Unwrap ? unwrappedToken(token1.underlying).symbol : token1.symbol}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {token1Unwrap 
                                                ? `Receive ${unwrappedToken(token1.underlying).symbol} (underlying)` 
                                                : `Receive ${token1.symbol} (boosted)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {token1Unwrap ? "Underlying" : "Boosted"}
                                        </span>
                                        <Switch 
                                            checked={token1Unwrap} 
                                            onCheckedChange={setToken1Unwrap}
                                            disabled={isRemoveLoading}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button 
                        variant={'primary'} 
                        disabled={isDisabled} 
                        onClick={handleRemoveLiquidity}
                    >
                        {isRemoveLoading || isPending || isPermitLoading ? (
                            <Loader />
                        ) : needsPermit ? (
                            "Sign Permit"
                        ) : (
                            "Remove Liquidity"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

RemoveLiquidityModal.whyDidYouRender = true;

export default RemoveLiquidityModal;
