import { useAlgebraBasePluginIncentive, useAlgebraBasePluginLimitOrderPlugin, useAlgebraPoolGlobalState, useAlgebraPoolPlugin } from "@/generated";
import { Address } from "wagmi";

export function usePoolPlugins(poolId: Address | undefined) {

    const { data: globalState, isLoading } = useAlgebraPoolGlobalState({
        address: poolId
    })

    const { data: plugin } = useAlgebraPoolPlugin({
        address: poolId
    })

    const { data: hasFarmingPlugin } = useAlgebraBasePluginIncentive({
        address: plugin
    })

    const { data: hasLimitOrderPlugin } = useAlgebraBasePluginLimitOrderPlugin({
        address: plugin
    })

    const hasDynamicFee = globalState && Number(globalState[3]) >> 7 === 1

    return {
        dynamicFee: hasDynamicFee,
        farming: hasFarmingPlugin,
        limitOrder: hasLimitOrderPlugin
    }

}