// import { useAlgebraBasePluginIncentive, useAlgebraBasePluginLimitOrderPlugin, useAlgebraPoolGlobalState, useAlgebraPoolPlugin } from "@/generated";
// import { usePoolsStore } from "@/state/poolsStore";
// import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
// import { useEffect } from "react";
import { Address } from "wagmi";

const poolsPlugins: { [key: Address]: any } = {
    ['0x89406233d4290f405eabb6f320fd648276b8b5b7']: {
        dynamicFeePlugin: true,
        farmingPlugin: false,
        limitOrderPlugin: true
    },
    ['0x9367e79bbc401cec2545b4671a80892a26ae1cd9']: {
        dynamicFeePlugin: true,
        farmingPlugin: false,
        limitOrderPlugin: false
    },
    ['0x9f032424a5a4b0effb7fe4912f3e325c105345bc']: {
        dynamicFeePlugin: false,
        farmingPlugin: false,
        limitOrderPlugin: false
    }
}

export function usePoolPlugins(poolId: Address | undefined) {

    if (poolId) return poolsPlugins[poolId]

    return {}

    // const { pluginsForPools, setPluginsForPool } = usePoolsStore()

    // const skipFetch = Boolean(poolId && pluginsForPools[poolId])

    // const { data: globalState, isLoading: globalStateLoading } = useAlgebraPoolGlobalState({
    //     address: skipFetch ? undefined : poolId
    // })

    // const { data: plugin, isLoading: pluginLoading } = useAlgebraPoolPlugin({
    //     address: skipFetch ? undefined : poolId
    // })

    // const { data: hasFarmingPlugin, isLoading: farmingLoading } = useAlgebraBasePluginIncentive({
    //     address: skipFetch ? undefined : plugin
    // })

    // const { data: hasLimitOrderPlugin, isLoading: limitLoading } = useAlgebraBasePluginLimitOrderPlugin({
    //     address: skipFetch ? undefined : plugin
    // })

    // console.log('hasLimitOrderPlugin', poolId, hasLimitOrderPlugin)

    // const isLoading = globalStateLoading || pluginLoading || farmingLoading || limitLoading

    // const hasDynamicFee = globalState && Number(globalState[3]) >> 7 === 1

    // useEffect(() => {

    //     if (!poolId || isLoading || pluginsForPools[poolId]) return

    //     setPluginsForPool(poolId, {
    //         dynamicFeePlugin: Boolean(hasDynamicFee),
    //         farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
    //         limitOrderPlugin: Boolean(hasLimitOrderPlugin)
    //     })

    // }, [poolId, isLoading, pluginsForPools])

    // if (poolId && pluginsForPools[poolId]) {
    //     console.log('poolId AA', poolId, poolId && pluginsForPools[poolId])
    //     return {
    //         ...pluginsForPools[poolId],
    //         isLoading: false
    //     }
    // }

    // return {
    //     dynamicFeePlugin: Boolean(hasDynamicFee),
    //     farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
    //     limitOrderPlugin: Boolean(hasLimitOrderPlugin),
    //     isLoading
    // }

}