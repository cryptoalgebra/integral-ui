import { Token } from "@cryptoalgebra/integral-sdk";
import { STABLECOINS, TOKENS_FOR_MULTIHOP } from "./tokens";
import { WNATIVE } from "@/entities/WNative";
import { ChainId } from "./ChainId";

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
  ...WNATIVE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]])
);

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WNATIVE_ONLY,
  [ChainId.Holesky]: [...WNATIVE_ONLY[ChainId.Holesky], STABLECOINS.USDT],
  [ChainId.Gnosis]: [...WNATIVE_ONLY[ChainId.Gnosis], ...TOKENS_FOR_MULTIHOP],
};
