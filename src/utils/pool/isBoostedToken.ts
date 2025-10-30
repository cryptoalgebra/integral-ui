import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { BOOSTED_TOKENS } from "config/tokens";

/**
 * Checks whether a given token contains at least one "boosted (ERC 4626)" token.
 *
 * The function collects all boosted token addresses from the `BOOSTED_TOKENS` constant
 * (across all networks) and verifies if either of the provided tokens matches any of them.
 *
 * @param currency Token to check
 * @returns `true` if the token is boosted, otherwise `false`.
 */
export const isBoostedToken = (currency: Currency) => {
    const boostedTokens = Object.entries(BOOSTED_TOKENS).flatMap(([, value]) => Object.values(value).map((v) => v.address.toLowerCase()));

    return boostedTokens.includes(currency.wrapped.address.toLowerCase());
};
