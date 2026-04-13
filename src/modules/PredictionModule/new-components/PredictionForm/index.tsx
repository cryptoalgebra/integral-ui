import { FormContainer } from "@/components/common/FormContainer";
import { SwapTypeSelector } from "@/components/swap/SwapTypeSelector";
import TokenCard from "@/components/swap/TokenCard";
import { useCurrency } from "@/hooks/common/useCurrency";
import { SwapPageView } from "@/pages/Swap/types";
import { cn } from "@/utils";
import { useState, useCallback, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { PredictionButton } from "../../components";
import { useUserPositionByMarket, usePredictionSell } from "../../hooks";
import { PredictionMarket } from "../../types";
import { PredictionParams } from "../PredictionParams";
import { PredictionQuestion } from "../PredictionQuestion";
import { PredictionSideSelector } from "../PredictionSideSelector";
import { useSearchParams } from "react-router-dom";
import {
    useReadBinaryLmsrMarketManagerNoBalance,
    useReadBinaryLmsrMarketManagerPreviewBuyNo,
    useReadBinaryLmsrMarketManagerPreviewBuyYes,
    useReadBinaryLmsrMarketManagerPriceNo,
    useReadBinaryLmsrMarketManagerPriceYes,
    useReadBinaryLmsrMarketManagerYesBalance,
} from "@/generated";
import { Button } from "@/components/ui/button";

interface PredictionFormProps {
    market: PredictionMarket | undefined;
    initialSide?: "yes" | "no";
}

export function PredictionForm({ market, initialSide }: PredictionFormProps) {
    const [searchParams] = useSearchParams();
    const buyFromParam = searchParams.get("buy") as "yes" | "no";

    const { address: account } = useAccount();

    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [side, setSide] = useState<"yes" | "no">(initialSide || "yes");
    const [amount, setAmount] = useState("");

    // Set side when initialSide prop changes (from FeaturedMarketCard)
    useEffect(() => {
        if (initialSide) {
            setSide(initialSide);
            setAction("buy");
        }
    }, [initialSide]);

    const { data: userPosition } = useUserPositionByMarket(account, market?.id);

    const marketCurrency = useCurrency(market?.marketToken);
    const quoteCurrency = useCurrency(market?.quoteToken);
    const collateralCurrency = useCurrency(market?.collateralToken);

    const { data: priceYes, refetch: refetchPriceYes } = useReadBinaryLmsrMarketManagerPriceYes({
        args: market && [market.index],
    });

    const { data: priceNo, refetch: refetchPriceNo } = useReadBinaryLmsrMarketManagerPriceNo({
        args: market && [market.index],
    });

    const { data: previewBuyNo, refetch: refetchPreviewBuyNo } = useReadBinaryLmsrMarketManagerPreviewBuyNo({
        args: market && [market.index, parseUnits(amount || "0", 6)],
    });

    const { data: previewBuyYes, refetch: refetchPreviewBuyYes } = useReadBinaryLmsrMarketManagerPreviewBuyYes({
        args: market && [market.index, parseUnits(amount || "0", 6)],
    });

    const { data: yesBalance, refetch: refetchYesBalance } = useReadBinaryLmsrMarketManagerYesBalance({
        args: account ? market && [market.index, account] : undefined,
    });

    const { data: noBalance, refetch: refetchNoBalance } = useReadBinaryLmsrMarketManagerNoBalance({
        args: account && market ? [market.index, account] : undefined,
    });

    // Sell preview
    const { simulationResult: sellSimulationResult } = usePredictionSell(market, amount, side, () => {});

    const [winNo, youPayNo] = previewBuyNo || [];
    const [winYes, youPayYes] = previewBuyYes || [];

    const [amountToWin, maxAmountToPay] = side === "no" ? [winNo, youPayNo] : [winYes, youPayYes];

    const { refetch: refetchBalance } = useBalance({
        address: account,
        token: market?.collateralToken,
    });

    const refetch = useCallback(async () => {
        await Promise.all([
            refetchPriceYes(),
            refetchPriceNo(),
            refetchPreviewBuyYes(),
            refetchPreviewBuyNo(),
            refetchBalance(),
            refetchYesBalance(),
            refetchNoBalance(),
        ]);
    }, [refetchPriceYes, refetchPriceNo, refetchPreviewBuyYes, refetchPreviewBuyNo, refetchBalance, refetchYesBalance, refetchNoBalance]);

    const positionBalance = side === "yes" ? yesBalance : noBalance;
    const formattedPositionBalance = positionBalance ? formatUnits(positionBalance, 6) : "0";
    const hasPosition = Boolean(positionBalance && positionBalance > 0n);

    const handleActionChange = (newAction: "buy" | "sell") => {
        setAction(newAction);
        setAmount("");
    };

    useEffect(() => {
        if (buyFromParam) {
            setSide(buyFromParam);
        }
    }, [buyFromParam]);

    if (!market) {
        return (
            <>
                <FormContainer>
                    <SwapTypeSelector type={SwapPageView.PREDICTION} />
                    <TokenCard
                        label="You Pay"
                        value={amount}
                        currency={collateralCurrency}
                        handleValueChange={setAmount}
                        usdValue={undefined}
                        showPercentButtons={true}
                    />
                </FormContainer>
                <Button variant={"primary"} className="w-full" disabled>
                    No markets available
                </Button>
            </>
        );
    }

    return (
        <>
            <FormContainer>
                <div className="flex items-center justify-between">
                    <SwapTypeSelector type={SwapPageView.PREDICTION} />

                    <div className="relative flex w-fit rounded-xl bg-card-light overflow-hidden">
                        <button
                            onClick={() => handleActionChange("buy")}
                            className={cn(
                                "relative z-10 px-6 py-3 text-sm font-medium transition-all",
                                action === "buy" ? "text-text bg-card-border/40" : "text-text-300 hover:text-text",
                                "rounded-l-xl",
                            )}
                        >
                            Buy
                        </button>

                        <button
                            onClick={() => handleActionChange("sell")}
                            disabled={!yesBalance && !noBalance}
                            className={cn(
                                "relative z-10 px-6 py-3 text-sm font-medium transition-all",
                                action === "sell" ? "text-text bg-card-border/40" : "text-text-300 hover:text-text",
                                "rounded-r-xl",
                                !yesBalance && !noBalance && "opacity-40 cursor-not-allowed hover:text-text-300",
                            )}
                        >
                            Sell
                        </button>
                    </div>
                </div>

                <PredictionQuestion market={market} marketCurrency={marketCurrency} quoteCurrency={quoteCurrency} />

                <PredictionSideSelector priceYes={priceYes} priceNo={priceNo} side={side} setSide={setSide} />

                {/* Position Info for Sell Mode */}
                {action === "sell" && hasPosition && (
                    <div className="flex items-center justify-between px-4 py-3 bg-card-dark rounded-xl border border-card-border">
                        <span className="text-sm text-text-300">Your {side.toUpperCase()} Position</span>
                        <span className="text-sm font-semibold text-white">${formattedPositionBalance}</span>
                    </div>
                )}

                {action === "buy" ? (
                    /* Buy Mode: Pay USDC amount */
                    <TokenCard
                        label="You Pay"
                        value={amount}
                        currency={collateralCurrency}
                        handleValueChange={setAmount}
                        usdValue={undefined}
                        showPercentButtons={true}
                    />
                ) : (
                    /* Sell Mode: Sell position amount */
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-text-300">Amount to Sell</span>
                            <button
                                onClick={() => setAmount(formattedPositionBalance)}
                                className="text-xs text-primary-100 hover:text-primary-200 transition-colors"
                            >
                                Max
                            </button>
                        </div>
                        <TokenCard
                            label="Sell"
                            value={amount}
                            currency={collateralCurrency}
                            handleValueChange={setAmount}
                            usdValue={undefined}
                            showPercentButtons={true}
                        />
                    </div>
                )}

                {/* Results */}
                {action === "buy" && amount && amountToWin ? <PredictionParams amountToWin={amountToWin} /> : null}

                {action === "sell" && amount && sellSimulationResult ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-card-dark rounded-xl border border-card-border">
                        <span className="text-sm text-text-300">You'll Receive</span>
                        <span className="text-3xl font-bold text-green-400">${formatUnits(sellSimulationResult, 6)}</span>
                    </div>
                ) : null}
            </FormContainer>
            <PredictionButton
                action={action}
                market={market}
                userPosition={userPosition}
                amountToPay={amount}
                maxAmountToPay={maxAmountToPay}
                amountToWin={amountToWin}
                collateralToken={collateralCurrency}
                yesBalance={yesBalance}
                noBalance={noBalance}
                refetch={refetch}
                side={side}
            />
        </>
    );
}
