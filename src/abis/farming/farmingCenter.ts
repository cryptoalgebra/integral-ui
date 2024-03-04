export const farmingCenter = [
    {
        inputs: [
            {
                internalType: 'contract IAlgebraEternalFarming',
                name: '_eternalFarming',
                type: 'address',
            },
            {
                internalType: 'contract INonfungiblePositionManager',
                name: '_nonfungiblePositionManager',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                internalType: 'int256',
                name: 'liquidityDelta',
                type: 'int256',
            },
        ],
        name: 'applyLiquidityDelta',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'burnPosition',
        outputs: [
            {
                internalType: 'bool',
                name: 'success',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IERC20Minimal',
                name: 'rewardToken',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amountRequested',
                type: 'uint256',
            },
        ],
        name: 'claimReward',
        outputs: [
            {
                internalType: 'uint256',
                name: 'reward',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'rewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'bonusRewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IAlgebraPool',
                        name: 'pool',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IncentiveKey',
                name: 'key',
                type: 'tuple',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'collectRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: 'reward',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'bonusReward',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IAlgebraPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newVirtualPool',
                type: 'address',
            },
        ],
        name: 'connectVirtualPool',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'liquidityDelta',
                type: 'uint256',
            },
        ],
        name: 'decreaseLiquidity',
        outputs: [
            {
                internalType: 'bool',
                name: 'success',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'deposits',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'rewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'bonusRewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IAlgebraPool',
                        name: 'pool',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IncentiveKey',
                name: 'key',
                type: 'tuple',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'enterFarming',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'eternalFarming',
        outputs: [
            {
                internalType: 'contract IAlgebraEternalFarming',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'rewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IERC20Minimal',
                        name: 'bonusRewardToken',
                        type: 'address',
                    },
                    {
                        internalType: 'contract IAlgebraPool',
                        name: 'pool',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IncentiveKey',
                name: 'key',
                type: 'tuple',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'exitFarming',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        name: 'incentiveKeys',
        outputs: [
            {
                internalType: 'contract IERC20Minimal',
                name: 'rewardToken',
                type: 'address',
            },
            {
                internalType: 'contract IERC20Minimal',
                name: 'bonusRewardToken',
                type: 'address',
            },
            {
                internalType: 'contract IAlgebraPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'nonce',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'liquidityDelta',
                type: 'uint256',
            },
        ],
        name: 'increaseLiquidity',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes[]',
                name: 'data',
                type: 'bytes[]',
            },
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'bytes[]',
                name: 'results',
                type: 'bytes[]',
            },
        ],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'nonfungiblePositionManager',
        outputs: [
            {
                internalType: 'contract INonfungiblePositionManager',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'virtualPoolAddresses',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
