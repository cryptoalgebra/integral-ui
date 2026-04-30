import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xa77aD9f635a3FB3bCCC5E6d1A87cB269746Aba17",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x503D191CaFaB1d097b5F798d850E5897195C1d74",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xE94de02e52Eaf9F0f6Bf7f16E4927FcBc2c09bC7",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x37A4950b4ea0C46596404895c5027B088B0e70e7",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x0f460A2b3E8ba1Cc4D33E47f207EA03B37A286a7",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x893388ba29248261a0F13371BD4AE3700Ce06EC9",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
