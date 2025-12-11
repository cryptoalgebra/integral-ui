import { Percent } from "@cryptoalgebra/integral-sdk";

export const ONE_BIPS = new Percent(1, 10000);
export const BIPS_BASE = 10000;

export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(100, BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(300, BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(500, BIPS_BASE); // 5%
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(1000, BIPS_BASE); // 10%
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(1500, BIPS_BASE); // 15%

const IMPACT_TIERS = [BLOCKED_PRICE_IMPACT_NON_EXPERT, ALLOWED_PRICE_IMPACT_HIGH, ALLOWED_PRICE_IMPACT_MEDIUM, ALLOWED_PRICE_IMPACT_LOW];

type WarningSeverity = 0 | 1 | 2 | 3 | 4;

export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
    if (!priceImpact) return 4;
    let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity;
    for (const impactLevel of IMPACT_TIERS) {
        if (impactLevel.lessThan(priceImpact)) return impact;
        impact -= 1;
    }
    return 0;
}
