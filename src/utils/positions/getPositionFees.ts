import { simulateNonfungiblePositionManagerCollect } from "@/generated";
import { wagmiConfig } from "@/providers/WagmiProvider";
import { CurrencyAmount, Pool } from "@cryptoalgebra/custom-pools-sdk";
import { Address, maxUint128 } from "viem";

export async function getPositionFees(pool: Pool, positionId: number, owner: Address) {
    const {
        result: [fees0, fees1],
    } = await simulateNonfungiblePositionManagerCollect(wagmiConfig, {
        args: [
            {
                tokenId: BigInt(positionId),
                recipient: owner,
                amount0Max: maxUint128,
                amount1Max: maxUint128,
            },
        ],
        account: owner,
    });

    return [CurrencyAmount.fromRawAmount(pool.token0, fees0.toString()), CurrencyAmount.fromRawAmount(pool.token1, fees1.toString())];
}
