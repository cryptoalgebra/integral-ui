import { useAlgebraBasePluginIncentive, useAlgebraBasePluginLimitOrderPlugin, useAlgebraPoolGlobalState, useAlgebraPoolPlugin } from "@/generated";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { Address } from "wagmi";

export function usePoolPlugins(poolId: Address | undefined) {

    const { data: globalState, isLoading: globalStateLoading } = useAlgebraPoolGlobalState({
        address: poolId
    })

    const { data: plugin, isLoading: pluginLoading } = useAlgebraPoolPlugin({
        address: poolId
    })

    const { data: hasFarmingPlugin, isLoading: farmingLoading } = useAlgebraBasePluginIncentive({
        address: plugin
    })

    const { data: hasLimitOrderPlugin, isLoading: limitLoading } = useAlgebraBasePluginLimitOrderPlugin({
        address: plugin
    })

    const isLoading = globalStateLoading || pluginLoading || farmingLoading || limitLoading

    const hasDynamicFee = globalState && Number(globalState[3]) >> 7 === 1

    return {
        dynamicFeePlugin: hasDynamicFee,
        farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
        limitOrderPlugin: hasLimitOrderPlugin,
        isLoading
    }

}