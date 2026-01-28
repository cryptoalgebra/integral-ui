import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.Henesys]: {
        USDT: new Token(ChainId.Henesys, "0xa75aae282802add5bfae39bc5fe0d4d27b117d0a", 6, "USDT", "TetherToken"),
    },
};
