import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xcD58521ecaC7724d1752F941C56490c27bAe9ab0",
};

export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x1c219ba68A9100E4F3475A624cf225ADA02c0F1B",
};

export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x3400D4f83c528A0E19c380d92DD100eA51d8980c",
};

export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x5baD56bfBABEC1A5A7848399762f54566FA22557",
};

export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xf7cA7d0F8Bbef9BBfEB66Cf2c9C84Eeb2dA60b22",
};

export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x07B8114E9f6fC41963c060A9fD878977c4093B84",
};

export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x1C9D0f9d7a29Bdc60be447973C72690D42bE1f47",
};
