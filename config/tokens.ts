import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.MegaethMainnet]: {
        USDC: new Token(ChainId.MegaethMainnet, "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", 6, "USDT0", "USDT0"),
    },
    [ChainId.MegaethTestnet]: {
        USDC: new Token(ChainId.MegaethTestnet, "0xE416C0C29DBDb4Fa25870b835ad904c1E8478CDc", 18, "USDC", "USDC"),
    },
};
