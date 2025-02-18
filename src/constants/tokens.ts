import { Token } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

import AlgebraConfig from "../algebra.config";

export const [DEFAULT_TOKENS, TOKENS_FOR_MULTIHOP, STABLE_TOKENS] = [
  AlgebraConfig.DEFAULT_TOKEN_LIST.defaultTokens,
  AlgebraConfig.DEFAULT_TOKEN_LIST.tokensForMultihop,
  AlgebraConfig.DEFAULT_TOKEN_LIST.stableTokens,
].map((tokens) =>
  Object.entries(tokens).map(
    ([address, { name, symbol, decimals }]) =>
      new Token(
        AlgebraConfig.CHAIN_PARAMS.chainId,
        address,
        decimals,
        symbol,
        name
      )
  )
);

export const STABLECOINS = {
  USDT: new Token(
    DEFAULT_CHAIN_ID,
    "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
    6,
    "USDT",
    "USDT"
  ),
  WXDAI: new Token(
    DEFAULT_CHAIN_ID,
    "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    18,
    "WXDAI",
    "WXDAI"
  ),
};
