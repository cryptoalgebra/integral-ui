import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { NavLink } from "react-router-dom";

interface PoolsListItemProps {
    token0: TokenFieldsFragment;
    token1: TokenFieldsFragment;
    pool: string;
}

const PoolsListItem = ({ token0, token1, pool }: PoolsListItemProps) => {

    return <NavLink to={`/pools/${pool}`}>
        {`${token0.symbol} / ${token1.symbol}`}
    </NavLink>

}

export default PoolsListItem