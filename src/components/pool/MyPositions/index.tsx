import { myPositionsColumns } from "@/components/common/Table/myPositionsColumns";
import { Address } from "viem";
import { FormattedPosition } from "@/types/formatted-position";
import MyPositionsTable from "@/components/common/Table/myPositionsTable";

interface MyPositionsProps {
    positions: FormattedPosition[];
    poolId: Address | undefined;
    selectedPosition: string | undefined;
    selectPosition: (position: FormattedPosition | null) => void;
}

const MyPositions = ({ positions, selectedPosition, selectPosition }: MyPositionsProps) => {
    return (
        <div className="flex flex-col min-h-[377px] pb-8 bg-card border border-card-border/60 rounded-xl">
            <MyPositionsTable
                defaultSortingID="liquidityUSD"
                columns={myPositionsColumns}
                data={positions}
                action={selectPosition}
                selectedRow={selectedPosition}
                showPagination={false}
            />
        </div>
    );
};

export default MyPositions;
