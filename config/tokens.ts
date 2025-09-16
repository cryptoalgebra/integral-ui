import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xbfc131442fe1ea6c7912d40fb4df68b792128ae1", 6, "USDC", "USDC"),
        ALGB: new Token(ChainId.BaseSepolia, "0xba59071d5804E1EdD1E871b895dDC1dc3692dA22", 18, "ALGB", "ALGB"),
    },
};
