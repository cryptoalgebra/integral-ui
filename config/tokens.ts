import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.RaylsMainnet]: {
        USDR: new Token(ChainId.RaylsMainnet, "0x0000000000000000000000000000000000000400", 18, "USDr", "USD Rayls"),
        RLS: new Token(ChainId.RaylsMainnet, "0x07e17E17e17E17e17e17e17E17E17E17E17e17EA", 18, "RLS", "Rayls"),
    },
};
