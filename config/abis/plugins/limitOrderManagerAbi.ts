export const limitOrderManagerABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_wNativeToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_poolDeployer",
                type: "address",
            },
            {
                internalType: "address",
                name: "_basePluginFactory",
                type: "address",
            },
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
        inputs: [],
        name: "CrossedRange",
        type: "error",
    },
    {
        inputs: [],
        name: "Filled",
        type: "error",
    },
    {
        inputs: [],
        name: "InRange",
        type: "error",
    },
    {
        inputs: [],
        name: "InsufficientLiquidity",
        type: "error",
    },
    {
        inputs: [],
        name: "NotFilled",
        type: "error",
    },
    {
        inputs: [],
        name: "NotPlugin",
        type: "error",
    },
    {
        inputs: [],
        name: "NotPoolManagerToken",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroLiquidity",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                indexed: false,
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
        ],
        name: "Fill",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                indexed: false,
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
        ],
        name: "Kill",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "pool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "int24",
                name: "tickSpacing",
                type: "int24",
            },
        ],
        name: "LimitOrderTickSpacing",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                indexed: false,
                internalType: "address",
                name: "pool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                indexed: false,
                internalType: "int24",
                name: "tickUpper",
                type: "int24",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
        ],
        name: "Place",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
        ],
        name: "Withdraw",
        type: "event",
    },
    {
        inputs: [],
        name: "ALGEBRA_BASE_PLUGIN_MANAGER",
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
        inputs: [
            {
                internalType: "address",
                name: "pool",
                type: "address",
            },
            {
                internalType: "bool",
                name: "zeroToOne",
                type: "bool",
            },
            {
                internalType: "int24",
                name: "tick",
                type: "int24",
            },
        ],
        name: "afterSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount0Owed",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amount1Owed",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "algebraMintCallback",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "basePluginFactory",
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
                internalType: "Epoch",
                name: "",
                type: "uint232",
            },
        ],
        name: "epochInfos",
        outputs: [
            {
                internalType: "bool",
                name: "filled",
                type: "bool",
            },
            {
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "tickUpper",
                type: "int24",
            },
            {
                internalType: "uint128",
                name: "liquidityTotal",
                type: "uint128",
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
            {
                internalType: "uint128",
                name: "token0Total",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "token1Total",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "epochNext",
        outputs: [
            {
                internalType: "Epoch",
                name: "",
                type: "uint232",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "epochs",
        outputs: [
            {
                internalType: "Epoch",
                name: "",
                type: "uint232",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "factory",
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
            {
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "tickUpper",
                type: "int24",
            },
            {
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
        ],
        name: "getEpoch",
        outputs: [
            {
                internalType: "Epoch",
                name: "",
                type: "uint232",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "getEpochLiquidity",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
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
        name: "initialized",
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
                components: [
                    {
                        internalType: "address",
                        name: "deployer",
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
                ],
                internalType: "struct PoolAddress.PoolKey",
                name: "poolKey",
                type: "tuple",
            },
            {
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "tickUpper",
                type: "int24",
            },
            {
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
            {
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "kill",
        outputs: [
            {
                internalType: "uint256",
                name: "amount0",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amount1",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "deployer",
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
                ],
                internalType: "struct PoolAddress.PoolKey",
                name: "poolKey",
                type: "tuple",
            },
            {
                internalType: "int24",
                name: "tickLower",
                type: "int24",
            },
            {
                internalType: "bool",
                name: "zeroForOne",
                type: "bool",
            },
            {
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
        ],
        name: "place",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [],
        name: "poolDeployer",
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
            {
                internalType: "int24",
                name: "tickSpacing",
                type: "int24",
            },
        ],
        name: "setTickSpacing",
        outputs: [],
        stateMutability: "nonpayable",
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
        name: "tickLowerLasts",
        outputs: [
            {
                internalType: "int24",
                name: "",
                type: "int24",
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
        name: "tickSpacings",
        outputs: [
            {
                internalType: "int24",
                name: "",
                type: "int24",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "wNativeToken",
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
                internalType: "Epoch",
                name: "epoch",
                type: "uint232",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "amount0",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amount1",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
] as const;
