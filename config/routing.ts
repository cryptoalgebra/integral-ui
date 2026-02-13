import { WNATIVE, Token, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { STABLECOINS } from "./tokens";

type ChainTokenList = {
    readonly [chainId: number]: Token[];
};

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
    ...WNATIVE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]]));

// for native swap router
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WNATIVE_ONLY,
    [ChainId.MegaethMainnet]: [
        ...WNATIVE_ONLY[ChainId.MegaethMainnet],
        STABLECOINS[ChainId.MegaethMainnet].USDC,
    ],
    [ChainId.MegaethTestnet]: [
        ...WNATIVE_ONLY[ChainId.MegaethTestnet],
        STABLECOINS[ChainId.MegaethTestnet].USDC,
    ],
};
