export const algebraCustomPoolDeployerABI = [
  {
    inputs: [
      { internalType: "address", name: "_entryPoint", type: "address" },
      { internalType: "address", name: "_plugin", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "bytes", name: "", type: "bytes" },
    ],
    name: "beforeCreatePoolHook",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deployer", type: "address" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "createCustomPool",
    outputs: [{ internalType: "address", name: "customPool", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "entryPoint",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "plugin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "poolToPlugin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint16", name: "newFee", type: "uint16" },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "address", name: "newPluginAddress", type: "address" },
    ],
    name: "setPlugin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint8", name: "newConfig", type: "uint8" },
    ],
    name: "setPluginConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "address", name: "_plugin", type: "address" },
    ],
    name: "setPluginForPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "int24", name: "newTickSpacing", type: "int24" },
    ],
    name: "setTickSpacing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
