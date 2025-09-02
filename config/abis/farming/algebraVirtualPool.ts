export const algebraVirtualPoolABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_farmingAddress",
                type: "address",
            },
            {
                internalType: "address",
                name: "_plugin",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "invalidFeeWeights",
        type: "error",
    },
    {
        inputs: [],
        name: "invalidNewMaxRate",
        type: "error",
    },
    {
        inputs: [],
        name: "invalidNewMinRate",
        type: "error",
    },
    {
        inputs: [],
        name: "liquidityAdd",
        type: "error",
    },
    {
        inputs: [],
        name: "liquidityOverflow",
        type: "error",
    },
    {
        inputs: [],
        name: "liquiditySub",
        type: "error",
    },
    {
        inputs: [],
        name: "onlyFarming",
        type: "error",
    },
    {
        inputs: [],
        name: "onlyPlugin",
        type: "error",
    },
    {
        inputs: [],
        name: "tickInvalidLinks",
        type: "error",
    },
    {
        inputs: [],
        name: "tickIsNotInitialized",
        type: "error",
    },
    {
        inputs: [],
        name: "FEE_WEIGHT_DENOMINATOR",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "RATE_CHANGE_FREQUENCY",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint128",
                name: "token0Amount",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "token1Amount",
                type: "uint128",
            },
        ],
        name: "addRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int24",
                name: "bottomTick",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "topTick",
                type: "int24",
            },
            {
                internalType: "int128",
                name: "liquidityDelta",
                type: "int128",
            },
            {
                internalType: "int24",
                name: "currentTick",
                type: "int24",
            },
        ],
        name: "applyLiquidityDeltaToPosition",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int24",
                name: "targetTick",
                type: "int24",
            },
            {
                internalType: "bool",
                name: "zeroToOne",
                type: "bool",
            },
            {
                internalType: "uint128",
                name: "feeAmount",
                type: "uint128",
            },
        ],
        name: "crossTo",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "currentLiquidity",
        outputs: [
            {
                internalType: "uint128",
                name: "",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "deactivate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "deactivated",
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
                internalType: "uint128",
                name: "token0Amount",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "token1Amount",
                type: "uint128",
            },
        ],
        name: "decreaseRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "distributeRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "dynamicRateActivated",
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
        inputs: [],
        name: "farmingAddress",
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
        inputs: [],
        name: "feeWeights",
        outputs: [
            {
                internalType: "uint16",
                name: "weight0",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "weight1",
                type: "uint16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int24",
                name: "bottomTick",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "topTick",
                type: "int24",
            },
        ],
        name: "getInnerRewardsGrowth",
        outputs: [
            {
                internalType: "uint256",
                name: "rewardGrowthInside0",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "rewardGrowthInside1",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "globalTick",
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
        name: "plugin",
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
        inputs: [],
        name: "prevTimestamp",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "rateLimits",
        outputs: [
            {
                internalType: "uint128",
                name: "maxRewardRate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "maxRewardRate1",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "minRewardRate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "minRewardRate1",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "rewardRates",
        outputs: [
            {
                internalType: "uint128",
                name: "rate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "rate1",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "rewardReserves",
        outputs: [
            {
                internalType: "uint128",
                name: "reserve0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "reserve1",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint128",
                name: "_maxRate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "_maxRate1",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "_minRate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "_minRate1",
                type: "uint128",
            },
        ],
        name: "setDynamicRateLimits",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint128",
                name: "rate0",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "rate1",
                type: "uint128",
            },
        ],
        name: "setRates",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "weight0",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "weight1",
                type: "uint16",
            },
        ],
        name: "setWeights",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bool",
                name: "isActive",
                type: "bool",
            },
        ],
        name: "switchDynamicRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int24",
                name: "tickId",
                type: "int24",
            },
        ],
        name: "ticks",
        outputs: [
            {
                internalType: "uint256",
                name: "liquidityTotal",
                type: "uint256",
            },
            {
                internalType: "int128",
                name: "liquidityDelta",
                type: "int128",
            },
            {
                internalType: "int24",
                name: "prevTick",
                type: "int24",
            },
            {
                internalType: "int24",
                name: "nextTick",
                type: "int24",
            },
            {
                internalType: "uint256",
                name: "outerFeeGrowth0Token",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "outerFeeGrowth1Token",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalRewardGrowth",
        outputs: [
            {
                internalType: "uint256",
                name: "rewardGrowth0",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "rewardGrowth1",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
