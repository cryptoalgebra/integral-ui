import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.ADI]: "0x893388ba29248261a0F13371BD4AE3700Ce06EC9",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.ADI]: "0xfDA3Bd0130d58197f440E759f4a00BC444c4CB61",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.ADI]: "0x3f912b39A89708Db8E10205421d3726e2DF4984D",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.ADI]: "0x4Eb881885FE22D895Ff299f6cdA6e0A8E00E66A0",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.ADI]: "0xD5D5eeB7781827eD9c42755d462EDF9Df0dfe279",
};
/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.ADI]: "0x161C886a5ef51c4B20f2F4ca2caDB20c93245705",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.ADI]: "0xd9866Fc987AFCFc0C20b22a2B04b0574735032C5",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.ADI]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.ADI]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.ADI]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.ADI]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.ADI]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.ADI]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.ADI]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.ADI]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
