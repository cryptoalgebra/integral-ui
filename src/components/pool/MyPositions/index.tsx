import { myPositionsColumns } from '@/components/common/Table/myPositionsColumns';
import { Address } from 'wagmi';
import { FormattedPosition } from '@/types/formatted-position';
import MyPositionsTable from '@/components/common/Table/myPositionsTable';

interface MyPositionsProps {
    positions: FormattedPosition[];
    poolId: Address | undefined;
    selectedPosition: number | undefined;
    selectPosition: (positionId: number | null) => void;
}

const MyPositions = ({
    positions,
    selectedPosition,
    selectPosition,
}: MyPositionsProps) => {
    return (
        <div className="flex flex-col min-h-[377px] pb-8 bg-card border border-card-border/60 rounded-3xl">
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
