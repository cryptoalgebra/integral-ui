import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useReadPredictionMarketNoBalance,
    useReadPredictionMarketPreviewBuyNo,
    useReadPredictionMarketPreviewBuyYes,
    useReadPredictionMarketPriceNo,
    useReadPredictionMarketPriceYes,
    useReadPredictionMarketYesBalance,
    useSimulatePredictionMarketSellNo,
    useSimulatePredictionMarketSellYes,
} from "@/generated";
import { useCurrency } from "@/hooks/common/useCurrency";
import { cn, formatAmount } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { PredictionButton } from "../";
import { useSearchParams } from "react-router-dom";
import { SingleMarketUserTradesDocument, UserPosition } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { PredictionMarket } from "../../types";
import { delay } from "@/utils/common/delay";
import { poll } from "@/utils/common/poll";

interface IPredictionSideSelector {
    market: PredictionMarket | undefined;
    userPosition: UserPosition | undefined;
    action: "buy" | "sell";
    isOneHourMarket: boolean;
}

export function PredictionSideSelector({ market, action, isOneHourMarket, userPosition }: IPredictionSideSelector) {
    const [searchParams] = useSearchParams();
    const buyFromParam = searchParams.get("buy") as "yes" | "no";

    const { address: account } = useAccount();

    const { predictionClient } = useClients();

    const [side, setSide] = useState<"yes" | "no">("yes");
    const [value, setValue] = useState("");

    const { data: priceYes, refetch: refetchPriceYes } = useReadPredictionMarketPriceYes({
        address: market?.id,
    });

    const { data: priceNo, refetch: refetchPriceNo } = useReadPredictionMarketPriceNo({
        address: market?.id,
    });

    const { data: previewBuyNo, refetch: refetchPreviewBuyNo } = useReadPredictionMarketPreviewBuyNo({
        address: market?.id,
        args: [parseUnits(value, 6)],
    });

    const { data: previewBuyYes, refetch: refetchPreviewBuyYes } = useReadPredictionMarketPreviewBuyYes({
        address: market?.id,
        args: [parseUnits(value, 6)],
    });

    const { data: previewSellNo } = useSimulatePredictionMarketSellNo({
        address: market?.id,
        args: [parseUnits(value, 6), 0n],
    });

    const { data: previewSellYes } = useSimulatePredictionMarketSellYes({
        address: market?.id,
        args: [parseUnits(value, 6), 0n],
    });

    const { data: yesBalance, refetch: refetchYesBalance } = useReadPredictionMarketYesBalance({
        address: market?.id,
        args: account ? [account] : undefined,
    });

    const { data: noBalance, refetch: refetchNoBalance } = useReadPredictionMarketNoBalance({
        address: market?.id,
        args: account ? [account] : undefined,
    });

    const [winNo, youPayNo, feeNo] = previewBuyNo || [];
    const [winYes, youPayYes, feeYes] = previewBuyYes || [];

    const [win, toPay, fee] = side === "no" ? [winNo, youPayNo, feeNo] : [winYes, youPayYes, feeYes];
    const sellFor = side === "no" ? (previewSellNo ? previewSellNo.result : 0n) : previewSellYes ? previewSellYes.result : 0n;

    const collateralToken = useCurrency(market?.collateralToken);

    const formattedYesPrice = priceYes ? (Number(formatUnits(priceYes, 18)) * 100).toFixed(2) : 0;
    const formattedNoPrice = priceNo ? (Number(formatUnits(priceNo, 18)) * 100).toFixed(2) : 0;

    const handleInput = (value: string) => {
        let _value = value;
        if (value === ".") {
            _value = "0.";
        }
        setValue?.(_value);
    };

    const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
        address: account,
        token: market?.collateralToken,
    });

    const balanceString = useMemo(() => {
        if (action === "buy") {
            if (isBalanceLoading) return "Loading...";
            return formatAmount(balance?.formatted || "0", 6);
        }

        if (side === "no") {
            if (noBalance === undefined) {
                return "0";
            }
            return formatUnits(noBalance, 6);
        }

        if (side === "yes") {
            if (yesBalance === undefined) {
                return "0";
            }
            return formatUnits(yesBalance, 6);
        }
    }, [balance, isBalanceLoading, yesBalance, noBalance, side, action]);

    useEffect(() => {
        if (buyFromParam) {
            setSide(buyFromParam);
        }
    }, [buyFromParam]);

    const showMax = balanceString !== "0" && balanceString !== "Loading...";

    const handleMax = () => {
        if (action === "buy") {
            return handleInput(balance?.formatted || "0");
        }

        if (side === "no") {
            if (noBalance === undefined) {
                return "0";
            }
            return handleInput(formatUnits(noBalance, 6));
        }

        if (side === "yes") {
            if (yesBalance === undefined) {
                return "0";
            }
            return handleInput(formatUnits(yesBalance, 6));
        }
    };

    const handleRefetch = async () => {
        console.log("Refetching data...");
        await delay(1_000);

        // on-chain
        await Promise.all([
            refetchYesBalance(),
            refetchNoBalance(),
            refetchBalance(),
            refetchPriceNo(),
            refetchPriceYes(),
            refetchPreviewBuyYes(),
            refetchPreviewBuyNo(),
        ]);

        // subgraph
        await poll(() =>
            predictionClient.refetchQueries({
                include: [SingleMarketUserTradesDocument],
            }),
        );
    };

    useEffect(() => {
        handleInput("");
    }, [action]);

    if (!market) return null;

    return (
        <div>
            <div className="grid grid-cols-2 gap-2">
                <Button
                    onClick={() => setSide("yes")}
                    className={cn(
                        "w-full gap-1 bg-white/5 border border-card-border",
                        side === "yes" ? "bg-lime-600 hover:bg-lime-600" : "hover:bg-card-hover",
                    )}
                >
                    <span className="text-white/70">{isOneHourMarket ? "Up" : "Yes"}</span>
                    {priceYes !== undefined && collateralToken && <span>{formattedYesPrice}¢</span>}
                </Button>
                <Button
                    onClick={() => setSide("no")}
                    className={cn(
                        "w-full gap-1 bg-white/5 border border-card-border",
                        side === "no" ? "bg-orange-600 hover:bg-orange-600" : "hover:bg-card-hover",
                    )}
                >
                    <span className="text-white/70">{isOneHourMarket ? "Down" : "No"}</span>
                    {priceNo !== undefined && collateralToken && <span>{formattedNoPrice}¢</span>}
                </Button>
            </div>
            <div className="flex flex-col mt-2 bg-card-dark border border-card-border rounded-lg text-left">
                <div className="flex items-center p-4 pb-2">
                    <div className="flex w-full items-center gap-2">
                        <CurrencyLogo currency={collateralToken} size={36} />
                        <div className="whitespace-no-wrap">
                            <div className="uppercase text-xs text-text-200">{`You ${action === "sell" ? `sell` : `pay`}`}</div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{collateralToken ? collateralToken.symbol : ""}</span>
                            </div>
                        </div>
                    </div>
                    <Input
                        type={"text"}
                        value={value}
                        id={`amount-${collateralToken?.symbol}`}
                        onUserInput={(v) => handleInput(v)}
                        className={cn(
                            `text-right border-none text-xl font-bold w-9/12 p-0 disabled:cursor-default disabled:text-text/80 ring-0!`,
                        )}
                        placeholder={"0.0"}
                        maxDecimals={collateralToken?.decimals}
                    />
                </div>
                <div className="flex items-center justify-between px-4 pb-3 text-sm whitespace-nowrap">
                    <div className="text-text-200">
                        <span className="font-semibold">Balance: </span>
                        <span>{balanceString}</span>
                    </div>
                    {showMax && (
                        <button
                            onClick={handleMax}
                            className="text-sm text-primary-50 pb-1 underline underline-offset-4 hover:text-primary-50/70"
                        >
                            Max
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center p-4 pb-2 mt-1 mb-2 bg-card-dark border border-card-border rounded-lg">
                <div className="flex w-full items-center gap-2">
                    <CurrencyLogo currency={collateralToken} size={36} />
                    <div className="whitespace-no-wrap">
                        <div className="uppercase text-xs text-text-200">{`You ${action === "sell" ? `get` : `win`}`}</div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{collateralToken ? collateralToken.symbol : ""}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-lime-300">
                        {action === "buy" ? (
                            <span>{win ? formatUnits(win, 6) : 0}</span>
                        ) : (
                            <span>{sellFor ? formatUnits(sellFor, 6) : 0}</span>
                        )}
                    </div>
                    {action === "buy" && (
                        <div className="text-text-200 text-sm whitespace-nowrap">
                            <span className="font-semibold">Fee: </span>
                            <span>{fee ? formatUnits(fee, 6) : 0}</span>
                        </div>
                    )}
                </div>
            </div>
            <PredictionButton
                market={market}
                userPosition={userPosition}
                side={side}
                action={action}
                amountToPay={value}
                shares={win}
                maxTotalCost={toPay}
                collateralToken={collateralToken}
                balance={balance?.value}
                yesBalance={yesBalance}
                noBalance={noBalance}
                refetch={handleRefetch}
            />
        </div>
    );
}
