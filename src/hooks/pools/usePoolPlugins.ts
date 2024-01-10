// import { useAlgebraBasePluginIncentive, useAlgebraBasePluginLimitOrderPlugin, useAlgebraPoolGlobalState, useAlgebraPoolPlugin } from "@/generated";
// import { usePoolsStore } from "@/state/poolsStore";
// import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
// import { useEffect } from "react";
import { Address } from "wagmi";

const poolsPlugins: { [key: Address]: any } = {
    ['0xfd3b328ef6a7dd98e81edc021e6f12dc5289a74f']: {
        dynamicFeePlugin: true,
        farmingPlugin: false,
        limitOrderPlugin: false
    },
    ['0x185265ba1c1b5653a205507e0340a21625ebdfed']: {
        dynamicFeePlugin: true,
        farmingPlugin: false,
        limitOrderPlugin: false
    }
}

export function usePoolPlugins(poolId: Address | undefined) {

    if (poolId && poolId in poolsPlugins) return poolsPlugins[poolId]

    return {
        dynamicFeePlugin: true,
        farmingPlugin: false,
        limitOrderPlugin: false
    }

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