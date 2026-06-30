import { FormattedPosition } from "@/types/formatted-position";
import { formatAmount } from "@/utils/common/formatAmount";
import FilterPopover from "../FilterPopover";
import { ListFilter } from "lucide-react";

interface MyPositionsToolbar {
    positionsData: FormattedPosition[];
}

const MyPositionsToolbar = ({ positionsData }: MyPositionsToolbar) => {
    const [myLiquidityUSD, myFeesUSD] = positionsData
        ? positionsData.reduce((acc, { liquidityUSD, feesUSD }) => [acc[0] + liquidityUSD, acc[1] + Number(feesUSD)], [0, 0])
        : [];

    const activePositions = positionsData.filter(({ isALM, isClosed, onFarming }) => !isALM && !isClosed && !onFarming).length;
    const farmingPositions = positionsData.filter(({ isClosed, onFarming }) => !isClosed && onFarming).length;
    const almPositions = positionsData.filter(({ isALM, isClosed, onFarming }) => isALM && !isClosed && !onFarming).length;

    const summaryItems = [
        {
            label: "Positions",
            value: (activePositions + farmingPositions + almPositions).toString(),
        },
        {
            label: "Liquidity",
            value: `$${formatAmount(myLiquidityUSD || 0, 2)}`,
        },
        {
            label: "Fees",
            value: `$${formatAmount(myFeesUSD || 0, 2)}`,
        },
    ];

    if (!positionsData.length) {
        return null;
    }

    return (
        <div className="flex w-full flex-col gap-3 pb-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold leading-tight text-text-100">My Positions</h2>

                <FilterPopover>
                    <ListFilter size={18} />
                </FilterPopover>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {summaryItems.map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex min-h-20 flex-col items-start justify-center rounded-2xl border border-card-border bg-card/70 px-5 py-4 text-left"
                    >
                        <span className="text-sm font-semibold text-text-300">{label}</span>
                        <span className="text-lg font-semibold text-text-100">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPositionsToolbar;
