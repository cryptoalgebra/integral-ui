import { ChainId } from "@/constants/ChainId";
import { Token } from "@cryptoalgebra/integral-sdk";

export const WNATIVE: { [chainId: number]: Token } = {
  [ChainId.Gnosis]: new Token(
    ChainId.Gnosis,
    "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
    18,
    "WXDAI",
    "Wrapped xDAI"
  ),
  [ChainId.Goerli]: new Token(
    ChainId.Goerli,
    "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.ZKSyncTestnet]: new Token(
    ChainId.ZKSyncTestnet,
    "0x20b28B1e4665FFf290650586ad76E977EAb90c5D",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.ZKSync]: new Token(
    ChainId.ZKSync,
    "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.BSCTestnet]: new Token(
    ChainId.BSCTestnet,
    "0x094616f0bdfb0b526bd735bf66eca0ad254ca81f",
    18,
    "WBNB",
    "WRAPPED BNB"
  ),
  [ChainId.Mantle]: new Token(
    ChainId.Mantle,
    "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8",
    18,
    "WMNT",
    "WRAPPED MNT"
  ),
  [ChainId.Telos]: new Token(
    ChainId.Telos,
    "0xd102ce6a4db07d247fcc28f366a623df0938ca9e",
    18,
    "WTLOS",
    "WRAPPED TLOS"
  ),
  [ChainId.MantleTestnet]: new Token(
    ChainId.MantleTestnet,
    "0x6e2542afc68a1697feb2810437df9409d3b93493",
    18,
    "WMNT",
    "WRAPPED MNT"
  ),
  [ChainId.TelosTestnet]: new Token(
    ChainId.TelosTestnet,
    "0x6e2542afc68a1697feb2810437df9409d3b93493",
    18,
    "WTLOS",
    "WRAPPED TLOS"
  ),
  [ChainId.BerachainTestnet]: new Token(
    ChainId.BerachainTestnet,
    "0x5806e416da447b267cea759358cf22cc41fae80f",
    18,
    "WBERA",
    "WRAPPED BERA"
  ),
  [ChainId.FormTestnet]: new Token(
    ChainId.FormTestnet,
    "0xa65be6d7de4a82cc9638fb3dbf8e68b7f2e757ab",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.Katla]: new Token(
    ChainId.Katla,
    "0x003eaAf23aa5fe907F32F7c415a2075b5f1629a2",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.Holesky]: new Token(
    ChainId.Holesky,
    "0x94373a4919b3240d86ea41593d5eba789fef3848",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.Mode]: new Token(
    ChainId.Mode,
    "0x4200000000000000000000000000000000000006",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.ModeTestnet]: new Token(
    ChainId.ModeTestnet,
    "0x4200000000000000000000000000000000000006",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.BlastTestnet]: new Token(
    ChainId.BlastTestnet,
    "0x4200000000000000000000000000000000000023",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.BlastTestnetBlade]: new Token(
    ChainId.BlastTestnetBlade,
    "0x4200000000000000000000000000000000000023",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.Arthera]: new Token(
    ChainId.Arthera,
    "0x69D349E2009Af35206EFc3937BaD6817424729F7",
    18,
    "WAA",
    "WRAPPED AA"
  ),
  [ChainId.ArtheraTestnet]: new Token(
    ChainId.ArtheraTestnet,
    "0x5A1750f9cb8A7E98e1FD618922Af276493318710",
    18,
    "WAA",
    "WRAPPED AA"
  ),
  [ChainId.LineaSepolia]: new Token(
    ChainId.LineaSepolia,
    "0x10253594A832f967994b44f33411940533302ACb",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.MantleSepolia]: new Token(
    ChainId.MantleSepolia,
    "0xb1eda18c1b730a973dac2ec37cfd5685d7de10dd",
    18,
    "WMNT",
    "WRAPPED MNT"
  ),
  [ChainId.SeiDevnet]: new Token(
    ChainId.SeiDevnet,
    "0x57eE725BEeB991c70c53f9642f36755EC6eb2139",
    18,
    "WSEI",
    "WRAPPED SEI"
  ),
  [ChainId.NeonDevnet]: new Token(
    ChainId.NeonDevnet,
    "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
    18,
    "WNEON",
    "WRAPPED NEON"
  ),
  [ChainId.Linea]: new Token(
    ChainId.Linea,
    "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
  [ChainId.BaseSepolia]: new Token(
    ChainId.BaseSepolia,
    "0x10253594A832f967994b44f33411940533302ACb",
    18,
    "WETH",
    "WRAPPED ETH"
  ),
};
