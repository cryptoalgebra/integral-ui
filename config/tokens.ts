import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.HyperEvmTestnet]: {
        USDC: new Token(ChainId.HyperEvmTestnet, "0x7fb2491d015f6c0271fdfcbb7712feeb43ebe50e", 6, "USDC", "USDC"),
    },
};
