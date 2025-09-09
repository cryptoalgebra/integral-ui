import CurrencyLogo from "@/components/common/CurrencyLogo";
import { IDerivedMintInfo } from "@/state/mintStore";
import { nearestUsableTick, priceToClosestTick, TickMath } from "@cryptoalgebra/custom-pools-sdk";
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

    return (
        <div className="relative flex h-[50px] min-h-[50px]">
            <div className="flex h-full w-full font-semibold">
                {Number(token0Ratio) > 0 && (
                    <div
                        className={`flex h-2 items-center justify-end bg-primary duration-300 ${
                            Number(token0Ratio) === 100 ? "rounded-xl" : "rounded-l-xl"
                        }`}
                        style={{ width: `${token0Ratio}%` }}
                    />
                )}
                <div className="absolute left-2 top-5 flex gap-2">
                    <CurrencyLogo currency={currencyA} size={24} />
                    {Number(token0Ratio) > 0 ? <span>{`${Number(token0Ratio).toFixed()}%`}</span> : <span>0%</span>}
                </div>

                {Number(token0Ratio) > 0 && Number(token1Ratio) > 0 ? <div className="h-full w-1" /> : null}

                {Number(token1Ratio) > 0 && (
                    <div
                        className={`flex h-2 items-center justify-end bg-accent duration-300 ${
                            Number(token1Ratio) === 100 ? "rounded-xl" : "rounded-r-xl"
                        }`}
                        style={{ width: `${token1Ratio}%` }}
                    />
                )}
                <div className="absolute right-2 top-5 flex gap-2">
                    <CurrencyLogo currency={currencyB} size={24} />
                    {Number(token1Ratio) > 0 ? <span>{`${Number(token1Ratio).toFixed()}%`}</span> : <span>0%</span>}
                </div>
            </div>
        </div>
    );
};
export default TokenRatio;
