import { Percent } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export const DEFAULT_NAV_HOOK_SLIPPAGE = new Percent(10, 10_000);

export function getAddressByPool(mapping: Record<Address, Address> | undefined, poolId: Address | undefined): Address | undefined {
    if (!mapping || !poolId) return undefined;

    const matched = Object.entries(mapping).find(([address]) => address.toLowerCase() === poolId.toLowerCase());
    return matched?.[1];
}

export function getProportionalAmount(total: bigint, shares: bigint, totalSupply: bigint): bigint {
    if (totalSupply === 0n || shares === 0n) return 0n;
    return (total * shares) / totalSupply;
}

export function applySlippage(amount: bigint, slippage: Percent): bigint {
    if (amount === 0n) return 0n;

    const numerator = BigInt(slippage.numerator.toString());
    const denominator = BigInt(slippage.denominator.toString());

    if (denominator === 0n || numerator >= denominator) return 0n;
    return (amount * (denominator - numerator)) / denominator;
}

export function getPercentAmount(amount: bigint, percent: number): bigint {
    if (amount === 0n || percent <= 0) return 0n;
    return (amount * BigInt(percent)) / 100n;
}
