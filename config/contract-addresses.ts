import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BSC]: "0xd9A0ffa58143CdC5C1767208dDdB64a1889D78ae",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BSC]: "0x4b2A38344b9aAc2F4e82130f35F1630C80ED94Bb",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BSC]: "0xeDcA8D5A3F788855A90eC56851966b518Cf33D11",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BSC]: "0xA20259cC9bb227992240f7Dc9b5B02D3324d9eD4",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BSC]: "0x211BD8917d433B7cC1F4497AbA906554Ab6ee479",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BSC]: "0xCf5d80378efC08b20aCAB1Ee5F296E5cB5a8E8C2",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BSC]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.BSC]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.BSC]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.BSC]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.BSC]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
