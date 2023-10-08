import PoolsListItem from "@/components/pools/PoolsListItem"
import { usePoolsListQuery } from "@/graphql/generated/graphql"

const PoolsList = () => {

    const { data, loading } = usePoolsListQuery()

    if (loading) return 'Loading Pools...'

    if (!data) return 'No pools'

    return <div className="flex flex-col">
        {
            data.pools.map(({ token0, token1, id }, i) => <PoolsListItem key={`pool-list-item-${i}`} token0={token0} token1={token1} pool={id} />)
        }
    </div>

}
export default PoolsList