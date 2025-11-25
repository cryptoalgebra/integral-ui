import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Currency, Field, tryParseAmount, BoostedToken } from "@cryptoalgebra/custom-pools-sdk";
import { ArrowLeftRight, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { useMintState } from "@/state/mintStore";
import { useBoostedConversion } from "../../hooks";

interface TokenWrapToggleProps {
    currency: Currency | undefined;
    field: Field;
    currentValue: string;
    onAmountChange: (value: string) => void;
}

export const BoostedTokenWrapToggle = ({ currency, field, currentValue, onAmountChange }: TokenWrapToggleProps) => {
    const client = usePublicClient();
    const [isConverting, setIsConverting] = useState(false);

    const { token0InputMode, token1InputMode, actions } = useMintState();
    const isBoosted = currency && currency.isBoosted;

    const isToken0 = field === Field.CURRENCY_A;
    const currentInputMode = isToken0 ? token0InputMode : token1InputMode;

    const displayToken = useMemo(() => {
        if (!isBoosted) return currency;
        const boosted = currency as BoostedToken;
        return currentInputMode === "underlying" ? boosted.underlying : boosted;
    }, [currency, isBoosted, currentInputMode]);

    // Calculate conversion for display
    const userAmount = useMemo(() => {
        if (!currentValue || !displayToken) return undefined;
        return tryParseAmount(currentValue, displayToken);
    }, [currentValue, displayToken]);

    const { outputAmount: poolAmount, isConverting: isCalculating } = useBoostedConversion(userAmount, currency, "underlying-to-boosted");

    const handleToggleWrap = async () => {
        if (!isBoosted || !client) return;

        setIsConverting(true);

        try {
            const boosted = currency as BoostedToken;
            const newMode = currentInputMode === "underlying" ? "boosted" : "underlying";

            // Calculate new amount through conversion
            const currentDecimals = currentInputMode === "underlying" ? boosted.underlying.decimals : boosted.decimals;
            const amount = BigInt(Math.floor(Number(currentValue) * 10 ** currentDecimals));

            let convertedAmount: bigint;

            if (currentInputMode === "underlying") {
                // Switching from underlying to boosted
                convertedAmount = await boosted.previewDeposit(amount);
            } else {
                // Switching from boosted to underlying
                convertedAmount = await boosted.previewRedeem(amount);
            }

            const newDecimals = newMode === "underlying" ? boosted.underlying.decimals : boosted.decimals;
            const newValue = (Number(convertedAmount) / 10 ** newDecimals).toString();

            // Update input mode
            if (isToken0) {
                actions.setToken0InputMode(newMode);
            } else {
                actions.setToken1InputMode(newMode);
            }

            // Update amount
            onAmountChange(newValue);
        } catch (error) {
            console.error("Error converting amount:", error);
        } finally {
            setIsConverting(false);
        }
    };

    if (!isBoosted) return null;

    const showConversionInfo = currentInputMode === "underlying" && poolAmount && currentValue && Number(currentValue) > 0;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleWrap}
                    disabled={isConverting}
                    className="flex items-center gap-1.5 h-7 text-xs"
                >
                    <ArrowLeftRight className="w-3 h-3" />
                    {currentInputMode === "underlying" ? "Use Boosted" : "Use Underlying"}
                </Button>

                <HoverCard>
                    <HoverCardTrigger>
                        <Info className="w-3.5 h-3.5 text-text-100/50 hover:text-text-100/80 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-card rounded-xl border border-card-border  w-72 text-sm">
                        <div className="flex flex-col gap-2">
                            <div className="font-bold text-text-100">Token Wrapping</div>
                            <div className="text-text-100/75">
                                {currentInputMode === "underlying" ? (
                                    <>
                                        Currently using <span className="text-primary-50">{displayToken?.symbol}</span> (underlying). Click
                                        to switch to boosted token and deposit into vault.
                                    </>
                                ) : (
                                    <>
                                        Currently using <span className="text-primary-50">{displayToken?.symbol}</span> (boosted). Click to
                                        switch to underlying token.
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-text-100/50 mt-1">
                                Amount will be automatically recalculated to maintain equivalent value.
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>

                {isConverting && <span className="text-xs text-text-100/50">Converting...</span>}
            </div>

            {showConversionInfo && (
                <div className="text-xs text-text-100/60">
                    {isCalculating ? (
                        <span>Calculating conversion...</span>
                    ) : (
                        <span>
                            ≈ {poolAmount.toSignificant(6)} {currency?.symbol} will be deposited
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
