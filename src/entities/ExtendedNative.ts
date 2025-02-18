import { Native, Token } from "@cryptoalgebra/integral-sdk";
import { WNATIVE } from "./WNative";

export class ExtendedNative extends Native {
  private static _cachedNative: { [chainId: number]: ExtendedNative } = {};

  public get wrapped(): Token {
    return WNATIVE[this.chainId];
  }

  public static onChain(
    chainId: number,
    symbol: string,
    name: string
  ): ExtendedNative {
    return (
      this._cachedNative[chainId] ??
      (this._cachedNative[chainId] = new ExtendedNative(chainId, symbol, name))
    );
  }
}
