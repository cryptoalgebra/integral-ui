export const omegaQuoterABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "permit2",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "weth",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "uniswapV2Factory",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "uniswapV3Factory",
                        type: "address",
                    },
                    {
                        internalType: "bytes32",
                        name: "uniswapPairInitCodeHash",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "uniswapPoolInitCodeHash",
                        type: "bytes32",
                    },
                    {
                        internalType: "address",
                        name: "integralFactory",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "integralPoolDeployer",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "integralPosManager",
                        type: "address",
                    },
                    {
                        internalType: "bytes32",
                        name: "integralPoolInitCodeHash",
                        type: "bytes32",
                    },
                ],
                internalType: "struct RouterParameters",
                name: "params",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "commandIndex",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "message",
                type: "bytes",
            },
        ],
        name: "ExecutionFailed",
        type: "error",
    },
    {
        inputs: [],
        name: "IntegralPathError",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "commandType",
                type: "uint256",
            },
        ],
        name: "InvalidCommandType",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidPath",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidReserves",
        type: "error",
    },
    {
        inputs: [],
        name: "LengthMismatch",
        type: "error",
    },
    {
        inputs: [],
        name: "SliceOutOfBounds",
        type: "error",
    },
    {
        inputs: [],
        name: "V3PathError",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "int256",
                name: "amount0Delta",
                type: "int256",
            },
            {
                internalType: "int256",
                name: "amount1Delta",
                type: "int256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "algebraSwapCallback",
        outputs: [],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "commands",
                type: "bytes",
            },
            {
                internalType: "bytes[]",
                name: "inputs",
                type: "bytes[]",
            },
        ],
        name: "execute",
        outputs: [
            {
                internalType: "bytes[]",
                name: "outputs",
                type: "bytes[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int256",
                name: "amount0Delta",
                type: "int256",
            },
            {
                internalType: "int256",
                name: "amount1Delta",
                type: "int256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "uniswapV3SwapCallback",
        outputs: [],
        stateMutability: "view",
        type: "function",
    },
] as const;
