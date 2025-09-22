import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x2fB84Ae4b1B6aeEc5627268070cF44C678Cd9728",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x663181bbbACA5ff7c7c0dDbb5ae16De85D07Fc9f",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x1Cfb48AAD4c3822C24Baf15EB58DBEDaB0f72E72",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x9026d1c84f5834968FE80368b216D7C34109Cf97",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xc709aCDA0dBF1a70189bd850e8E8b2659017Fa62",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xD1271285aaBe5CbE5E64248d1cb18B8c8550f4fD",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xe578551955EA80F001DD5C1d1db3F4652a049C5D",
};

/* Ve 3.3 */
export const VE_ALGB: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x6827d0ac944672b6E476B99274310E374fB23409", // Voting Escrow
};
export const VOTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x4e4c56c54eBa37259BE28258b54493D85C693b86",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x9427BdEa2939c2e78072D116bA2AcB95480B4042",
};
export const ALGB_TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x253f3460BC16074B960f80421d72E6FA6Ef786c8",
};
