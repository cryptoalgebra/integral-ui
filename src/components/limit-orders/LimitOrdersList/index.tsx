import { algebraLimitOrderPluginABI } from "@/abis"
import { ALGEBRA_LIMIT_ORDER_PLUGIN } from "@/constants/addresses"
import { useAlgebraLimitOrderPluginKill, useAlgebraLimitOrderPluginWithdraw, usePrepareAlgebraLimitOrderPluginKill } from "@/generated"
import { useLimitOrdersListQuery } from "@/graphql/generated/graphql"
import { useStaticCall } from "@/hooks/common/useStaticCall"
import { useClients } from "@/hooks/graphql/useClients"
import { usePool } from "@/hooks/pools/usePool"
import { Percent, Pool, Position, TickMath } from "@cryptoalgebra/integral-sdk"

const LimitOrdersList = () => {

    const { limitOrderClient } = useClients()

    const { data,  loading } = useLimitOrdersListQuery({
        client: limitOrderClient
    })

    const [, pool] = usePool('0xb104f0535a35a69880dab51008756c31d47dbf0f')

    const isReady = pool

    const b = useStaticCall({
        address: ALGEBRA_LIMIT_ORDER_PLUGIN,
        abi: algebraLimitOrderPluginABI,
        functionName: 'kill',
        args: isReady ? [
            {
                token0: pool.token0.address,
                token1 : pool.token1.address
            },
            28380,
            28440,
            true,
            '0xDeaD1F5aF792afc125812E875A891b038f888258'
        ] : undefined
    })

    const c = useStaticCall({
        address: ALGEBRA_LIMIT_ORDER_PLUGIN,
        abi: algebraLimitOrderPluginABI,
        functionName: 'withdraw',
        args: isReady ? [
            1n,
            '0xDeaD1F5aF792afc125812E875A891b038f888258'
        ] : undefined
    })

    const { data: withdrawData, write: withdraw } = useAlgebraLimitOrderPluginWithdraw({
        args: [
            1n,
            '0xDeaD1F5aF792afc125812E875A891b038f888258'
        ]
    })

    // const rewards = await readContract<any, 'collectRewards'>({
    //     account,
    //     address: V3_FARMING_CENTER_ADDRESS,
    //     abi: algebraFarmingCenterABI,
    //     functionName: 'collectRewards',
    //     args: [
    //         [rewardToken, bonusRewardToken, pool, startTime, endTime],
    //         +positionIds[i]
    //     ],
    // })

    console.log('cccccc', b, c)

    if (data && pool) {

        const positions = data.limitOrders.map(({ liquidity, tickLower, tickUpper, zeroToOne }) => {

        const positionAmount0 = new Position({
                pool,
                liquidity: Number(liquidity),
                tickLower: Number(tickLower),
                tickUpper: Number(tickUpper)
            }).amount0

        const positionAmount1 = new Position({
            pool: new Pool(pool.token0, pool.token1, pool.fee, zeroToOne ? TickMath.MAX_SQRT_RATIO : TickMath.MIN_SQRT_RATIO, pool.liquidity, zeroToOne ? TickMath.MAX_TICK - 1 : TickMath.MIN_TICK, pool.tickSpacing),
            liquidity: Number(liquidity),
            tickLower: Number(tickLower),
            tickUpper: Number(tickUpper)
        }).amount1
        
        // const { amount0: amount0Min, amount1: amount1Min } = position.burnAmountsWithSlippage(
        //     new Percent(0, 1)
        //   )

          return { 
            amount0: positionAmount0.toSignificant(18),
            amount1: positionAmount1.toSignificant(18),
           }
    })

        console.log('LIMIT ORDERS', data.limitOrders, positions)

    }


    return <div>
        <button onClick={() => withdraw()}>WITHDRAW</button>
    </div>

}

export default LimitOrdersList