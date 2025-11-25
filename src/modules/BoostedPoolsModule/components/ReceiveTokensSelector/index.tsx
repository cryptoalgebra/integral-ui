import { Switch } from "@/components/ui/switch";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";

interface ReceiveTokensSelectorProps {
    token0?: Currency;
    token1?: Currency;
    amount0?: CurrencyAmount<Currency>;
    amount1?: CurrencyAmount<Currency>;
    token0Unwrap: boolean;
    token1Unwrap: boolean;
    onToken0UnwrapChange: (checked: boolean) => void;
    onToken1UnwrapChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const ReceiveTokensSelector = ({
    token0,
    token1,
    amount0,
    amount1,
    token0Unwrap,
    token1Unwrap,
    onToken0UnwrapChange,
    onToken1UnwrapChange,
    disabled = false,
}: ReceiveTokensSelectorProps) => {
    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;

    const showToken0 = isBoostedToken0 && amount0 && amount0.greaterThan("0");
    const showToken1 = isBoostedToken1 && amount1 && amount1.greaterThan("0");

    if (!showToken0 && !showToken1) return null;

    return (
        <div className="flex flex-col gap-3 p-4 bg-card-dark rounded-2xl border border-card-border">
            <h3 className="text-sm font-semibold text-muted-foreground">Receive tokens as:</h3>

            {showToken0 && (
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
                        <span className="text-xs text-muted-foreground">{token0Unwrap ? "Underlying" : "Boosted"}</span>
                        <Switch checked={token0Unwrap} onCheckedChange={onToken0UnwrapChange} disabled={disabled} />
                    </div>
                </div>
            )}

            {showToken1 && (
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
                        <span className="text-xs text-muted-foreground">{token1Unwrap ? "Underlying" : "Boosted"}</span>
                        <Switch checked={token1Unwrap} onCheckedChange={onToken1UnwrapChange} disabled={disabled} />
                    </div>
                </div>
            )}
        </div>
    );
};
