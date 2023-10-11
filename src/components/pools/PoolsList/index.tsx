import DataTable from "@/components/common/Table/dataTable"
import { poolsColumns } from "@/components/common/Table/poolsColumns"
import { usePoolsListQuery } from "@/graphql/generated/graphql"
import { useMemo } from "react"
import { Address } from "viem"

const PoolsList = () => {

    const { data: pools, loading } = usePoolsListQuery()

    const formattedPools = useMemo(() => {

        if (!pools?.pools) return []

        return pools.pools.map(({ id, token0, token1, fee, totalValueLockedUSD, volumeUSD }) => ({
            id: id as Address,
            pair: {
                token0,
                token1
            },
            fee: Number(fee) / 10_000,
            tvlUSD: Number(totalValueLockedUSD),
            volume24USD: Number(volumeUSD),
            apr: 0
        }))

    }, [pools])

    return <div className="flex flex-col gap-4">
        <DataTable columns={poolsColumns} data={formattedPools} defaultSortingID={'tvlUSD'} link={'pool'} showPagination={false} loading={loading}  />
    </div>

}

export default PoolsList