export const algebraPoolDeployerABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_factory",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "plugin",
                type: "address",
            },
            {
                internalType: "address",
                name: "token0",
                type: "address",
            },
            {
                internalType: "address",
                name: "token1",
                type: "address",
            },
            {
                internalType: "address",
                name: "deployer",
                type: "address",
            },
        ],
        name: "deploy",
        outputs: [
            {
                internalType: "address",
                name: "pool",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "getDeployParameters",
        outputs: [
            {
                internalType: "address",
                name: "_plugin",
                type: "address",
            },
            {
                internalType: "address",
                name: "_factory",
                type: "address",
            },
            {
                internalType: "address",
                name: "_token0",
                type: "address",
            },
            {
                internalType: "address",
                name: "_token1",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
