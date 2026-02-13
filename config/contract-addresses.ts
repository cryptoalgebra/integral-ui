import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990",
    [ChainId.MegaethTestnet]: "0x10253594A832f967994b44f33411940533302ACb",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x7d98346B3b000c55904918e3d9E2fc3F94683b01",
    [ChainId.MegaethTestnet]: "0x13fcE0acbe6Fb11641ab753212550574CaD31415",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x1Bfbf7721397f6e3bD1250dc44CbB6eaA10Ad1b2",
    [ChainId.MegaethTestnet]: "0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xA9C02F398B3da32FEbb634Ec4d1ca01d2B1D400a",
    [ChainId.MegaethTestnet]: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x8AF2f4aF29431a4c21397e42A99eb16Df5887332",
    [ChainId.MegaethTestnet]: "0x7064C7Bb85979f008212877c4CE41285ddf5374C",
};
/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xe34ee083B4154F2624ECCb9A80E188b83944c2d5",
    [ChainId.MegaethTestnet]: "0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x16d379f3458bf6DBF6A0dbC5696Be4ab9137cfd4",
    [ChainId.MegaethTestnet]: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xB8C2125a316429669bD8CE88fB674843E71caDE8",
    [ChainId.MegaethTestnet]: "0x4cE4f61ebC23D9e48ffCd5f071c0199Ca39D1F75",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
    [ChainId.MegaethTestnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
    [ChainId.MegaethTestnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
    [ChainId.MegaethTestnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.MegaethMainnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
    [ChainId.MegaethTestnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
