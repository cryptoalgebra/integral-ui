import { poolsColumns } from "@/components/common/Table/poolsColumns";
import PoolsTable from "@/components/common/Table/poolsTable";
import { useFormattedPools } from "@/hooks/pools/useFormattedPools";
import { FormattedPool } from "@/hooks/pools/useFormattedPools";
import { Address } from "viem";

interface PoolsListProps {
    isExplore?: boolean;
    tokenId?: Address;
    pools?: FormattedPool[];
    isLoading?: boolean;
}

const PoolsListContent = ({ pools, isLoading }: { pools: FormattedPool[]; isLoading: boolean; isExplore?: boolean }) => {
    return (
        <div className="flex w-full flex-col gap-2 md:gap-6 ">
            <PoolsTable
                columns={poolsColumns}
                data={pools}
                defaultSortingID={"tvlUSD"}
                link={"pool"}
                showPagination={true}
                loading={isLoading}
            />
        </div>
    );
};

const PoolsListFetched = ({ isExplore = false, tokenId }: { isExplore?: boolean; tokenId?: Address }) => {
    const { pools, isLoading } = useFormattedPools(tokenId);

    return <PoolsListContent pools={pools} isLoading={isLoading} isExplore={isExplore} />;
};

const PoolsList = ({ isExplore = false, tokenId, pools, isLoading }: PoolsListProps) => {
    if (pools === undefined || isLoading === undefined) {
        return <PoolsListFetched isExplore={isExplore} tokenId={tokenId} />;
    }

    return <PoolsListContent pools={pools} isLoading={isLoading} isExplore={isExplore} />;
};

export default PoolsList;
