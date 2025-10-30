import { WNATIVE, Token, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { TOKENS } from "./tokens";

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
    [ChainId.Base]: [...WNATIVE_ONLY[ChainId.Base], TOKENS[ChainId.Base].USDC],
    [ChainId.BaseSepolia]: [...WNATIVE_ONLY[ChainId.BaseSepolia], TOKENS[ChainId.BaseSepolia].USDC],
};
