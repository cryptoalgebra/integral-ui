import { poolsColumns } from "@/components/common/Table/poolsColumns";
import PoolsTable from "@/components/common/Table/poolsTable";
import { useFormattedPools } from "@/hooks/pools/useFormattedPools";
import { Address } from "viem";

const PoolsList = ({ isExplore = false, tokenId }: { isExplore?: boolean; tokenId?: Address }) => {
    const { pools, isLoading } = useFormattedPools(tokenId);

    return (
        <div className="pb-4 bg-card-dark border border-card-border rounded-lg w-full max-w-[1280px] mx-auto">
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
        </div>
    );
};

export default PoolsList;
