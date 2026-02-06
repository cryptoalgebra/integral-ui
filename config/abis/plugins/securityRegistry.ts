export const securityRegistryAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_algebraFactory",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "OnlyOwner",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "enum ISecurityRegistry.Status",
                name: "status",
                type: "uint8",
            },
        ],
        name: "GlobalStatus",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "pool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "enum ISecurityRegistry.Status",
                name: "status",
                type: "uint8",
            },
        ],
        name: "PoolStatus",
        type: "event",
    },
    {
        inputs: [],
        name: "GUARD",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "algebraFactory",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "pool",
                type: "address",
            },
        ],
        name: "getPoolStatus",
        outputs: [
            {
                internalType: "enum ISecurityRegistry.Status",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "globalStatus",
        outputs: [
            {
                internalType: "enum ISecurityRegistry.Status",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "isPoolStatusOverrided",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "poolStatus",
        outputs: [
            {
                internalType: "enum ISecurityRegistry.Status",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "enum ISecurityRegistry.Status",
                name: "newStatus",
                type: "uint8",
            },
        ],
        name: "setGlobalStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "pools",
                type: "address[]",
            },
            {
                internalType: "enum ISecurityRegistry.Status[]",
                name: "newStatuses",
                type: "uint8[]",
            },
        ],
        name: "setPoolsStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
