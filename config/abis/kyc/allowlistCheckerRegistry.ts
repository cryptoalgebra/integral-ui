export const ALLOWLIST_CHECKER_REGISTRY_ABI = [
    { inputs: [{ internalType: "address", name: "_algebraFactory", type: "address" }], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [], name: "CheckerDoesNotSupportInterface", type: "error" },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "token", type: "address" },
            { indexed: true, internalType: "address", name: "checker", type: "address" },
        ],
        name: "CheckerUpdated",
        type: "event",
    },
    {
        inputs: [],
        name: "PERMISSIONED_POOL_MANAGER",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "algebraFactory",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "getChecker",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "address", name: "checker", type: "address" },
        ],
        name: "setChecker",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
