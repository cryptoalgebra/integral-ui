import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x5fbB3b8A6D61634584F4C10c18243DE5a4081225",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x597F5A52DE695Dcd235fCc68B6A0BfFd42F18381",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x2B4a11d6872b88ffa57Dc7894277Df664BE05A7C",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x77e7f2d99C7E6dE6779737806d6d2e49d2bF1273",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x87847DF7583951484F03e8C979A328AC97809251",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0xB50E639E23C954546C75d9C15363FC0375E5E95E",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x92E4eaCD3b49fa85D13E4B6E8d6bfd0CFafaeD75",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.GiwaSepolia]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
