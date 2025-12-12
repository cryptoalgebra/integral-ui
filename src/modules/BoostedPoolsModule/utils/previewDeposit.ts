import { wagmiConfig } from "@/providers/WagmiProvider";
import { BoostedToken } from "@cryptoalgebra/integral-sdk";
import { Address, erc4626Abi } from "viem";
import { readContract } from "viem/actions";

export async function previewDeposit(boostedToken: BoostedToken, assets: bigint): Promise<bigint> {
    const chainId = boostedToken.chainId;
    const client = wagmiConfig.getClient({ chainId });

    return readContract(client, {
        address: boostedToken.address as Address,
        abi: erc4626Abi,
        functionName: "previewDeposit",
        args: [assets],
    }) as Promise<bigint>;
}
