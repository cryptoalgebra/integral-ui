import { useCurrency } from "@/hooks/common/useCurrency";
import { usePool } from "@/hooks/pools/usePool";
import { Address } from "wagmi";

interface CreateLimitOrderProps {
    token0: Address
    token1: Address
    pool: Address
}

const CreateLimitOrder = ({ token0, token1, pool }: CreateLimitOrderProps) => {

    const [poolState, poolEntity] = usePool(pool)

    const baseCurrency = useCurrency(token0)
    const quoteCurrency = useCurrency(token0)

    // const mintInfo = useV3DerivedMintInfo(
    //     baseCurrency ?? undefined,
    //     quoteCurrency ?? undefined,
    //     INITIAL_POOL_FEE,
    //     baseCurrency ?? undefined,
    //     undefined
    //   );

    const isReady = token0 && token1 && poolEntity && poolEntity.tickCurrent

    // const a = usePrepareAlgebraLimitOrderPluginPlace({
    //     args: isReady ? [{
    //         token0,
    //         token1
    //     },
    //     poolEntity.tickCurrent,

    // ] : undefined
    // })

    return <div>q</div>

}

export default CreateLimitOrder;