import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.Henesys]: {
        USDT: new Token(ChainId.Henesys, "0x49a390a3dFd2d01389f799965F3af5961f87d228", 6, "USDT", "USDT"),
    },
};
