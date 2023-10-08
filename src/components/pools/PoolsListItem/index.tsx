import CreateLimitOrder from "@/components/limit-orders/CreateLimitOrder";
import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { NavLink } from "react-router-dom";
import { Address } from "wagmi";

interface PoolsListItemProps {
    token0: TokenFieldsFragment;
    token1: TokenFieldsFragment;
    pool: string;
}

const PoolsListItem = ({ token0, token1, pool }: PoolsListItemProps) => {

    return <NavLink to={`/pools/${pool}/new-position`}>
        {`${token0.symbol} / ${token1.symbol}`}
    </NavLink>

    // return <CreateLimitOrder token0={token0.id as Address} token1={token1.id as Address} pool={pool as Address} />


}

export default PoolsListItem