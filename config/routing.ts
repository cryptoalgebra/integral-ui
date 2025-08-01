import { WNATIVE, Token, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { STABLECOINS, HYPERLIQUID_TOKENS } from "./tokens";

type ChainTokenList = {
    readonly [chainId: number]: Token[];
};

// Hyperliquid chain ID
const HYPERLIQUID_CHAIN_ID = 999;

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
    ...WNATIVE,
    [HYPERLIQUID_CHAIN_ID]: HYPERLIQUID_TOKENS.WHYPE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]]));

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WNATIVE_ONLY,
    [ChainId.HyperEvmMainnet]: [...WNATIVE_ONLY[ChainId.HyperEvmMainnet], STABLECOINS[ChainId.HyperEvmMainnet].USDC],
    [ChainId.BaseSepolia]: [...WNATIVE_ONLY[ChainId.BaseSepolia], STABLECOINS[ChainId.BaseSepolia].USDC],
};
