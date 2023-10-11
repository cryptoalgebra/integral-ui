import CurrencyLogo from "@/components/common/CurrencyLogo";
import { IDerivedMintInfo } from "@/state/mintStore";
import { useMemo } from "react";

interface TokenRatioProps {
    mintInfo: IDerivedMintInfo;
}

const TokenRatio = ({ mintInfo }: TokenRatioProps) => {

    const { currencies: { CURRENCY_A: currencyA, CURRENCY_B: currencyB }, ticksAtLimit } = mintInfo

    const { LOWER: tickLowerAtLimit, UPPER: tickUpperAtLimit } = ticksAtLimit

    const [token0Ratio, token1Ratio] = useMemo(() => {
        const currentPrice = mintInfo.price?.toSignificant(5);

        const left = mintInfo.lowerPrice?.toSignificant(5);
        const right = mintInfo.upperPrice?.toSignificant(5);

        if (tickUpperAtLimit) return ["50", "50"];

        if (!currentPrice) return ["0", "0"];

        if (!left && !right) return ["0", "0"];

        if (!left && right) return ["0", "100"];

        if (!right && left) return ["100", "0"];

        if (mintInfo.depositADisabled) {
            return ["0", "100"];
        }

        if (mintInfo.depositBDisabled) {
            return ["100", "0"];
        }

        if (left && right && currentPrice) {
            const leftRange = +currentPrice - +left;
            const rightRange = +right - +currentPrice;

            const totalSum = +leftRange + +rightRange;

            const leftRate = (+leftRange * 100) / totalSum;
            const rightRate = (+rightRange * 100) / totalSum;

            if (mintInfo.invertPrice) {
                return [String(leftRate), String(rightRate)];
            } else {
                return [String(rightRate), String(leftRate)];
            }
        }

        return ["0", "0"];
    }, [mintInfo, tickLowerAtLimit, tickUpperAtLimit]);

    return  <div className="relative flex h-[30px] bg-card-dark rounded-xl">
    <div className="flex w-full h-full font-semibold">
        {Number(token0Ratio) > 0 && <div className={`flex items-center justify-end pl-1 pr-2 h-full bg-[#143e65] border border-[#36f] duration-300 ${Number(token0Ratio) === 100 ? 'rounded-2xl' : 'rounded-l-2xl'}`} style={{ width: `${token0Ratio}%` }}>
            <CurrencyLogo currency={currencyA} size={26} className="absolute left-1" />
            {`${Number(token0Ratio).toFixed()}%`}
        </div>}
        {Number(token1Ratio) > 0 && <div className={`flex items-center pr-1 pl-2 h-full bg-[#351d6b] border border-[#996cff] duration-300 ${Number(token1Ratio) === 100 ? 'rounded-2xl' : 'rounded-r-2xl'}`} style={{ width: `${token1Ratio}%` }}>
            {`${Number(token1Ratio).toFixed()}%`}
            <CurrencyLogo currency={currencyB} size={26} className="absolute right-1" />
        </div>}
    </div>
</div>

}

export default TokenRatio