import { Address } from "wagmi";

export async function getPoolAPR(poolId: Address) {

    if (!poolId) return

    const poolsAPR = await fetch('https://api.dexed.org/api/APR/pools/?network=goerli').then(v => v.json())

    if (poolsAPR[poolId.toLowerCase()]) {
        return poolsAPR[poolId.toLowerCase()]
    }

    return 0

}