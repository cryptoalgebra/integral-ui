import { useAlgebraBasePluginIncentive, useAlgebraBasePluginLimitOrderPlugin, useAlgebraPoolGlobalState, useAlgebraPoolPlugin } from "@/generated";
import { usePoolsStore } from "@/state/poolsStore";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { useEffect } from "react";
import { Address } from "wagmi";

export function usePoolPlugins(poolId: Address | undefined) {

    const { pluginsForPools, setPluginsForPool } = usePoolsStore()

    const skipFetch = Boolean(poolId && pluginsForPools[poolId])

    const { data: globalState, isLoading: globalStateLoading } = useAlgebraPoolGlobalState({
        address: skipFetch ? undefined : poolId
    })

    const { data: plugin, isLoading: pluginLoading } = useAlgebraPoolPlugin({
        address: skipFetch ? undefined : poolId
    })

    const { data: hasFarmingPlugin, isLoading: farmingLoading } = useAlgebraBasePluginIncentive({
        address: skipFetch ? undefined : plugin
    })

    const { data: hasLimitOrderPlugin, isLoading: limitLoading } = useAlgebraBasePluginLimitOrderPlugin({
        address: skipFetch ? undefined : plugin
    })

    const isLoading = globalStateLoading || pluginLoading || farmingLoading || limitLoading

    const hasDynamicFee = globalState && Number(globalState[3]) >> 7 === 1

    useEffect(() => {

        if (!poolId || isLoading || pluginsForPools[poolId]) return

        setPluginsForPool(poolId, {
            dynamicFeePlugin: Boolean(hasDynamicFee),
            farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
            limitOrderPlugin: Boolean(hasLimitOrderPlugin)
        })

    }, [poolId, isLoading, pluginsForPools])

    if (poolId && pluginsForPools[poolId]) {
        return {
            ...pluginsForPools[poolId],
            isLoading: false
        }
    }

    return {
        dynamicFeePlugin: Boolean(hasDynamicFee),
        farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
        limitOrderPlugin: Boolean(hasLimitOrderPlugin),
        isLoading
    }

}