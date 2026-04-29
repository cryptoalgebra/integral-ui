import CurrencyLogo from "@/components/common/CurrencyLogo";
import { IDerivedMintInfo } from "@/state/mintStore";
import { nearestUsableTick, priceToClosestTick, TickMath } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";

interface TokenRatioProps {
    mintInfo: IDerivedMintInfo;
}

const TokenRatio = ({ mintInfo }: TokenRatioProps) => {
    const {
        currencies: { CURRENCY_A: currencyA, CURRENCY_B: currencyB },
    } = mintInfo;

    const [token0Ratio, token1Ratio] = useMemo(() => {
        const tickUpperAtLimit =
            mintInfo.upperPrice && nearestUsableTick(TickMath.MAX_TICK, mintInfo.tickSpacing) === priceToClosestTick(mintInfo.upperPrice);
        const currentPrice = mintInfo.price?.toSignificant(5);

        const left = mintInfo.lowerPrice?.toSignificant(5);
        const right = mintInfo.upperPrice?.toSignificant(5);

        if (tickUpperAtLimit) return ["50", "50"];

        if (!currentPrice) return ["0", "0"];

        if (!left && !right) return ["0", "0"];

        if (!left && right) return ["0", "100"];

        if (!right && left) return ["100", "0"];

        if (left && right && currentPrice) {
            const leftRange = +currentPrice - +left;
            const rightRange = +right - +currentPrice;

            const totalSum = +leftRange + +rightRange;

            const leftRate = (+leftRange * 100) / totalSum;
            const rightRate = (+rightRange * 100) / totalSum;

            if (!mintInfo.invertPrice) {
                return [String(rightRate >= 100 ? 100 : rightRate), String(leftRate >= 100 ? 100 : leftRate)];
            }
            return [String(leftRate >= 100 ? 100 : leftRate), String(rightRate >= 100 ? 100 : rightRate)];
        }

        return [null, null];
    }, [mintInfo.invertPrice, mintInfo.lowerPrice, mintInfo.price, mintInfo.tickSpacing, mintInfo.upperPrice]);

    if (!token0Ratio && !token1Ratio) return null;

    const token0Value = Number(token0Ratio || 0);
    const token1Value = Number(token1Ratio || 0);

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-full bg-card">
                <div className="flex h-2.5 gap-1.5 w-full overflow-hidden">
                    <div className="bg-primary transition-[width] duration-300" style={{ width: `${token0Value}%` }} />
                    <div className="bg-accent transition-[width] duration-300" style={{ width: `${token1Value}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs font-medium text-text">
                <div className="flex items-center gap-2">
                    <CurrencyLogo currency={currencyA} size={20} />
                    <span>{`${currencyA?.symbol ?? "-"} (${token0Value.toFixed()}%)`}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                    <span>{`${currencyB?.symbol ?? "-"} (${token1Value.toFixed()}%)`}</span>
                    <CurrencyLogo currency={currencyB} size={20} />
                </div>
            </div>
        </div>
    );
};
export default TokenRatio;
