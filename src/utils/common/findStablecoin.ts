import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { STABLECOINS } from "config/tokens";
import { Address, isAddressEqual } from "viem";

export function findStablecoin(address: Address, chainId: number): Token | undefined {
    const stablecoins = STABLECOINS[chainId as keyof typeof STABLECOINS];
    if (!stablecoins) return undefined;

    for (const token of Object.values(stablecoins)) {
        if (isAddressEqual(token.address as Address, address)) {
            return token;
        }
    }
    return undefined;
}
