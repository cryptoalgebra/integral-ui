import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x285C74f3d01296F96c5d3858ab482f707e8Bfdfc",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xE7E57600a294d9e82DdD44AC9242754EC0c3D4A3",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x32327f375148019A7C3B72E34a66c982951779C3",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xCcD3A4AB7bD75bab509d25101eDDc37778cA49A4",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x6aa9481De990bC12F906C5e8DE70D8556ac5ba2e",
};
/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xB50E639E23C954546C75d9C15363FC0375E5E95E",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x92E4eaCD3b49fa85D13E4B6E8d6bfd0CFafaeD75",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
