import { FormattedPosition } from "@/types/formatted-position";
import { formatPlural } from "@/utils/common/formatPlural";
import { formatAmount } from "@/utils/common/formatAmount";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import FilterPopover from "../FilterPopover";
import { Settings2 } from "lucide-react";

interface MyPositionsToolbar {
    positionsData: FormattedPosition[];
    currencyA: Currency | undefined | null;
    currencyB: Currency | undefined | null;
}

const MyPositionsToolbar = ({ positionsData, currencyA, currencyB }: MyPositionsToolbar) => {
    const [myLiquidityUSD, myFeesUSD] = positionsData
        ? positionsData.reduce((acc, { liquidityUSD, feesUSD }) => [acc[0] + liquidityUSD, acc[1] + Number(feesUSD)], [0, 0])
        : [];

    return (
        <div className="flex gap-3 md:flex-row pb-3 items-center min-h-16 justify-between mb-3 w-full">
            <div className="flex w-full col-span-3 items-start gap-4 flex-col">
                <div className="flex items-center gap-4 justify-between w-full">
                    <CurrencyLogo currency={currencyA} size={40} />
                    <CurrencyLogo currency={currencyB} size={40} className="-ml-6" />
                    <h1 className="scroll-m-20 font-bold tracking-tight lg:text-2xl">
                        {currencyA?.symbol} / {currencyB?.symbol}
                    </h1>

                    <div className="ml-auto">
                        <FilterPopover>
                            <Settings2 className="w-fit h-fit" />
                        </FilterPopover>
                    </div>
                </div>
                {myLiquidityUSD ? (
                    <div className="flex items-center gap-4">
                        <div className="font-semibold">{`${positionsData?.length} ${formatPlural(
                            positionsData.length,
                            "position",
                            "positions"
                        )}`}</div>
                        <div className="w-1.5 h-1.5 bg-white/5 border border-white/25 rotate-45" />
                        <div className="text-cyan-200 font-semibold">{`$${formatAmount(myLiquidityUSD || 0, 2)} TVL`}</div>
                        <div className="w-1.5 h-1.5 bg-white/5 border border-white/25 rotate-45" />
                        <div className="text-green-300 font-semibold">{`$${formatAmount(myFeesUSD || 0, 2)} Fees`}</div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MyPositionsToolbar;
