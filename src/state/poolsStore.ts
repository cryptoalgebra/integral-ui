import { Address } from "wagmi";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"

interface PoolPlugins {
    dynamicFeePlugin: boolean;
    limitOrderPlugin: boolean;
    farmingPlugin: boolean;
}

interface PoolsState {
    readonly pluginsForPools: { [key: Address]: PoolPlugins };
    setPluginsForPool: (poolId: Address, plugins: PoolPlugins) => void;
}

export const usePoolsStore = create(persist<PoolsState>((set, get) => ({
    pluginsForPools: {},
    setPluginsForPool: (poolId: Address, plugins: PoolPlugins) => set({
        pluginsForPools: {
            ...get().pluginsForPools,
            [poolId.toLowerCase()]: plugins
        }
    })
}), {
    name: 'pools-plugins',
    storage: createJSONStorage(() => sessionStorage)
})
)



