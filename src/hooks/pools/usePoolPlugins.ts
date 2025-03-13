import { useAlgebraPoolGlobalState, useAlgebraPoolPlugin, useAlgebraBasePluginIncentive } from "@/generated";
import { usePoolsStore } from "@/state/poolsStore";
import { ADDRESS_ZERO } from "@cryptoalgebra/sdk";
import { useEffect } from "react";
import { Address } from "wagmi";

export function usePoolPlugins(poolId: Address | undefined) {
    const { setPluginsForPool } = usePoolsStore();
    const pluginsForPool = usePoolsStore((state) => state.pluginsForPools[poolId || ADDRESS_ZERO]);

    const skipFetch = Boolean(poolId && pluginsForPool);

    const { data: globalState, isLoading: globalStateLoading } = useAlgebraPoolGlobalState({
        address: skipFetch ? undefined : poolId,
    });

    const { data: plugin, isLoading: pluginLoading } = useAlgebraPoolPlugin({
        address: skipFetch ? undefined : poolId,
    });

    const { data: hasFarmingPlugin, isLoading: farmingLoading } = useAlgebraBasePluginIncentive({
        address: skipFetch ? undefined : plugin,
    });

    // const { data: hasLimitOrderPlugin, isLoading: limitLoading } =
    //     useAlgebraBasePluginLimitOrderPlugin({
    //         address: skipFetch ? undefined : plugin,
    //     });

    const isLoading = globalStateLoading || pluginLoading || farmingLoading;
    const hasDynamicFee = globalState && Number(globalState[3]) >> 7 === 1;

    useEffect(() => {
        if (!poolId || isLoading || pluginsForPool) return;

        setPluginsForPool(poolId, {
            dynamicFeePlugin: Boolean(hasDynamicFee),
            farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
            limitOrderPlugin: false,
        });
    }, [poolId, isLoading, hasDynamicFee, hasFarmingPlugin, setPluginsForPool, pluginsForPool]);

    if (poolId && pluginsForPool) {
        return {
            ...pluginsForPool,
            isLoading: false,
        };
    }

    return {
        dynamicFeePlugin: Boolean(hasDynamicFee),
        farmingPlugin: hasFarmingPlugin !== ADDRESS_ZERO,
        limitOrderPlugin: false,
        isLoading,
    };
}
