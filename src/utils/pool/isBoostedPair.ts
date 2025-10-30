import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { BOOSTED_TOKENS } from "config/tokens";

/**
 * Checks whether a given token pair contains at least one "boosted (ERC 4626)" token.
 *
 * The function collects all boosted token addresses from the `BOOSTED_TOKENS` constant
 * (across all networks) and verifies if either of the provided tokens matches any of them.
 *
 * @param currencyA The first token in the pair.
 * @param currencyB The second token in the pair.
 * @returns `true` if at least one of the tokens is boosted, otherwise `false`.
 */
export const isBoostedPair = (currencyA: Currency, currencyB: Currency) => {
    const boostedTokens = Object.entries(BOOSTED_TOKENS).flatMap(([, value]) => Object.values(value).map((v) => v.address.toLowerCase()));

    return (
        boostedTokens.includes(currencyA.wrapped.address.toLowerCase()) || boostedTokens.includes(currencyB.wrapped.address.toLowerCase())
    );
};
