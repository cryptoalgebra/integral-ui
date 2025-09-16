import { poolsColumns } from "@/components/common/Table/poolsColumns";
import PoolsTable from "@/components/common/Table/poolsTable";
import { useFormattedPools } from "@/hooks/pools/useFormattedPools";
import { Address } from "viem";

const PoolsList = ({ isExplore = false, tokenId }: { isExplore?: boolean; tokenId?: Address }) => {
    const { pools, isLoading } = useFormattedPools(tokenId);

    return (
        <div className="flex flex-col gap-4">
            <PoolsTable
                columns={poolsColumns}
                data={pools}
                defaultSortingID={"tvlUSD"}
                link={isExplore ? "analytics/pools" : "pool"}
                showPagination={true}
                loading={isLoading}
            />
        </div>
    );
};

export default PoolsList;
