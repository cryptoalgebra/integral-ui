import { poolsColumns } from "@/components/common/Table/poolsColumns";
import PoolsTable from "@/components/common/Table/poolsTable";
import { FormattedPool } from "@/hooks/pools/useFormattedPools";
import { Address } from "viem";

const PoolsList = ({
    // isExplore = false,
    pools,
    isLoading,
}: {
    isExplore?: boolean;
    tokenId?: Address;
    pools: FormattedPool[];
    isLoading: boolean;
}) => {
    return (
        <div className="flex flex-col gap-6">
            <PoolsTable
                columns={poolsColumns}
                data={pools}
                defaultSortingID={"tvlUSD"}
                // link={isExplore ? "analytics/pools" : "pool"}
                showPagination={true}
                loading={isLoading}
            />
        </div>
    );
};

export default PoolsList;
