import { myPositionsColumns } from '@/components/common/Table/myPositionsColumns';
import DataTable from '@/components/common/Table/dataTable';
import { Address } from 'wagmi';
import { FormattedPosition } from '@/types/formatted-position';

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
        <div className="flex flex-col min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl">
            <DataTable
                defaultSortingID="liquidityUSD"
                columns={myPositionsColumns}
                data={positions}
                action={selectPosition}
                selectedRow={selectedPosition}
            />
        </div>
    );
};

export default MyPositions;
