import AJNA_LOGO from "./assets/tokens/ajna-logo.svg";
import BCSPX_LOGO from "./assets/tokens/bcspx-logo.svg";
import COW_LOGO from "./assets/tokens/cow-logo.svg";
import CRV_LOGO from "./assets/tokens/crv-logo.svg";
import EURA_LOGO from "./assets/tokens/eura-logo.svg";
import EURE_LOGO from "./assets/tokens/eure-logo.svg";
import GNO_LOGO from "./assets/tokens/gno-logo.svg";
import HOPR_LOGO from "./assets/tokens/hopr-logo.png";
import OLAS_LOGO from "./assets/tokens/autonolas-logo.png";
import PNK_LOGO from "./assets/tokens/pnk-logo.svg";
import SAFE_LOGO from "./assets/tokens/safe-logo.svg";
import SHUTTER_LOGO from "./assets/tokens/shutter.png";
import SDAI_LOGO from "./assets/tokens/sdai-logo.svg";
import SWAPR_LOGO from "./assets/tokens/swapr-logo.png";
import USDC_LOGO from "./assets/tokens/usdc-logo.svg";
import WBTC_LOGO from "./assets/tokens/wbtc.svg";
import WETH_LOGO from "./assets/tokens/weth-logo.png";
import WSTETH_LOGO from "./assets/tokens/wsteth-logo.svg";
import WXDAI_LOGO from "./assets/tokens/wxdai-logo.png";
import XDAI_LOGO from "./assets/tokens/xdai-logo.png";

const SUBGRAPH_API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY;

export default {
  CHAIN_PARAMS: {
    chainId: 100,
    chainIdHex: "0x64",
    chainName: "Gnosis Chain",
    nativeCurrency: {
      name: "XDAI",
      symbol: "XDAI",
      decimals: 18,
      logo: XDAI_LOGO,
    },
    wrappedNativeCurrency: {
      name: "Wrapped XDAI",
      symbol: "WXDAI",
      decimals: 18,
      address: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
      logo: WXDAI_LOGO,
    },
    rpcURL: "https://rpc.gnosis.gateway.fm",
    blockExplorerURL: "https://gnosisscan.io",
    blockExplorerDomain: "gnosisscan.io",
  },

  DEFAULT_TOKEN_LIST: {
    // Tokens, which would be displayed on the top of Token Selector Modal
    defaultTokens: {
      ["0x532801ED6f82FFfD2DAB70A19fC2d7B2772C4f4b"]: {
        name: "Swapr on Gnosis chain",
        symbol: "SWPR",
        decimals: 18,
      },
      ["0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"]: {
        name: "Wrapped Ether on Gnosis chain",
        symbol: "WETH",
        decimals: 18,
      },
      ["0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"]: {
        name: "Gnosis Token on Gnosis chain",
        symbol: "GNO",
        decimals: 18,
      },
      ["0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252"]: {
        name: "Wrapped BTC on Gnosis",
        symbol: "WBTC",
        decimals: 8,
      },
      ["0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"]: {
        name: "USD//C on Gnosis",
        symbol: "USDC",
        decimals: 6,
      },
      ["0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"]: {
        name: "Backed CSPX",
        symbol: "bCSPX",
        decimals: 18,
      },
    },
    // Tokens, which would be used for creating multihop routes
    tokensForMultihop: {
      ["0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"]: {
        name: "Wrapped Ether on Gnosis chain",
        symbol: "WETH",
        decimals: 18,
      },
      ["0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"]: {
        name: "Gnosis Token on Gnosis chain",
        symbol: "GNO",
        decimals: 18,
      },
      ["0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"]: {
        name: "USD//C on Gnosis",
        symbol: "USDC",
        decimals: 6,
      },
      ["0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"]: {
        name: "Wrapped XDAI",
        symbol: "WXDAI",
        decimals: 18,
      },
      ["0xaf204776c7245bf4147c2612bf6e5972ee483701"]: {
        name: "Savings xDAI",
        symbol: "sDAI",
        decimals: 18,
      },
      ["0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0"]: {
        name: "Bridged USDC (Gnosis)",
        symbol: "USDC.e",
        decimals: 6,
      },
    },
    tokensLogos: {
      ["0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"]: BCSPX_LOGO,
      ["0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"]: WXDAI_LOGO,
      ["0x532801ed6f82fffd2dab70a19fc2d7b2772c4f4b"]: SWAPR_LOGO,
      ["0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1"]: WETH_LOGO,
      ["0x9c58bacc331c9aa871afd802db6379a98e80cedb"]: GNO_LOGO,
      ["0x8e5bbbb09ed1ebde8674cda39a0c169401db4252"]: WBTC_LOGO,
      ["0xddafbb505ad214d7b80b1f830fccc89b60fb7a83"]: USDC_LOGO,
      ["0xcb444e90d8198415266c6a2724b7900fb12fc56e"]: EURE_LOGO,
      ["0xaf204776c7245bf4147c2612bf6e5972ee483701"]: SDAI_LOGO,
      ["0x4b1e2c2762667331bc91648052f646d1b0d35984"]: EURA_LOGO,
      ["0x6c76971f98945ae98dd7d4dfca8711ebea946ea6"]: WSTETH_LOGO,
      ["0x37b60f4e9a31a64ccc0024dce7d0fd07eaa0f7b3"]: PNK_LOGO,
      ["0x177127622c4a00f3d409b75571e12cb3c8973d3c"]: COW_LOGO,
      ["0x4d18815d14fe5c3304e87b3fa18318baa5c23820"]: SAFE_LOGO,
      ["0x67ee2155601e168f7777f169cd74f3e22bb5e0ce"]: AJNA_LOGO,
      ["0x712b3d230f3c1c19db860d80619288b1f0bdd0bd"]: CRV_LOGO,
      ["0xd057604a14982fe8d88c5fc25aac3267ea142a08"]: HOPR_LOGO,
      ["0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f"]: OLAS_LOGO,
      ["0x8CCd277Cc638E7e17F8100cE583cBcEf42007Dca"]: SHUTTER_LOGO,
      ["0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0"]: USDC_LOGO, // USDC.e (bridged)
    },
    stableTokens: {
      ["0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"]: {
        name: "USD//C on Gnosis",
        symbol: "USDC",
        decimals: 6,
      },
    },
    stableTokenForUSDPrice: {
      address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
      name: "USD//C on Gnosis",
      symbol: "USDC",
      decimals: 6,
    },
    // Real tokens and their possible fake names. Used for token launch safety
    filterForScamTokens: {
      tokensForCheck: {
        ["DD"]: "0x582daef1f36d6009f64b74519cfd612a8467be18",
        ["DC"]: "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
      },
      possibleFakeNames: [
        {
          names: ["Doge Dragon", "DogeDragon", "Dragon Doge", "DragonDoge"],
          realAddress: "0x582daef1f36d6009f64b74519cfd612a8467be18",
        },
        {
          names: [
            "Dogechain Token",
            "DogeChain Token",
            "Dogechain",
            "DogeChain",
          ],
          realAddresses: "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
        },
      ],
    },
  },

  V3_CONTRACTS: {
    POOL_DEPLOYER_ADDRESS: "0xC1b576AC6Ec749d5Ace1787bF9Ec6340908ddB47",
    FACTORY_ADDRESS: "0xA0864cCA6E114013AB0e27cbd5B6f4c8947da766",
    QUOTER_ADDRESS: "0xcBaD9FDf0D2814659Eb26f600EFDeAF005Eda0F7",
    SWAP_ROUTER_ADDRESS: "0xfFB643E73f280B97809A8b41f7232AB401a04ee1",
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS:
      "0x91fD594c46D8B01E62dBDeBed2401dde01817834",
    MULTICALL_ADDRESS: "0xc4B85BaF01cD7D1C8F08a8539ba96C205782BBcf",
    FARMING_CENTER_ADDRESS: "0xDe51dDF1aE7d5BBD7bF1A0e40aAA1F6C12579106",
    LIMIT_FARMING_ADDRESS: "0xA01e2785d2D04cC0a09Bde9C3eA49Bf0aD7811F2",
    ETERNAL_FARMING_ADDRESS: "0x607BbfD4CEbd869AaD04331F8a2AD0C3C396674b",
    POOL_INIT_CODE_HASH:
      "0xbce37a54eab2fcd71913a0d40723e04238970e7fc1159bfd58ad5b79531697e7",
  },

  SUBGRAPH: {
    infoURL: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/YwkNWffc8UTH77wDqGWgMShMq1uXdiQsD5wrD5MzKwJ`,
    farmingURL: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/4WysHZ1gFJcv1HLAobLMx3dS9B6aovExzyG3n7kRjwKT`,
    blocklyticsURL: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/FSFGfeobVFdtoWnGkULtLQ5vYu38tc9BxYR1e1yXjVPZ`,
  },

  API: {
    eternalFarmsAPR:
      "https://algebra.swaprhq.io/api/APR/eternalFarmings/?network=gnosis",
    limitFarmsAPR:
      "https://algebra.swaprhq.io/api/APR/limitFarmings/?network=gnosis",
    eternalFarmsTVL:
      "https://algebra.swaprhq.io/api/TVL/eternalFarmings/?network=gnosis",
    limitFarmsTVL:
      "https://algebra.swaprhq.io/api/TVL/limitFarmings/?network=gnosis",
    poolsAPR: "https://algebra.swaprhq.io/api/APR/pools/?network=gnosis",
    poolsAPRmax: "https://algebra.swaprhq.io/api/APR/pools/max?network=gnosis",
  },

  MISC: {
    title: "Liqudity | Swapr",
    description: "Concetraded liquidity on Gnosis Chain",
    appURL: "swapr.eth.limo",
  },
};
