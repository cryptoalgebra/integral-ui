import { Address, getAddress } from "viem";

export function tryGetAddress(address: string): Address | undefined {
    try {
        return getAddress(address);
    } catch (error) {
        return undefined;
    }
}
