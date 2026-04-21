import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.Ethereum]: "0xd265f57c36AC60d3F7931eC5c7396966F0C246A7",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.Ethereum]: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.Ethereum]: "0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.Ethereum]: "0x28DeD2af752655Df5Ee92450DC259F92a5ABe449",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.Ethereum]: "0x7B4553a35D3020064cB464a8D75a4735FfdA15Bd",
};
/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.Ethereum]: "0x83D4a9Ea77a4dbA073cD90b30410Ac9F95F93E7C",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.Ethereum]: "0xEC250E6856e14A494cb1f0abC61d72348c79F418",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.Ethereum]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.Ethereum]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.Ethereum]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.Ethereum]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.Ethereum]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.Ethereum]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.Ethereum]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.Ethereum]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
