import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { BoostedToken } from "./boostedToken";
import { BOOSTED_TOKENS } from "config/tokens";

export function tryCreateBoostedToken(
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string | undefined,
    name?: string | undefined
): Token | BoostedToken {
    const token = new Token(chainId, address, decimals, symbol, name);

    const matchedBoostedToken = Object.values(BOOSTED_TOKENS[chainId]).find(
        (t) => t.address.toLowerCase() === token.wrapped.address.toLowerCase()
    );

    return matchedBoostedToken || token;
}
