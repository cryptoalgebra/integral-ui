export const algebraEternalFarming = {
    _format: 'hh-sol-artifact-1',
    contractName: 'AlgebraEternalFarming',
    sourceName: 'contracts/farmings/AlgebraEternalFarming.sol',
    abi: [
        {
            inputs: [
                {
                    internalType: 'contract IAlgebraPoolDeployer',
                    name: '_deployer',
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
            inputs: [],
            name: 'anotherFarmingIsActive',
            type: 'error',
        },
        {
            inputs: [],
            name: 'claimToZeroAddress',
            type: 'error',
        },
        {
            inputs: [],
            name: 'emergencyActivated',
            type: 'error',
        },
        {
            inputs: [],
            name: 'farmDoesNotExist',
            type: 'error',
        },
        {
            inputs: [],
            name: 'incentiveNotExist',
            type: 'error',
        },
        {
            inputs: [],
            name: 'incentiveStopped',
            type: 'error',
        },
        {
            inputs: [],
            name: 'invalidPool',
            type: 'error',
        },
        {
            inputs: [],
            name: 'invalidTokenAmount',
            type: 'error',
        },
        {
            inputs: [],
            name: 'minimalPositionWidthTooWide',
            type: 'error',
        },
        {
            inputs: [],
            name: 'pluginNotConnected',
            type: 'error',
        },
        {
            inputs: [],
            name: 'poolReentrancyLock',
            type: 'error',
        },
        {
            inputs: [],
            name: 'positionIsTooNarrow',
            type: 'error',
        },
        {
            inputs: [],
            name: 'reentrancyLock',
            type: 'error',
        },
        {
            inputs: [],
            name: 'tokenAlreadyFarmed',
            type: 'error',
        },
        {
            inputs: [],
            name: 'zeroLiquidity',
            type: 'error',
        },
        {
            inputs: [],
            name: 'zeroRewardAmount',
            type: 'error',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'newStatus',
                    type: 'bool',
                },
            ],
            name: 'EmergencyWithdraw',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'contract IERC20Minimal',
                    name: 'rewardToken',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'contract IERC20Minimal',
                    name: 'bonusRewardToken',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'contract IAlgebraPool',
                    name: 'pool',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'virtualPool',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'reward',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'bonusReward',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint24',
                    name: 'minimalAllowedPositionWidth',
                    type: 'uint24',
                },
            ],
            name: 'EternalFarmingCreated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
                {
                    indexed: true,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'rewardAddress',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'bonusRewardToken',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'reward',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'bonusReward',
                    type: 'uint256',
                },
            ],
            name: 'FarmEnded',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
                {
                    indexed: true,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint128',
                    name: 'liquidity',
                    type: 'uint128',
                },
            ],
            name: 'FarmEntered',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'farmingCenter',
                    type: 'address',
                },
            ],
            name: 'FarmingCenter',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'IncentiveDeactivated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'rewardAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'bonusRewardAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'RewardAmountsDecreased',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'to',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'reward',
                    type: 'uint256',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'rewardAddress',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
            ],
            name: 'RewardClaimed',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'rewardAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'bonusRewardAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'RewardsAdded',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'rewardAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'bonusRewardAmount',
                    type: 'uint256',
                },
            ],
            name: 'RewardsCollected',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint128',
                    name: 'rewardRate',
                    type: 'uint128',
                },
                {
                    indexed: false,
                    internalType: 'uint128',
                    name: 'bonusRewardRate',
                    type: 'uint128',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'RewardsRatesChanged',
            type: 'event',
        },
        {
            inputs: [],
            name: 'FARMINGS_ADMINISTRATOR_ROLE',
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
            inputs: [],
            name: 'INCENTIVE_MAKER_ROLE',
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
                    internalType: 'uint128',
                    name: 'rewardAmount',
                    type: 'uint128',
                },
                {
                    internalType: 'uint128',
                    name: 'bonusRewardAmount',
                    type: 'uint128',
                },
            ],
            name: 'addRewards',
            outputs: [],
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
                    internalType: 'contract IERC20Minimal',
                    name: 'rewardToken',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: 'from',
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
            name: 'claimRewardFrom',
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
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
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
                    components: [
                        {
                            internalType: 'uint128',
                            name: 'reward',
                            type: 'uint128',
                        },
                        {
                            internalType: 'uint128',
                            name: 'bonusReward',
                            type: 'uint128',
                        },
                        {
                            internalType: 'uint128',
                            name: 'rewardRate',
                            type: 'uint128',
                        },
                        {
                            internalType: 'uint128',
                            name: 'bonusRewardRate',
                            type: 'uint128',
                        },
                        {
                            internalType: 'uint24',
                            name: 'minimalPositionWidth',
                            type: 'uint24',
                        },
                    ],
                    internalType:
                        'struct IAlgebraEternalFarming.IncentiveParams',
                    name: 'params',
                    type: 'tuple',
                },
                {
                    internalType: 'address',
                    name: 'plugin',
                    type: 'address',
                },
            ],
            name: 'createEternalFarming',
            outputs: [
                {
                    internalType: 'address',
                    name: 'virtualPool',
                    type: 'address',
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
            ],
            name: 'deactivateIncentive',
            outputs: [],
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
                    internalType: 'uint128',
                    name: 'rewardAmount',
                    type: 'uint128',
                },
                {
                    internalType: 'uint128',
                    name: 'bonusRewardAmount',
                    type: 'uint128',
                },
            ],
            name: 'decreaseRewardsAmount',
            outputs: [],
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
            name: 'enterFarming',
            outputs: [],
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
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'exitFarming',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'farmingCenter',
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
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
                {
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'farms',
            outputs: [
                {
                    internalType: 'uint128',
                    name: 'liquidity',
                    type: 'uint128',
                },
                {
                    internalType: 'int24',
                    name: 'tickLower',
                    type: 'int24',
                },
                {
                    internalType: 'int24',
                    name: 'tickUpper',
                    type: 'int24',
                },
                {
                    internalType: 'uint256',
                    name: 'innerRewardGrowth0',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'innerRewardGrowth1',
                    type: 'uint256',
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
            name: 'getRewardInfo',
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
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'incentives',
            outputs: [
                {
                    internalType: 'uint128',
                    name: 'totalReward',
                    type: 'uint128',
                },
                {
                    internalType: 'uint128',
                    name: 'bonusReward',
                    type: 'uint128',
                },
                {
                    internalType: 'address',
                    name: 'virtualPoolAddress',
                    type: 'address',
                },
                {
                    internalType: 'uint24',
                    name: 'minimalPositionWidth',
                    type: 'uint24',
                },
                {
                    internalType: 'bool',
                    name: 'deactivated',
                    type: 'bool',
                },
                {
                    internalType: 'address',
                    name: 'pluginAddress',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'isEmergencyWithdrawActivated',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'incentiveId',
                    type: 'bytes32',
                },
            ],
            name: 'isIncentiveDeactivated',
            outputs: [
                {
                    internalType: 'bool',
                    name: 'res',
                    type: 'bool',
                },
            ],
            stateMutability: 'view',
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
            inputs: [],
            name: 'numOfIncentives',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
                {
                    internalType: 'contract IERC20Minimal',
                    name: 'rewardToken',
                    type: 'address',
                },
            ],
            name: 'rewards',
            outputs: [
                {
                    internalType: 'uint256',
                    name: 'rewardAmount',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bool',
                    name: 'newStatus',
                    type: 'bool',
                },
            ],
            name: 'setEmergencyWithdrawStatus',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_farmingCenter',
                    type: 'address',
                },
            ],
            name: 'setFarmingCenterAddress',
            outputs: [],
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
                    internalType: 'uint128',
                    name: 'rewardRate',
                    type: 'uint128',
                },
                {
                    internalType: 'uint128',
                    name: 'bonusRewardRate',
                    type: 'uint128',
                },
            ],
            name: 'setRates',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
    bytecode:
        '0x60e06040526000805460ff60a81b1916600160a81b1790553480156200002457600080fd5b5060405162006005380380620060058339810160408190526200004791620000ed565b6001600160a01b03808216608081905290831660a0526040805163c45a015560e01b8152905163c45a0155916004808201926020929091908290030181865afa15801562000099573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000bf91906200012c565b6001600160a01b031660c05250620001539050565b6001600160a01b0381168114620000ea57600080fd5b50565b600080604083850312156200010157600080fd5b82516200010e81620000d4565b60208401519092506200012181620000d4565b809150509250929050565b6000602082840312156200013f57600080fd5b81516200014c81620000d4565b9392505050565b60805160a05160c051615e7b6200018a600039600061200e0152600061270d0152600081816104f9015261272e0152615e7b6000f3fe60806040523480156200001157600080fd5b5060043610620001ad5760003560e01c80638433524111620000f5578063dd56e5d81162000097578063f2256319116200006e578063f225631914620005d1578063f26ebf7a14620005f7578063f6de3cae146200060e57600080fd5b8063dd56e5d8146200056b578063df42efda146200058c578063e70b9e2714620005a357600080fd5b8063b44a272211620000cc578063b44a272214620004f3578063b5bae00a146200051b578063b8883c50146200054357600080fd5b80638433524114620004ae578063890cdcb314620004c557806396da9bd514620004dc57600080fd5b806336808b19116200015f5780635739f0b911620001365780635739f0b9146200037657806360777795146200038d57806382bd79ea14620004a457600080fd5b806336808b1914620002fa5780633c6d07151462000311578063547b6da9146200033957600080fd5b806327e6a99a116200019457806327e6a99a14620002095780632912bf1014620002ca5780632f2d783d14620002e357600080fd5b8063046ec16614620001b25780630a53075414620001e3575b600080fd5b620001c9620001c33660046200343a565b62000625565b604080519283526020830191909152015b60405180910390f35b620001fa620001f436600462003480565b620007dc565b604051908152602001620001da565b620002886200021a366004620034d8565b6002602081815260009384526040808520909152918352912080546001820154918301546fffffffffffffffffffffffffffffffff8216937001000000000000000000000000000000008304810b93730100000000000000000000000000000000000000909304900b919085565b604080516fffffffffffffffffffffffffffffffff9096168652600294850b60208701529290930b918401919091526060830152608082015260a001620001da565b620002e1620002db366004620034fb565b620007ff565b005b620001fa620002f43660046200351a565b62000ad2565b620002e16200030b3660046200343a565b62000aec565b620001fa7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39581565b620003506200034a3660046200357f565b62000c94565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001620001da565b620002e16200038736600462003669565b62001259565b620004406200039e36600462003697565b60016020819052600091825260409091208054918101546002909101546fffffffffffffffffffffffffffffffff808416937001000000000000000000000000000000009004169173ffffffffffffffffffffffffffffffffffffffff8082169274010000000000000000000000000000000000000000830462ffffff169277010000000000000000000000000000000000000000000000900460ff16911686565b604080516fffffffffffffffffffffffffffffffff978816815296909516602087015273ffffffffffffffffffffffffffffffffffffffff9384169486019490945262ffffff9091166060850152151560808401521660a082015260c001620001da565b620001fa60035481565b620002e1620004bf366004620036b1565b62001455565b620002e1620004d636600462003706565b62001526565b620001c9620004ed36600462003669565b620015f6565b620003507f000000000000000000000000000000000000000000000000000000000000000081565b620005326200052c36600462003697565b62001654565b6040519015158152602001620001da565b620001fa7fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221981565b600054620003509073ffffffffffffffffffffffffffffffffffffffff1681565b620002e16200059d36600462003726565b62001673565b620001fa620005b436600462003746565b600460209081526000928352604080842090915290825290205481565b600054620005329074010000000000000000000000000000000000000000900460ff1681565b620002e162000608366004620036b1565b62001734565b620002e16200061f366004620036b1565b620017e0565b6000806200063262001b7c565b600080620006408762001ba3565b91509150600062000652878462001c7d565b600183015490915073ffffffffffffffffffffffffffffffffffffffff166200067b8162001d6c565b6000806200068a838562001dd1565b809450819550829a50839b50505050506000600260008c8152602001908152602001600020600088815260200190815260200160002090508281600101819055508181600201819055506000600460008c73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050896000146200074d578c5173ffffffffffffffffffffffffffffffffffffffff16600090815260208290526040902080548b0190555b881562000784576020808e015173ffffffffffffffffffffffffffffffffffffffff166000908152908290526040902080548a0190555b604080518d8152602081018a90529081018b9052606081018a90527f15b2e0f32b50efdbbdee9ec7884ed3c61e6209b1b395e5762011a6734b86f7b59060800160405180910390a15050505050505050935093915050565b6000620007e862001b7c565b620007f68585858562001e74565b95945050505050565b6200082a7fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b600080620008388362001ba3565b6001810154919350915077010000000000000000000000000000000000000000000000900460ff161562000898576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60018101805460028301547fffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffffffff82167701000000000000000000000000000000000000000000000017909255604080517f51b42b00000000000000000000000000000000000000000000000000000000008152905173ffffffffffffffffffffffffffffffffffffffff928316939092169183916351b42b0091600480830192600092919082900301818387803b1580156200095257600080fd5b505af115801562000967573d6000803e3d6000fd5b505050506000808373ffffffffffffffffffffffffffffffffffffffff1663a88a5c166040518163ffffffff1660e01b81526004016040805180830381865afa158015620009b9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620009df919062003791565b915091508082176fffffffffffffffffffffffffffffffff1660001462000a0f5762000a0f84600080896200209e565b6000546040517f2bd34c4800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8681166004830152858116602483015290911690632bd34c4890604401600060405180830381600087803b15801562000a8557600080fd5b505af115801562000a9a573d6000803e3d6000fd5b50506040518892507f907b91fb061b1c46367da11a5a0e8b2c0bd5fecd22eb92967e626cffa5ef63869150600090a250505050505050565b600062000ae28433858562001e74565b90505b9392505050565b62000af662001b7c565b600062000b688460408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b9050600062000b78848362001c7d565b9050600080600060149054906101000a900460ff1662000bd25762000bcc8388868862000bbb88600001516fffffffffffffffffffffffffffffffff1662002195565b62000bc690620037f4565b620021ac565b90925090505b6000868152600260208181526040808420888552825280842080547fffffffffffffffffffff000000000000000000000000000000000000000000001681556001810185905590920192909255885189830151825173ffffffffffffffffffffffffffffffffffffffff918216815289821694810194909452918301859052606083018490521690859088907f7f2557bb15dcf63e3d029ef1dcb4333563fcd78edf263b8fe42ed3adb925ff849060800160405180910390a450505050505050565b600062000cc17fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b6000846040015173ffffffffffffffffffffffffffffffffffffffff1663ef01df4f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000d13573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000d39919062003842565b90508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614158062000d8b575073ffffffffffffffffffffffffffffffffffffffff8116155b1562000dc3576040517f093d6f1700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16631d4632ac6040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000e27573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000e4d919062003842565b73ffffffffffffffffffffffffffffffffffffffff161462000e9b576040517f47146bcc00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b308160405162000eab90620032fd565b73ffffffffffffffffffffffffffffffffffffffff928316815291166020820152604001604051809103906000f08015801562000eec573d6000803e3d6000fd5b506000546040517fd68516bc00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8084166004830152848116602483015292945091169063d68516bc90604401600060405180830381600087803b15801562000f6557600080fd5b505af115801562000f7a573d6000803e3d6000fd5b50506003805492509050600062000f918362003862565b90915550606086015260006200100c8660408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b60008181526001602090815260409091208751918801519293509162001035918991846200234a565b6fffffffffffffffffffffffffffffffff9081166020890152168087526000036200108c576040517f36ab0f6a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6080860151621b13d062ffffff9091161315620010d5576040517f1db9891100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181018054608088015162ffffff811674010000000000000000000000000000000000000000027fffffffffffffffffff000000000000000000000000000000000000000000000090921673ffffffffffffffffffffffffffffffffffffffff80891691909117929092179092556002830180548683167fffffffffffffffffffffffff0000000000000000000000000000000000000000919091161790556040808a01516020808c01518c5160608e01518d51938e01519551948716979287169691909116947fcef9468c62cd8a6eca3a887fc30674c037943e423de07ab3a122bdf2f73c77e1946200121b948d9490929173ffffffffffffffffffffffffffffffffffffffff95909516855260208501939093526fffffffffffffffffffffffffffffffff918216604085015216606083015262ffffff16608082015260a00190565b60405180910390a4620012398487600001518860200151856200251c565b6200124f8487604001518860600151856200209e565b5050509392505050565b6200126362001b7c565b60005474010000000000000000000000000000000000000000900460ff1615620012b9576040517f05bfeb5900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000806000806000620012cd87876200260a565b93985091965094509250905080600080620012ea83888862002893565b915091506040518060a00160405280866fffffffffffffffffffffffffffffffff1681526020018860020b81526020018760020b815260200183815260200182815250600260008b815260200190815260200160002060008a815260200190815260200160002060008201518160000160006101000a8154816fffffffffffffffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff16021790555060208201518160000160106101000a81548162ffffff021916908360020b62ffffff16021790555060408201518160000160136101000a81548162ffffff021916908360020b62ffffff160217905550606082015181600101556080820151816002015590505087897f19bc21617a8d86ff19202ac9541480a99b9ae5fbd573a23f14f479af784392c4876040516200144191906fffffffffffffffffffffffffffffffff91909116815260200190565b60405180910390a350505050505050505050565b620014807fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b6000806200148e8562001ba3565b6001810154919350915073ffffffffffffffffffffffffffffffffffffffff166fffffffffffffffffffffffffffffffff8585171615801590620014d85750620014d88262002940565b1562001510576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6200151e818686866200209e565b505050505050565b620015517f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b801515600060149054906101000a900460ff161515036200157157600080fd5b6000805482151574010000000000000000000000000000000000000000027fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff9091161790556040517fee20b3d336390a4b077dbc7d702bf6e35a954bc96106f37b9e5ef08a1d0ce05990620015eb90831515815260200190565b60405180910390a150565b600080600080620016078662001ba3565b91509150600062001619868462001c7d565b600183015490915073ffffffffffffffffffffffffffffffffffffffff1662001643818362001dd1565b50919a909950975050505050505050565b60008181526001602052604081206200166d9062002940565b92915050565b6200169e7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b60005473ffffffffffffffffffffffffffffffffffffffff90811690821603620016c757600080fd5b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8316908117825560405190917f29f9e1ebeee07596f3165f3e42cb9d4d8d22b0481e968d6c74be3dd037c15d9b91a250565b600080620017428562001ba3565b91509150620017518162002940565b1562001789576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181015473ffffffffffffffffffffffffffffffffffffffff16620017b2868686856200234a565b90955093506fffffffffffffffffffffffffffffffff85851716156200151e576200151e818686866200251c565b6200180b7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b600080620018198562001ba3565b6001810154919350915073ffffffffffffffffffffffffffffffffffffffff16620018448162001d6c565b6000808273ffffffffffffffffffffffffffffffffffffffff1663f0de82286040518163ffffffff1660e01b81526004016040805180830381865afa15801562001892573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620018b8919062003791565b91509150816fffffffffffffffffffffffffffffffff16876fffffffffffffffffffffffffffffffff161115620018ed578196505b83546fffffffffffffffffffffffffffffffff90811690881610620019315783546200192e906001906fffffffffffffffffffffffffffffffff166200389d565b96505b8354620019529088906fffffffffffffffffffffffffffffffff166200389d565b84547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff91821617855581811690871611156200199e578095505b8354620019d390879070010000000000000000000000000000000090046fffffffffffffffffffffffffffffffff166200389d565b84546fffffffffffffffffffffffffffffffff9182167001000000000000000000000000000000000291161784556040517fca16ca7e00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84169063ca16ca7e9062001a74908a908a906004016fffffffffffffffffffffffffffffffff92831681529116602082015260400190565b600060405180830381600087803b15801562001a8f57600080fd5b505af115801562001aa4573d6000803e3d6000fd5b505050506fffffffffffffffffffffffffffffffff87161562001ae257875162001ae290336fffffffffffffffffffffffffffffffff8a16620029f6565b6fffffffffffffffffffffffffffffffff86161562001b1e5762001b1e886020015133886fffffffffffffffffffffffffffffffff16620029f6565b604080516fffffffffffffffffffffffffffffffff808a168252881660208201529081018690527f808ecc37f6d601dde1e43c133bee66af0ff9409b53aca0eb0d4f6c65fb8956e89060600160405180910390a15050505050505050565b60005473ffffffffffffffffffffffffffffffffffffffff16331462001ba157600080fd5b565b60008062001c168360408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b6000818152600160205260408120805492945092506fffffffffffffffffffffffffffffffff909116900362001c78576040517fe4c8229200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b915091565b6040805160a0810182526000808252602082018190529181018290526060810182905260808101919091525060008281526002602081815260408084208585528252808420815160a08101835281546fffffffffffffffffffffffffffffffff81168083527001000000000000000000000000000000008204870b958301959095527301000000000000000000000000000000000000009004850b92810192909252600181015460608301529092015460808301529091036200166d576040517f7aa92c6600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16636f4a2cd06040518163ffffffff1660e01b8152600401600060405180830381600087803b15801562001db557600080fd5b505af115801562001dca573d6000803e3d6000fd5b5050505050565b60008060008062001dec868660200151876040015162002893565b6060870151875192945090925062001e2c91908403906fffffffffffffffffffffffffffffffff1670010000000000000000000000000000000062002b6d565b62001e668660800151830387600001516fffffffffffffffffffffffffffffffff1670010000000000000000000000000000000062002b6d565b909790965091945092509050565b600073ffffffffffffffffffffffffffffffffffffffff831662001ec4576040517fabd1763600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5073ffffffffffffffffffffffffffffffffffffffff80841660009081526004602090815260408083209388168352908390529020549082158062001f0857508183115b1562001f12578192505b821562001fd05773ffffffffffffffffffffffffffffffffffffffff86166000908152602082905260409020838303905562001f50868585620029f6565b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167fe6ac6a784fb43c9f6329d2f5c82f88a26a93bad4281f7780725af5f071f0aafa8660405162001fc791815260200190565b60405180910390a45b50949350505050565b6040517fe8ae2b69000000000000000000000000000000000000000000000000000000008152600481018290523360248201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e8ae2b6990604401602060405180830381865afa1580156200206b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620020919190620038d0565b6200209b57600080fd5b50565b6040517f7f463bb80000000000000000000000000000000000000000000000000000000081526fffffffffffffffffffffffffffffffff80851660048301528316602482015273ffffffffffffffffffffffffffffffffffffffff851690637f463bb890604401600060405180830381600087803b1580156200212057600080fd5b505af115801562002135573d6000803e3d6000fd5b5050604080516fffffffffffffffffffffffffffffffff8088168252861660208201529081018490527f1864e4cc903d98e44820faebd48409c410a2ad20adb3173984ba41ae2828805e925060600190505b60405180910390a150505050565b80600f81900b8114620021a757600080fd5b919050565b600083815260016020819052604082209081015482919073ffffffffffffffffffffffffffffffffffffffff1682620021e58362002940565b620021ff57620021f9896040015162002c27565b62002271565b8173ffffffffffffffffffffffffffffffffffffffff16638e76c3326040518163ffffffff1660e01b8152600401602060405180830381865afa1580156200224b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002271919062003903565b90506200227e8262001d6c565b6200228a828b62001dd1565b9050508095508196505050620022ac828b602001518c60400151898562002ce6565b73ffffffffffffffffffffffffffffffffffffffff8716600090815260046020526040902085156200230557895173ffffffffffffffffffffffffffffffffffffffff1660009081526020829052604090208054870190555b84156200233c576020808b015173ffffffffffffffffffffffffffffffffffffffff16600090815290829052604090208054860190555b505050509550959350505050565b6000805481907501000000000000000000000000000000000000000000900460ff16620023a3576040517f2446d79f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600080547fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff1690556fffffffffffffffffffffffffffffffff851615620023f5578551620023f2908662002d8c565b91505b6fffffffffffffffffffffffffffffffff84161562002421576200241e86602001518562002d8c565b90505b600080547fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff16750100000000000000000000000000000000000000000017905582546fffffffffffffffffffffffffffffffff8082169170010000000000000000000000000000000090041662002499848362003921565b85547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff91909116178555620024e1838262003921565b85546fffffffffffffffffffffffffffffffff9182167001000000000000000000000000000000000291161790945550909590945092505050565b6040517ffddf08e50000000000000000000000000000000000000000000000000000000081526fffffffffffffffffffffffffffffffff80851660048301528316602482015273ffffffffffffffffffffffffffffffffffffffff85169063fddf08e590604401600060405180830381600087803b1580156200259e57600080fd5b505af1158015620025b3573d6000803e3d6000fd5b5050604080516fffffffffffffffffffffffffffffffff8088168252861660208201529081018490527f8b0312d8047895ce795779b66b705ccd39b1ece7c162f642c72d76a785d1b68a9250606001905062002187565b6000806000806000806200261e8862001ba3565b600089815260026020908152604080832085845290915290205491975091506fffffffffffffffffffffffffffffffff161562002687576040517ff352b37500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181015473ffffffffffffffffffffffffffffffffffffffff8116925074010000000000000000000000000000000000000000900462ffffff16620026cd8262002940565b1562002705576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000620027547f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000008b62002e26565b60408e0151929a50909850965090915073ffffffffffffffffffffffffffffffffffffffff808316911614620027b6576040517fdce2809300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b846fffffffffffffffffffffffffffffffff1660000362002803576040517f4eed436000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8162ffffff168760020b8760020b0312156200284b576040517feab0585000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000620028588262002c27565b9050620028858589896200287e8a6fffffffffffffffffffffffffffffffff1662002195565b8562002ce6565b505050509295509295909350565b6040517f0bd6f200000000000000000000000000000000000000000000000000000000008152600283810b600483015282900b6024820152600090819073ffffffffffffffffffffffffffffffffffffffff861690630bd6f200906044016040805180830381865afa1580156200290e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200293491906200394d565b91509150935093915050565b600181015460009073ffffffffffffffffffffffffffffffffffffffff81169077010000000000000000000000000000000000000000000000900460ff168062000ae5578173ffffffffffffffffffffffffffffffffffffffff1663556ed30e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015620029d0573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000ae29190620038d0565b6040805173ffffffffffffffffffffffffffffffffffffffff8481166024830152604480830185905283518084039091018152606490920183526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb00000000000000000000000000000000000000000000000000000000179052915160009283929087169162002a8f919062003972565b6000604051808303816000865af19150503d806000811462002ace576040519150601f19603f3d011682016040523d82523d6000602084013e62002ad3565b606091505b509150915081801562002b0157508051158062002b0157508080602001905181019062002b019190620038d0565b62001dca576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f535400000000000000000000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6000838302817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8587098281108382030391505080841162002bae57600080fd5b8060000362002bc35750829004905062000ae5565b8385870960008581038616958690049560026003880281188089028203028089028203028089028203028089028203028089028203028089029091030291819003819004600101858411909403939093029190930391909104170290509392505050565b6000808273ffffffffffffffffffffffffffffffffffffffff1663e76c01e46040518163ffffffff1660e01b815260040160c060405180830381865afa15801562002c76573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002c9c9190620039b6565b93965092945084935062002ce092505050576040517f9ded0f5700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50919050565b6040517fd6b83ede000000000000000000000000000000000000000000000000000000008152600285810b600483015284810b6024830152600f84900b604483015282900b606482015273ffffffffffffffffffffffffffffffffffffffff86169063d6b83ede90608401600060405180830381600087803b15801562002d6c57600080fd5b505af115801562002d81573d6000803e3d6000fd5b505050505050505050565b60008062002d9a8462002f0c565b905062002dbc843330866fffffffffffffffffffffffffffffffff1662002fa0565b600062002dc98562002f0c565b905081811162002dd857600080fd5b8181036fffffffffffffffffffffffffffffffff811115620007f6576040517f3ba11f1e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000806000806000808773ffffffffffffffffffffffffffffffffffffffff166399fbab88886040518263ffffffff1660e01b815260040162002e6b91815260200190565b61016060405180830381865afa15801562002e8a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002eb0919062003a44565b50506040805180820190915273ffffffffffffffffffffffffffffffffffffffff808916825287166020820152949d50929b5090995093975091955062002eff94508d935091506200311b9050565b9550505093509350935093565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009073ffffffffffffffffffffffffffffffffffffffff8316906370a0823190602401602060405180830381865afa15801562002f7a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200166d919062003b2c565b6040805173ffffffffffffffffffffffffffffffffffffffff85811660248301528481166044830152606480830185905283518084039091018152608490920183526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f23b872dd00000000000000000000000000000000000000000000000000000000179052915160009283929088169162003041919062003972565b6000604051808303816000865af19150503d806000811462003080576040519150601f19603f3d011682016040523d82523d6000602084013e62003085565b606091505b5091509150818015620030b3575080511580620030b3575080806020019051810190620030b39190620038d0565b6200151e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f5354460000000000000000000000000000000000000000000000000000000000604482015260640162002b64565b6000816020015173ffffffffffffffffffffffffffffffffffffffff16826000015173ffffffffffffffffffffffffffffffffffffffff1610620031bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f496e76616c6964206f72646572206f6620746f6b656e73000000000000000000604482015260640162002b64565b8282600001518360200151604051602001620031fb92919073ffffffffffffffffffffffffffffffffffffffff92831681529116602082015260400190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290528051602091820120620032c0939290917ff96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d91017fff00000000000000000000000000000000000000000000000000000000000000815260609390931b7fffffffffffffffffffffffffffffffffffffffff0000000000000000000000001660018401526015830191909152603582015260550190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815291905280516020909101209392505050565b6123288062003b4783390190565b60405160a0810167ffffffffffffffff8111828210171562003356577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405290565b73ffffffffffffffffffffffffffffffffffffffff811681146200209b57600080fd5b6000608082840312156200339257600080fd5b6040516080810181811067ffffffffffffffff82111715620033dd577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040529050808235620033f0816200335c565b8152602083013562003402816200335c565b6020820152604083013562003417816200335c565b6040820152606092830135920191909152919050565b8035620021a7816200335c565b600080600060c084860312156200345057600080fd5b6200345c85856200337f565b92506080840135915060a084013562003475816200335c565b809150509250925092565b600080600080608085870312156200349757600080fd5b8435620034a4816200335c565b93506020850135620034b6816200335c565b92506040850135620034c8816200335c565b9396929550929360600135925050565b60008060408385031215620034ec57600080fd5b50508035926020909101359150565b6000608082840312156200350e57600080fd5b62000ae583836200337f565b6000806000606084860312156200353057600080fd5b83356200353d816200335c565b925060208401356200354f816200335c565b929592945050506040919091013590565b6fffffffffffffffffffffffffffffffff811681146200209b57600080fd5b60008060008385036101408112156200359757600080fd5b620035a386866200337f565b935060a07fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8082011215620035d657600080fd5b50620035e16200330b565b6080850135620035f18162003560565b815260a0850135620036038162003560565b602082015260c0850135620036188162003560565b604082015260e08501356200362d8162003560565b606082015261010085013562ffffff811681146200364a57600080fd5b608082015291506200366061012085016200342d565b90509250925092565b60008060a083850312156200367d57600080fd5b6200368984846200337f565b946080939093013593505050565b600060208284031215620036aa57600080fd5b5035919050565b600080600060c08486031215620036c757600080fd5b620036d385856200337f565b92506080840135620036e58162003560565b915060a0840135620034758162003560565b80151581146200209b57600080fd5b6000602082840312156200371957600080fd5b813562000ae581620036f7565b6000602082840312156200373957600080fd5b813562000ae5816200335c565b600080604083850312156200375a57600080fd5b823562003767816200335c565b9150602083013562003779816200335c565b809150509250929050565b8051620021a78162003560565b60008060408385031215620037a557600080fd5b8251620037b28162003560565b6020840151909250620037798162003560565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600081600f0b7fffffffffffffffffffffffffffffffff8000000000000000000000000000000081036200382c576200382c620037c5565b60000392915050565b8051620021a7816200335c565b6000602082840312156200385557600080fd5b815162000ae5816200335c565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203620038965762003896620037c5565b5060010190565b6fffffffffffffffffffffffffffffffff828116828216039080821115620038c957620038c9620037c5565b5092915050565b600060208284031215620038e357600080fd5b815162000ae581620036f7565b8051600281900b8114620021a757600080fd5b6000602082840312156200391657600080fd5b62000ae582620038f0565b6fffffffffffffffffffffffffffffffff818116838216019080821115620038c957620038c9620037c5565b600080604083850312156200396157600080fd5b505080516020909101519092909150565b6000825160005b8181101562003995576020818601810151858301520162003979565b506000920191825250919050565b805161ffff81168114620021a757600080fd5b60008060008060008060c08789031215620039d057600080fd5b8651620039dd816200335c565b9550620039ed60208801620038f0565b9450620039fd60408801620039a3565b9350606087015160ff8116811462003a1457600080fd5b925062003a2460808801620039a3565b915060a087015162003a3681620036f7565b809150509295509295509295565b60008060008060008060008060008060006101608c8e03121562003a6757600080fd5b8b516affffffffffffffffffffff8116811462003a8357600080fd5b60208d0151909b5062003a96816200335c565b60408d0151909a5062003aa9816200335c565b985062003ab960608d0162003835565b975062003ac960808d01620038f0565b965062003ad960a08d01620038f0565b955062003ae960c08d0162003784565b945060e08c015193506101008c0151925062003b096101208d0162003784565b915062003b1a6101408d0162003784565b90509295989b509295989b9093969950565b60006020828403121562003b3f57600080fd5b505191905056fe60c0604052600160075560016008553480156200001b57600080fd5b506040516200232838038062002328833981810160405260408110156200004157600080fd5b508051602090910151620000566000620000d2565b6001600160a01b03828116608052811660a0526004805462ffffff63ffffffff60c81b011916600160c81b4263ffffffff160262ffffff19161762f27618179055620000a6620d89e719620001c8565b6004805462ffffff9290921663010000000265ffffff0000001990921691909117905550620001f99050565b620d89e719620000e281620001c8565b620d89e7196000818152602085905260409020600101805465ffffffffffff60801b1916600160981b62ffffff9485160262ffffff60801b191617600160801b9490931693909302919091179091556200013c81620001c8565b8260006200014e620d89e719620001c8565b60020b60020b81526020019081526020016000206001016010846000620d89e7196200017a90620001c8565b60020b81526020810191909152604001600020600101805462ffffff948516600160981b0262ffffff60981b1990911617905581549383166101009190910a90810292021990921617905550565b60008160020b627fffff198103620001f057634e487b7160e01b600052601160045260246000fd5b60000392915050565b60805160a0516120fb6200022d6000396000818161044101526107e801526000818161028c015261132401526120fb6000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c80638e76c332116100b2578063d6b83ede11610081578063f0de822811610066578063f0de822814610463578063f30dba9314610495578063fddf08e51461054c57600080fd5b8063d6b83ede14610401578063ef01df4f1461043c57600080fd5b80638e76c332146102d7578063a88a5c1614610315578063ca16ca7e14610384578063d576dfc0146103bb57600080fd5b8063556ed30e116101095780636f4a2cd0116100ee5780636f4a2cd0146102485780637f463bb8146102505780638a2ade581461028757600080fd5b8063556ed30e1461020f5780635e075b531461023d57600080fd5b80630bd6f2001461013b57806334d335901461017e57806346caf2ae146101ba57806351b42b0014610205575b600080fd5b6101656004803603604081101561015157600080fd5b508035600290810b9160200135900b610583565b6040805192835260208301919091528051918290030190f35b6101a66004803603604081101561019457600080fd5b50803560020b906020013515156107ce565b604080519115158252519081900360200190f35b6004546101e090660100000000000090046fffffffffffffffffffffffffffffffff1681565b604080516fffffffffffffffffffffffffffffffff9092168252519081900360200190f35b61020d610c17565b005b6004546101a6907d010000000000000000000000000000000000000000000000000000000000900460ff1681565b600754600854610165565b61020d610c69565b61020d6004803603604081101561026657600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610c7b565b6102ae7f000000000000000000000000000000000000000000000000000000000000000081565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b6004546102fe90760100000000000000000000000000000000000000000000900460020b81565b6040805160029290920b8252519081900360200190f35b6005546fffffffffffffffffffffffffffffffff808216917001000000000000000000000000000000009004165b60405180836fffffffffffffffffffffffffffffffff168152602001826fffffffffffffffffffffffffffffffff1681526020019250505060405180910390f35b61020d6004803603604081101561039a57600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610cdc565b6004546103e890790100000000000000000000000000000000000000000000000000900463ffffffff1681565b6040805163ffffffff9092168252519081900360200190f35b61020d6004803603608081101561041757600080fd5b508035600290810b916020810135820b916040820135600f0b9160600135900b610cf4565b6102ae7f000000000000000000000000000000000000000000000000000000000000000081565b6006546fffffffffffffffffffffffffffffffff80821691700100000000000000000000000000000000900416610343565b610510600480360360208110156104ab57600080fd5b50600060208190529035600290810b8252604090912080546001820154828401546003909301549193600f82900b937001000000000000000000000000000000008304820b9373010000000000000000000000000000000000000090930490910b9186565b60408051968752600f9590950b6020870152600293840b868601529190920b6060850152608084019190915260a0830152519081900360c00190f35b61020d6004803603604081101561056257600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610f0c565b600282810b600090815260208190526040812060010154909182917001000000000000000000000000000000008104820b73010000000000000000000000000000000000000090910490910b14806106205750600283810b6000908152602081905260409020600101547001000000000000000000000000000000008104820b73010000000000000000000000000000000000000090910490910b145b15610657576040517f0d6e094900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60045460075460085463ffffffff79010000000000000000000000000000000000000000000000000084048116420393760100000000000000000000000000000000000000000000900460020b9291908416156107af57600454660100000000000090046fffffffffffffffffffffffffffffffff1680156107ad5760055460065463ffffffff87166fffffffffffffffffffffffffffffffff8084168202811693700100000000000000000000000000000000908190048216909202811692818116929004168184111561072a578193505b80831115610736578092505b831561076f5761076a84700100000000000000000000000000000000876fffffffffffffffffffffffffffffffff16610f20565b870196505b82156107a8576107a383700100000000000000000000000000000000876fffffffffffffffffffffffffffffffff16610f20565b860195505b505050505b505b6107be60008989868686610fd8565b95509550505050505b9250929050565b60003373ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000161461083f576040517f545acb2400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6004546fffffffffffffffffffffffffffffffff6601000000000000820416907601000000000000000000000000000000000000000000008104600290810b9163ffffffff7901000000000000000000000000000000000000000000000000008204169160ff7d0100000000000000000000000000000000000000000000000000000000008304169180820b916301000000909104900b82156108eb5760009650505050505050610c11565b600285810b908a900b1380159061091e578260020b8a60020b12610919576001975050505050505050610c11565b61093c565b8160020b8a60020b121561093c576001975050505050505050610c11565b881515811515146109a0575050600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d0100000000000000000000000000000000000000000000000000000000001790555060009450610c119350505050565b6109bc85886fffffffffffffffffffffffffffffffff16611076565b6007546008548a15610a8d575b600288900b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2761814610a88578460020b8c60020b1215610b3a57600285810b600090815260208190526040812060038101805482850180548803905585039055600101547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff88019a50700100000000000000000000000000000000810490920b969550600f9190910b90610a80908b90839003611245565b9950506109c9565b610b3a565b6001610ab87ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b610ac2919061200c565b60020b8860020b14610b3a578360020b8c60020b12610b3a57600284810b600090815260208190526040902060038101805482840180548703905584039055600101549498508895507301000000000000000000000000000000000000008504900b93600f0b610b328a82611245565b995050610a8d565b50506004805462ffffff9384166301000000027fffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000858e16760100000000000000000000000000000000000000000000027fffffffffffffff000000ffffffffffffffffffffffffffffffffffffffffffff6fffffffffffffffffffffffffffffffff909c166601000000000000029b909b167fffffffffffffff00000000000000000000000000000000000000ffffffffffff90931692909217999099171693909216929092179590951790945550600193505050505b92915050565b610c1f61130c565b600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d010000000000000000000000000000000000000000000000000000000000179055565b610c7161130c565b610c7961137b565b565b610c8361130c565b610c8b61137b565b6fffffffffffffffffffffffffffffffff9182169116700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff000000000000000000000000000000001617600555565b610ce461130c565b610cf0600083836113c7565b5050565b610cfc61130c565b6004546fffffffffffffffffffffffffffffffff66010000000000008204169063ffffffff7901000000000000000000000000000000000000000000000000008204169060ff7d0100000000000000000000000000000000000000000000000000000000008204169063010000008104600290810b91900b82610dd557610d848682846114a7565b610dd557600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d010000000000000000000000000000000000000000000000000000000000179055600192505b50508015610de557505050610f06565b600480547fffffffffffffff000000ffffffffffffffffffffffffffffffffffffffffffff1676010000000000000000000000000000000000000000000062ffffff87160217905563ffffffff82164263ffffffff161115610e5d57610e5d82846fffffffffffffffffffffffffffffffff16611076565b84600f0b600014610f02576000610e7788868860006114cc565b90506000610e8888878960016114cc565b9050610e95868a8a6114a7565b15610edd57610ea48588611245565b600460066101000a8154816fffffffffffffffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff1602179055505b8180610ee65750805b15610eff57610eff898984848a60008d600f0b126114f0565b50505b5050505b50505050565b610f1461130c565b610cf0600183836113c7565b6000838302817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff85870982811083820303915050808411610f6057600080fd5b80600003610f7357508290049050610fd1565b8385870960008581038616958690049560026003880281188089028203028089028203028089028203028089028203028089028203028089029091030291819003819004600101858411909403939093029190930391909104170290505b9392505050565b600285810b60009081526020889052604080822087840b8084529183209293849391929088900b121561104e578860020b8760020b1261102957816002015486039350816003015485039250611038565b81600201549350816003015492505b6002810154600382015494039390920391611069565b81600201548160020154039350816003015481600301540392505b5050965096945050505050565b63ffffffff4283900316600081900361108e57505050565b81156111f4576005546006546fffffffffffffffffffffffffffffffff8083168402927001000000000000000000000000000000009081900482168502928083169291900416818411156110f257816fffffffffffffffffffffffffffffffff1693505b806fffffffffffffffffffffffffffffffff1683111561112257806fffffffffffffffffffffffffffffffff1692505b838317156111ef576fffffffffffffffffffffffffffffffff91821684900391168290038315611172576111688470010000000000000000000000000000000088610f20565b6007805490910190555b821561119e576111948370010000000000000000000000000000000088610f20565b6008805490910190555b6fffffffffffffffffffffffffffffffff808316908216700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff0000000000000000000000000000000016176006555b505050505b5050600480547fffffff00000000ffffffffffffffffffffffffffffffffffffffffffffffffff167901000000000000000000000000000000000000000000000000004263ffffffff160217905550565b60008082600f0b12156112a957508082016fffffffffffffffffffffffffffffffff808416908216106112a4576040517f1301f74800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610c11565b826fffffffffffffffffffffffffffffffff168284019150816fffffffffffffffffffffffffffffffff161015610c11576040517f997402f200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001614610c79576040517fae74b17800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600454610c7990790100000000000000000000000000000000000000000000000000810463ffffffff1690660100000000000090046fffffffffffffffffffffffffffffffff16611076565b6113cf61137b565b6fffffffffffffffffffffffffffffffff82821716156114a2576006546fffffffffffffffffffffffffffffffff80821691700100000000000000000000000000000000900416841561143957611426848361204d565b9150611432838261204d565b9050611452565b611443848361207d565b915061144f838261207d565b90505b6fffffffffffffffffffffffffffffffff9182169116700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff0000000000000000000000000000000016176006555b505050565b60008260020b8460020b121580156114c457508160020b8460020b125b949350505050565b6007546008546000916114e79183918891889188918861161f565b95945050505050565b600454600154600282810b9263010000009004900b9063ffffffff16828282891561152b576115238c898386868c611753565b919450925090505b88156115475761153f8b898386868c611753565b919450925090505b8260020b8660020b14158061156257508160020b8560020b14155b8061157957508363ffffffff168163ffffffff1614155b1561161157600180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000001663ffffffff8316179055600480547fffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000016630100000062ffffff858116919091027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000016919091179085161790555b505050505050505050505050565b600286900b600090815260208890526040812080548261163f8289611245565b6fffffffffffffffffffffffffffffffff1690506d09745258e83de0d0f4e400fce79981111561169b576040517f25b8364a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001830154600f0b856116bf5788600f0b81600f0b6116ba91906120a6565b6116d1565b88600f0b81600f0b6116d191906120ce565b6001850180547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff9290921691909117905581845581159450600083900361174457841594508960020b8b60020b136117445760038401879055600284018890555b50505050979650505050505050565b6000806000831561179c5760008061176b818c611854565b915091508a60020b8860020b0361178457819750611795565b8a60020b8760020b03611795578096505b5050611832565b6000808a60020b8860020b1280156117b957508a60020b8760020b135b156117e257508690508560028a810b908c900b13156117da578a9650611822565b8a9750611822565b6117f0600360028b8e611aca565b600281810b6000908152602081905260409020600101547001000000000000000000000000000000009004900b925090505b61182f60008c8484611ba7565b50505b6000611842600360028a8d611d53565b969a9599509597509395505050505050565b600281810b60008181526020859052604081206001810180548383557fffffffffffffffffffff0000000000000000000000000000000000000000000081169091558185018390556003909101919091557001000000000000000000000000000000008104830b92730100000000000000000000000000000000000000909104900b907ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618148061193157506119287ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b60020b8360020b145b156119d657600283900b6000908152602085905260409020600101805462ffffff808516700100000000000000000000000000000000027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff91851673010000000000000000000000000000000000000002919091167fffffffffffffffffffff000000000000ffffffffffffffffffffffffffffffff909216919091171790556107c7565b8060020b8260020b03611a15576040517f0d6e094900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600282810b6000908152602086905260408082206001908101805462ffffff808816730100000000000000000000000000000000000000027fffffffffffffffffffff000000ffffffffffffffffffffffffffffffffffffff909216919091179091559385900b83529120018054918416700100000000000000000000000000000000027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff9092169190911790559250929050565b600190810190600090600883811d610d8a01901c90829061ffff83161b851663ffffffff1615611b2d57611afe8785611deb565b90945090925090508015611b135750506114c4565b611b2486610d8b840160010b611deb565b90945090925090505b80611b7057611b4b8563ffffffff168360010193508360010b611e1c565b909350905080611b635750620d89e891506114c49050565b611b6d8684611f73565b92505b611b9c877ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2768501611f73565b979650505050505050565b600283900b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff276181480611c065750611bfd7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b60020b8360020b145b610f06578260020b8260020b128015611c2457508260020b8160020b135b611c5a576040517fe45ac17d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600283810b60009081526020959095526040808620600190810180547fffffffffffffffffffff000000000000ffffffffffffffffffffffffffffffff1673010000000000000000000000000000000000000062ffffff87811682027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff908116939093177001000000000000000000000000000000008a831681029190911790945597860b8a52848a20840180547fffffffffffffffffffff000000ffffffffffffffffffffffffffffffffffffff1698909916908102979097179097559390920b865290942090930180549092169202919091179055565b81600080611d908785600881901d600181810b60009081526020949094526040909320805460ff9093169390931b80831890935591811490151891565b915091508115611de157610d8a01600181810b60081d80820b6000908152602089905260409020805460ff9094169290921b808418909255821591909214818118935014611de1576001811b831892505b5050949350505050565b600881901d600181900b6000908152602084905260408120548190611e109085611e1c565b93969095509293505050565b60008060ff831684811c808303611e38578460ff179350611f6a565b7f555555555555555555555555555555555555555555555555555555555555555560008290038216908116156fffffffffffffffffffffffffffffffff82161560071b1777ffffffffffffffff0000000000000000ffffffffffffffff82161560061b177bffffffff00000000ffffffff00000000ffffffff00000000ffffffff82161560051b177dffff0000ffff0000ffff0000ffff0000ffff0000ffff0000ffff0000ffff82161560041b177eff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff82161560031b177f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f82161560021b177f33333333333333333333333333333333333333333333333333333333333333339091161560011b1760ff1685019350600192505b50509250929050565b600181900b600090815260208390526040902054600882901b90611f979082611e1c565b509392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008160020b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff800000810361200357612003611f9f565b60000392915050565b600282810b9082900b037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000008112627fffff82131715610c1157610c11611f9f565b6fffffffffffffffffffffffffffffffff81811683821601908082111561207657612076611f9f565b5092915050565b6fffffffffffffffffffffffffffffffff82811682821603908082111561207657612076611f9f565b80820182811260008312801582168215821617156120c6576120c6611f9f565b505092915050565b818103600083128015838313168383128216171561207657612076611f9f56fea164736f6c6343000814000aa164736f6c6343000814000a',
    deployedBytecode:
        '0x60806040523480156200001157600080fd5b5060043610620001ad5760003560e01c80638433524111620000f5578063dd56e5d81162000097578063f2256319116200006e578063f225631914620005d1578063f26ebf7a14620005f7578063f6de3cae146200060e57600080fd5b8063dd56e5d8146200056b578063df42efda146200058c578063e70b9e2714620005a357600080fd5b8063b44a272211620000cc578063b44a272214620004f3578063b5bae00a146200051b578063b8883c50146200054357600080fd5b80638433524114620004ae578063890cdcb314620004c557806396da9bd514620004dc57600080fd5b806336808b19116200015f5780635739f0b911620001365780635739f0b9146200037657806360777795146200038d57806382bd79ea14620004a457600080fd5b806336808b1914620002fa5780633c6d07151462000311578063547b6da9146200033957600080fd5b806327e6a99a116200019457806327e6a99a14620002095780632912bf1014620002ca5780632f2d783d14620002e357600080fd5b8063046ec16614620001b25780630a53075414620001e3575b600080fd5b620001c9620001c33660046200343a565b62000625565b604080519283526020830191909152015b60405180910390f35b620001fa620001f436600462003480565b620007dc565b604051908152602001620001da565b620002886200021a366004620034d8565b6002602081815260009384526040808520909152918352912080546001820154918301546fffffffffffffffffffffffffffffffff8216937001000000000000000000000000000000008304810b93730100000000000000000000000000000000000000909304900b919085565b604080516fffffffffffffffffffffffffffffffff9096168652600294850b60208701529290930b918401919091526060830152608082015260a001620001da565b620002e1620002db366004620034fb565b620007ff565b005b620001fa620002f43660046200351a565b62000ad2565b620002e16200030b3660046200343a565b62000aec565b620001fa7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39581565b620003506200034a3660046200357f565b62000c94565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001620001da565b620002e16200038736600462003669565b62001259565b620004406200039e36600462003697565b60016020819052600091825260409091208054918101546002909101546fffffffffffffffffffffffffffffffff808416937001000000000000000000000000000000009004169173ffffffffffffffffffffffffffffffffffffffff8082169274010000000000000000000000000000000000000000830462ffffff169277010000000000000000000000000000000000000000000000900460ff16911686565b604080516fffffffffffffffffffffffffffffffff978816815296909516602087015273ffffffffffffffffffffffffffffffffffffffff9384169486019490945262ffffff9091166060850152151560808401521660a082015260c001620001da565b620001fa60035481565b620002e1620004bf366004620036b1565b62001455565b620002e1620004d636600462003706565b62001526565b620001c9620004ed36600462003669565b620015f6565b620003507f000000000000000000000000000000000000000000000000000000000000000081565b620005326200052c36600462003697565b62001654565b6040519015158152602001620001da565b620001fa7fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221981565b600054620003509073ffffffffffffffffffffffffffffffffffffffff1681565b620002e16200059d36600462003726565b62001673565b620001fa620005b436600462003746565b600460209081526000928352604080842090915290825290205481565b600054620005329074010000000000000000000000000000000000000000900460ff1681565b620002e162000608366004620036b1565b62001734565b620002e16200061f366004620036b1565b620017e0565b6000806200063262001b7c565b600080620006408762001ba3565b91509150600062000652878462001c7d565b600183015490915073ffffffffffffffffffffffffffffffffffffffff166200067b8162001d6c565b6000806200068a838562001dd1565b809450819550829a50839b50505050506000600260008c8152602001908152602001600020600088815260200190815260200160002090508281600101819055508181600201819055506000600460008c73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050896000146200074d578c5173ffffffffffffffffffffffffffffffffffffffff16600090815260208290526040902080548b0190555b881562000784576020808e015173ffffffffffffffffffffffffffffffffffffffff166000908152908290526040902080548a0190555b604080518d8152602081018a90529081018b9052606081018a90527f15b2e0f32b50efdbbdee9ec7884ed3c61e6209b1b395e5762011a6734b86f7b59060800160405180910390a15050505050505050935093915050565b6000620007e862001b7c565b620007f68585858562001e74565b95945050505050565b6200082a7fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b600080620008388362001ba3565b6001810154919350915077010000000000000000000000000000000000000000000000900460ff161562000898576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60018101805460028301547fffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffffffff82167701000000000000000000000000000000000000000000000017909255604080517f51b42b00000000000000000000000000000000000000000000000000000000008152905173ffffffffffffffffffffffffffffffffffffffff928316939092169183916351b42b0091600480830192600092919082900301818387803b1580156200095257600080fd5b505af115801562000967573d6000803e3d6000fd5b505050506000808373ffffffffffffffffffffffffffffffffffffffff1663a88a5c166040518163ffffffff1660e01b81526004016040805180830381865afa158015620009b9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620009df919062003791565b915091508082176fffffffffffffffffffffffffffffffff1660001462000a0f5762000a0f84600080896200209e565b6000546040517f2bd34c4800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8681166004830152858116602483015290911690632bd34c4890604401600060405180830381600087803b15801562000a8557600080fd5b505af115801562000a9a573d6000803e3d6000fd5b50506040518892507f907b91fb061b1c46367da11a5a0e8b2c0bd5fecd22eb92967e626cffa5ef63869150600090a250505050505050565b600062000ae28433858562001e74565b90505b9392505050565b62000af662001b7c565b600062000b688460408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b9050600062000b78848362001c7d565b9050600080600060149054906101000a900460ff1662000bd25762000bcc8388868862000bbb88600001516fffffffffffffffffffffffffffffffff1662002195565b62000bc690620037f4565b620021ac565b90925090505b6000868152600260208181526040808420888552825280842080547fffffffffffffffffffff000000000000000000000000000000000000000000001681556001810185905590920192909255885189830151825173ffffffffffffffffffffffffffffffffffffffff918216815289821694810194909452918301859052606083018490521690859088907f7f2557bb15dcf63e3d029ef1dcb4333563fcd78edf263b8fe42ed3adb925ff849060800160405180910390a450505050505050565b600062000cc17fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b6000846040015173ffffffffffffffffffffffffffffffffffffffff1663ef01df4f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000d13573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000d39919062003842565b90508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614158062000d8b575073ffffffffffffffffffffffffffffffffffffffff8116155b1562000dc3576040517f093d6f1700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16631d4632ac6040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000e27573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000e4d919062003842565b73ffffffffffffffffffffffffffffffffffffffff161462000e9b576040517f47146bcc00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b308160405162000eab90620032fd565b73ffffffffffffffffffffffffffffffffffffffff928316815291166020820152604001604051809103906000f08015801562000eec573d6000803e3d6000fd5b506000546040517fd68516bc00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8084166004830152848116602483015292945091169063d68516bc90604401600060405180830381600087803b15801562000f6557600080fd5b505af115801562000f7a573d6000803e3d6000fd5b50506003805492509050600062000f918362003862565b90915550606086015260006200100c8660408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b60008181526001602090815260409091208751918801519293509162001035918991846200234a565b6fffffffffffffffffffffffffffffffff9081166020890152168087526000036200108c576040517f36ab0f6a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6080860151621b13d062ffffff9091161315620010d5576040517f1db9891100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181018054608088015162ffffff811674010000000000000000000000000000000000000000027fffffffffffffffffff000000000000000000000000000000000000000000000090921673ffffffffffffffffffffffffffffffffffffffff80891691909117929092179092556002830180548683167fffffffffffffffffffffffff0000000000000000000000000000000000000000919091161790556040808a01516020808c01518c5160608e01518d51938e01519551948716979287169691909116947fcef9468c62cd8a6eca3a887fc30674c037943e423de07ab3a122bdf2f73c77e1946200121b948d9490929173ffffffffffffffffffffffffffffffffffffffff95909516855260208501939093526fffffffffffffffffffffffffffffffff918216604085015216606083015262ffffff16608082015260a00190565b60405180910390a4620012398487600001518860200151856200251c565b6200124f8487604001518860600151856200209e565b5050509392505050565b6200126362001b7c565b60005474010000000000000000000000000000000000000000900460ff1615620012b9576040517f05bfeb5900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000806000806000620012cd87876200260a565b93985091965094509250905080600080620012ea83888862002893565b915091506040518060a00160405280866fffffffffffffffffffffffffffffffff1681526020018860020b81526020018760020b815260200183815260200182815250600260008b815260200190815260200160002060008a815260200190815260200160002060008201518160000160006101000a8154816fffffffffffffffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff16021790555060208201518160000160106101000a81548162ffffff021916908360020b62ffffff16021790555060408201518160000160136101000a81548162ffffff021916908360020b62ffffff160217905550606082015181600101556080820151816002015590505087897f19bc21617a8d86ff19202ac9541480a99b9ae5fbd573a23f14f479af784392c4876040516200144191906fffffffffffffffffffffffffffffffff91909116815260200190565b60405180910390a350505050505050505050565b620014807fa777c10270ee0b99d2c737c09ff865ed48064b252418bbd31d39c8b88ea1221962001fd9565b6000806200148e8562001ba3565b6001810154919350915073ffffffffffffffffffffffffffffffffffffffff166fffffffffffffffffffffffffffffffff8585171615801590620014d85750620014d88262002940565b1562001510576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6200151e818686866200209e565b505050505050565b620015517f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b801515600060149054906101000a900460ff161515036200157157600080fd5b6000805482151574010000000000000000000000000000000000000000027fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff9091161790556040517fee20b3d336390a4b077dbc7d702bf6e35a954bc96106f37b9e5ef08a1d0ce05990620015eb90831515815260200190565b60405180910390a150565b600080600080620016078662001ba3565b91509150600062001619868462001c7d565b600183015490915073ffffffffffffffffffffffffffffffffffffffff1662001643818362001dd1565b50919a909950975050505050505050565b60008181526001602052604081206200166d9062002940565b92915050565b6200169e7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b60005473ffffffffffffffffffffffffffffffffffffffff90811690821603620016c757600080fd5b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8316908117825560405190917f29f9e1ebeee07596f3165f3e42cb9d4d8d22b0481e968d6c74be3dd037c15d9b91a250565b600080620017428562001ba3565b91509150620017518162002940565b1562001789576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181015473ffffffffffffffffffffffffffffffffffffffff16620017b2868686856200234a565b90955093506fffffffffffffffffffffffffffffffff85851716156200151e576200151e818686866200251c565b6200180b7f681ab0361ab5f3ae8c1d864335ef2b9a8c12a6a67e1ed0f4083d00a4b8a9a39562001fd9565b600080620018198562001ba3565b6001810154919350915073ffffffffffffffffffffffffffffffffffffffff16620018448162001d6c565b6000808273ffffffffffffffffffffffffffffffffffffffff1663f0de82286040518163ffffffff1660e01b81526004016040805180830381865afa15801562001892573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620018b8919062003791565b91509150816fffffffffffffffffffffffffffffffff16876fffffffffffffffffffffffffffffffff161115620018ed578196505b83546fffffffffffffffffffffffffffffffff90811690881610620019315783546200192e906001906fffffffffffffffffffffffffffffffff166200389d565b96505b8354620019529088906fffffffffffffffffffffffffffffffff166200389d565b84547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff91821617855581811690871611156200199e578095505b8354620019d390879070010000000000000000000000000000000090046fffffffffffffffffffffffffffffffff166200389d565b84546fffffffffffffffffffffffffffffffff9182167001000000000000000000000000000000000291161784556040517fca16ca7e00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84169063ca16ca7e9062001a74908a908a906004016fffffffffffffffffffffffffffffffff92831681529116602082015260400190565b600060405180830381600087803b15801562001a8f57600080fd5b505af115801562001aa4573d6000803e3d6000fd5b505050506fffffffffffffffffffffffffffffffff87161562001ae257875162001ae290336fffffffffffffffffffffffffffffffff8a16620029f6565b6fffffffffffffffffffffffffffffffff86161562001b1e5762001b1e886020015133886fffffffffffffffffffffffffffffffff16620029f6565b604080516fffffffffffffffffffffffffffffffff808a168252881660208201529081018690527f808ecc37f6d601dde1e43c133bee66af0ff9409b53aca0eb0d4f6c65fb8956e89060600160405180910390a15050505050505050565b60005473ffffffffffffffffffffffffffffffffffffffff16331462001ba157600080fd5b565b60008062001c168360408051825173ffffffffffffffffffffffffffffffffffffffff90811660208084019190915284015181168284015291830151909116606080830191909152820151608082015260009060a001604051602081830303815290604052805190602001209050919050565b6000818152600160205260408120805492945092506fffffffffffffffffffffffffffffffff909116900362001c78576040517fe4c8229200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b915091565b6040805160a0810182526000808252602082018190529181018290526060810182905260808101919091525060008281526002602081815260408084208585528252808420815160a08101835281546fffffffffffffffffffffffffffffffff81168083527001000000000000000000000000000000008204870b958301959095527301000000000000000000000000000000000000009004850b92810192909252600181015460608301529092015460808301529091036200166d576040517f7aa92c6600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16636f4a2cd06040518163ffffffff1660e01b8152600401600060405180830381600087803b15801562001db557600080fd5b505af115801562001dca573d6000803e3d6000fd5b5050505050565b60008060008062001dec868660200151876040015162002893565b6060870151875192945090925062001e2c91908403906fffffffffffffffffffffffffffffffff1670010000000000000000000000000000000062002b6d565b62001e668660800151830387600001516fffffffffffffffffffffffffffffffff1670010000000000000000000000000000000062002b6d565b909790965091945092509050565b600073ffffffffffffffffffffffffffffffffffffffff831662001ec4576040517fabd1763600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5073ffffffffffffffffffffffffffffffffffffffff80841660009081526004602090815260408083209388168352908390529020549082158062001f0857508183115b1562001f12578192505b821562001fd05773ffffffffffffffffffffffffffffffffffffffff86166000908152602082905260409020838303905562001f50868585620029f6565b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167fe6ac6a784fb43c9f6329d2f5c82f88a26a93bad4281f7780725af5f071f0aafa8660405162001fc791815260200190565b60405180910390a45b50949350505050565b6040517fe8ae2b69000000000000000000000000000000000000000000000000000000008152600481018290523360248201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e8ae2b6990604401602060405180830381865afa1580156200206b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620020919190620038d0565b6200209b57600080fd5b50565b6040517f7f463bb80000000000000000000000000000000000000000000000000000000081526fffffffffffffffffffffffffffffffff80851660048301528316602482015273ffffffffffffffffffffffffffffffffffffffff851690637f463bb890604401600060405180830381600087803b1580156200212057600080fd5b505af115801562002135573d6000803e3d6000fd5b5050604080516fffffffffffffffffffffffffffffffff8088168252861660208201529081018490527f1864e4cc903d98e44820faebd48409c410a2ad20adb3173984ba41ae2828805e925060600190505b60405180910390a150505050565b80600f81900b8114620021a757600080fd5b919050565b600083815260016020819052604082209081015482919073ffffffffffffffffffffffffffffffffffffffff1682620021e58362002940565b620021ff57620021f9896040015162002c27565b62002271565b8173ffffffffffffffffffffffffffffffffffffffff16638e76c3326040518163ffffffff1660e01b8152600401602060405180830381865afa1580156200224b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002271919062003903565b90506200227e8262001d6c565b6200228a828b62001dd1565b9050508095508196505050620022ac828b602001518c60400151898562002ce6565b73ffffffffffffffffffffffffffffffffffffffff8716600090815260046020526040902085156200230557895173ffffffffffffffffffffffffffffffffffffffff1660009081526020829052604090208054870190555b84156200233c576020808b015173ffffffffffffffffffffffffffffffffffffffff16600090815290829052604090208054860190555b505050509550959350505050565b6000805481907501000000000000000000000000000000000000000000900460ff16620023a3576040517f2446d79f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600080547fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff1690556fffffffffffffffffffffffffffffffff851615620023f5578551620023f2908662002d8c565b91505b6fffffffffffffffffffffffffffffffff84161562002421576200241e86602001518562002d8c565b90505b600080547fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff16750100000000000000000000000000000000000000000017905582546fffffffffffffffffffffffffffffffff8082169170010000000000000000000000000000000090041662002499848362003921565b85547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff91909116178555620024e1838262003921565b85546fffffffffffffffffffffffffffffffff9182167001000000000000000000000000000000000291161790945550909590945092505050565b6040517ffddf08e50000000000000000000000000000000000000000000000000000000081526fffffffffffffffffffffffffffffffff80851660048301528316602482015273ffffffffffffffffffffffffffffffffffffffff85169063fddf08e590604401600060405180830381600087803b1580156200259e57600080fd5b505af1158015620025b3573d6000803e3d6000fd5b5050604080516fffffffffffffffffffffffffffffffff8088168252861660208201529081018490527f8b0312d8047895ce795779b66b705ccd39b1ece7c162f642c72d76a785d1b68a9250606001905062002187565b6000806000806000806200261e8862001ba3565b600089815260026020908152604080832085845290915290205491975091506fffffffffffffffffffffffffffffffff161562002687576040517ff352b37500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600181015473ffffffffffffffffffffffffffffffffffffffff8116925074010000000000000000000000000000000000000000900462ffffff16620026cd8262002940565b1562002705576040517f260e553a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000620027547f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000008b62002e26565b60408e0151929a50909850965090915073ffffffffffffffffffffffffffffffffffffffff808316911614620027b6576040517fdce2809300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b846fffffffffffffffffffffffffffffffff1660000362002803576040517f4eed436000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8162ffffff168760020b8760020b0312156200284b576040517feab0585000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000620028588262002c27565b9050620028858589896200287e8a6fffffffffffffffffffffffffffffffff1662002195565b8562002ce6565b505050509295509295909350565b6040517f0bd6f200000000000000000000000000000000000000000000000000000000008152600283810b600483015282900b6024820152600090819073ffffffffffffffffffffffffffffffffffffffff861690630bd6f200906044016040805180830381865afa1580156200290e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200293491906200394d565b91509150935093915050565b600181015460009073ffffffffffffffffffffffffffffffffffffffff81169077010000000000000000000000000000000000000000000000900460ff168062000ae5578173ffffffffffffffffffffffffffffffffffffffff1663556ed30e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015620029d0573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000ae29190620038d0565b6040805173ffffffffffffffffffffffffffffffffffffffff8481166024830152604480830185905283518084039091018152606490920183526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb00000000000000000000000000000000000000000000000000000000179052915160009283929087169162002a8f919062003972565b6000604051808303816000865af19150503d806000811462002ace576040519150601f19603f3d011682016040523d82523d6000602084013e62002ad3565b606091505b509150915081801562002b0157508051158062002b0157508080602001905181019062002b019190620038d0565b62001dca576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f535400000000000000000000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6000838302817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8587098281108382030391505080841162002bae57600080fd5b8060000362002bc35750829004905062000ae5565b8385870960008581038616958690049560026003880281188089028203028089028203028089028203028089028203028089028203028089029091030291819003819004600101858411909403939093029190930391909104170290509392505050565b6000808273ffffffffffffffffffffffffffffffffffffffff1663e76c01e46040518163ffffffff1660e01b815260040160c060405180830381865afa15801562002c76573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002c9c9190620039b6565b93965092945084935062002ce092505050576040517f9ded0f5700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50919050565b6040517fd6b83ede000000000000000000000000000000000000000000000000000000008152600285810b600483015284810b6024830152600f84900b604483015282900b606482015273ffffffffffffffffffffffffffffffffffffffff86169063d6b83ede90608401600060405180830381600087803b15801562002d6c57600080fd5b505af115801562002d81573d6000803e3d6000fd5b505050505050505050565b60008062002d9a8462002f0c565b905062002dbc843330866fffffffffffffffffffffffffffffffff1662002fa0565b600062002dc98562002f0c565b905081811162002dd857600080fd5b8181036fffffffffffffffffffffffffffffffff811115620007f6576040517f3ba11f1e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000806000806000808773ffffffffffffffffffffffffffffffffffffffff166399fbab88886040518263ffffffff1660e01b815260040162002e6b91815260200190565b61016060405180830381865afa15801562002e8a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062002eb0919062003a44565b50506040805180820190915273ffffffffffffffffffffffffffffffffffffffff808916825287166020820152949d50929b5090995093975091955062002eff94508d935091506200311b9050565b9550505093509350935093565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009073ffffffffffffffffffffffffffffffffffffffff8316906370a0823190602401602060405180830381865afa15801562002f7a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200166d919062003b2c565b6040805173ffffffffffffffffffffffffffffffffffffffff85811660248301528481166044830152606480830185905283518084039091018152608490920183526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f23b872dd00000000000000000000000000000000000000000000000000000000179052915160009283929088169162003041919062003972565b6000604051808303816000865af19150503d806000811462003080576040519150601f19603f3d011682016040523d82523d6000602084013e62003085565b606091505b5091509150818015620030b3575080511580620030b3575080806020019051810190620030b39190620038d0565b6200151e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f5354460000000000000000000000000000000000000000000000000000000000604482015260640162002b64565b6000816020015173ffffffffffffffffffffffffffffffffffffffff16826000015173ffffffffffffffffffffffffffffffffffffffff1610620031bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f496e76616c6964206f72646572206f6620746f6b656e73000000000000000000604482015260640162002b64565b8282600001518360200151604051602001620031fb92919073ffffffffffffffffffffffffffffffffffffffff92831681529116602082015260400190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290528051602091820120620032c0939290917ff96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d91017fff00000000000000000000000000000000000000000000000000000000000000815260609390931b7fffffffffffffffffffffffffffffffffffffffff0000000000000000000000001660018401526015830191909152603582015260550190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815291905280516020909101209392505050565b6123288062003b4783390190565b60405160a0810167ffffffffffffffff8111828210171562003356577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405290565b73ffffffffffffffffffffffffffffffffffffffff811681146200209b57600080fd5b6000608082840312156200339257600080fd5b6040516080810181811067ffffffffffffffff82111715620033dd577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040529050808235620033f0816200335c565b8152602083013562003402816200335c565b6020820152604083013562003417816200335c565b6040820152606092830135920191909152919050565b8035620021a7816200335c565b600080600060c084860312156200345057600080fd5b6200345c85856200337f565b92506080840135915060a084013562003475816200335c565b809150509250925092565b600080600080608085870312156200349757600080fd5b8435620034a4816200335c565b93506020850135620034b6816200335c565b92506040850135620034c8816200335c565b9396929550929360600135925050565b60008060408385031215620034ec57600080fd5b50508035926020909101359150565b6000608082840312156200350e57600080fd5b62000ae583836200337f565b6000806000606084860312156200353057600080fd5b83356200353d816200335c565b925060208401356200354f816200335c565b929592945050506040919091013590565b6fffffffffffffffffffffffffffffffff811681146200209b57600080fd5b60008060008385036101408112156200359757600080fd5b620035a386866200337f565b935060a07fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8082011215620035d657600080fd5b50620035e16200330b565b6080850135620035f18162003560565b815260a0850135620036038162003560565b602082015260c0850135620036188162003560565b604082015260e08501356200362d8162003560565b606082015261010085013562ffffff811681146200364a57600080fd5b608082015291506200366061012085016200342d565b90509250925092565b60008060a083850312156200367d57600080fd5b6200368984846200337f565b946080939093013593505050565b600060208284031215620036aa57600080fd5b5035919050565b600080600060c08486031215620036c757600080fd5b620036d385856200337f565b92506080840135620036e58162003560565b915060a0840135620034758162003560565b80151581146200209b57600080fd5b6000602082840312156200371957600080fd5b813562000ae581620036f7565b6000602082840312156200373957600080fd5b813562000ae5816200335c565b600080604083850312156200375a57600080fd5b823562003767816200335c565b9150602083013562003779816200335c565b809150509250929050565b8051620021a78162003560565b60008060408385031215620037a557600080fd5b8251620037b28162003560565b6020840151909250620037798162003560565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600081600f0b7fffffffffffffffffffffffffffffffff8000000000000000000000000000000081036200382c576200382c620037c5565b60000392915050565b8051620021a7816200335c565b6000602082840312156200385557600080fd5b815162000ae5816200335c565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203620038965762003896620037c5565b5060010190565b6fffffffffffffffffffffffffffffffff828116828216039080821115620038c957620038c9620037c5565b5092915050565b600060208284031215620038e357600080fd5b815162000ae581620036f7565b8051600281900b8114620021a757600080fd5b6000602082840312156200391657600080fd5b62000ae582620038f0565b6fffffffffffffffffffffffffffffffff818116838216019080821115620038c957620038c9620037c5565b600080604083850312156200396157600080fd5b505080516020909101519092909150565b6000825160005b8181101562003995576020818601810151858301520162003979565b506000920191825250919050565b805161ffff81168114620021a757600080fd5b60008060008060008060c08789031215620039d057600080fd5b8651620039dd816200335c565b9550620039ed60208801620038f0565b9450620039fd60408801620039a3565b9350606087015160ff8116811462003a1457600080fd5b925062003a2460808801620039a3565b915060a087015162003a3681620036f7565b809150509295509295509295565b60008060008060008060008060008060006101608c8e03121562003a6757600080fd5b8b516affffffffffffffffffffff8116811462003a8357600080fd5b60208d0151909b5062003a96816200335c565b60408d0151909a5062003aa9816200335c565b985062003ab960608d0162003835565b975062003ac960808d01620038f0565b965062003ad960a08d01620038f0565b955062003ae960c08d0162003784565b945060e08c015193506101008c0151925062003b096101208d0162003784565b915062003b1a6101408d0162003784565b90509295989b509295989b9093969950565b60006020828403121562003b3f57600080fd5b505191905056fe60c0604052600160075560016008553480156200001b57600080fd5b506040516200232838038062002328833981810160405260408110156200004157600080fd5b508051602090910151620000566000620000d2565b6001600160a01b03828116608052811660a0526004805462ffffff63ffffffff60c81b011916600160c81b4263ffffffff160262ffffff19161762f27618179055620000a6620d89e719620001c8565b6004805462ffffff9290921663010000000265ffffff0000001990921691909117905550620001f99050565b620d89e719620000e281620001c8565b620d89e7196000818152602085905260409020600101805465ffffffffffff60801b1916600160981b62ffffff9485160262ffffff60801b191617600160801b9490931693909302919091179091556200013c81620001c8565b8260006200014e620d89e719620001c8565b60020b60020b81526020019081526020016000206001016010846000620d89e7196200017a90620001c8565b60020b81526020810191909152604001600020600101805462ffffff948516600160981b0262ffffff60981b1990911617905581549383166101009190910a90810292021990921617905550565b60008160020b627fffff198103620001f057634e487b7160e01b600052601160045260246000fd5b60000392915050565b60805160a0516120fb6200022d6000396000818161044101526107e801526000818161028c015261132401526120fb6000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c80638e76c332116100b2578063d6b83ede11610081578063f0de822811610066578063f0de822814610463578063f30dba9314610495578063fddf08e51461054c57600080fd5b8063d6b83ede14610401578063ef01df4f1461043c57600080fd5b80638e76c332146102d7578063a88a5c1614610315578063ca16ca7e14610384578063d576dfc0146103bb57600080fd5b8063556ed30e116101095780636f4a2cd0116100ee5780636f4a2cd0146102485780637f463bb8146102505780638a2ade581461028757600080fd5b8063556ed30e1461020f5780635e075b531461023d57600080fd5b80630bd6f2001461013b57806334d335901461017e57806346caf2ae146101ba57806351b42b0014610205575b600080fd5b6101656004803603604081101561015157600080fd5b508035600290810b9160200135900b610583565b6040805192835260208301919091528051918290030190f35b6101a66004803603604081101561019457600080fd5b50803560020b906020013515156107ce565b604080519115158252519081900360200190f35b6004546101e090660100000000000090046fffffffffffffffffffffffffffffffff1681565b604080516fffffffffffffffffffffffffffffffff9092168252519081900360200190f35b61020d610c17565b005b6004546101a6907d010000000000000000000000000000000000000000000000000000000000900460ff1681565b600754600854610165565b61020d610c69565b61020d6004803603604081101561026657600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610c7b565b6102ae7f000000000000000000000000000000000000000000000000000000000000000081565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b6004546102fe90760100000000000000000000000000000000000000000000900460020b81565b6040805160029290920b8252519081900360200190f35b6005546fffffffffffffffffffffffffffffffff808216917001000000000000000000000000000000009004165b60405180836fffffffffffffffffffffffffffffffff168152602001826fffffffffffffffffffffffffffffffff1681526020019250505060405180910390f35b61020d6004803603604081101561039a57600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610cdc565b6004546103e890790100000000000000000000000000000000000000000000000000900463ffffffff1681565b6040805163ffffffff9092168252519081900360200190f35b61020d6004803603608081101561041757600080fd5b508035600290810b916020810135820b916040820135600f0b9160600135900b610cf4565b6102ae7f000000000000000000000000000000000000000000000000000000000000000081565b6006546fffffffffffffffffffffffffffffffff80821691700100000000000000000000000000000000900416610343565b610510600480360360208110156104ab57600080fd5b50600060208190529035600290810b8252604090912080546001820154828401546003909301549193600f82900b937001000000000000000000000000000000008304820b9373010000000000000000000000000000000000000090930490910b9186565b60408051968752600f9590950b6020870152600293840b868601529190920b6060850152608084019190915260a0830152519081900360c00190f35b61020d6004803603604081101561056257600080fd5b506fffffffffffffffffffffffffffffffff81358116916020013516610f0c565b600282810b600090815260208190526040812060010154909182917001000000000000000000000000000000008104820b73010000000000000000000000000000000000000090910490910b14806106205750600283810b6000908152602081905260409020600101547001000000000000000000000000000000008104820b73010000000000000000000000000000000000000090910490910b145b15610657576040517f0d6e094900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60045460075460085463ffffffff79010000000000000000000000000000000000000000000000000084048116420393760100000000000000000000000000000000000000000000900460020b9291908416156107af57600454660100000000000090046fffffffffffffffffffffffffffffffff1680156107ad5760055460065463ffffffff87166fffffffffffffffffffffffffffffffff8084168202811693700100000000000000000000000000000000908190048216909202811692818116929004168184111561072a578193505b80831115610736578092505b831561076f5761076a84700100000000000000000000000000000000876fffffffffffffffffffffffffffffffff16610f20565b870196505b82156107a8576107a383700100000000000000000000000000000000876fffffffffffffffffffffffffffffffff16610f20565b860195505b505050505b505b6107be60008989868686610fd8565b95509550505050505b9250929050565b60003373ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000161461083f576040517f545acb2400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6004546fffffffffffffffffffffffffffffffff6601000000000000820416907601000000000000000000000000000000000000000000008104600290810b9163ffffffff7901000000000000000000000000000000000000000000000000008204169160ff7d0100000000000000000000000000000000000000000000000000000000008304169180820b916301000000909104900b82156108eb5760009650505050505050610c11565b600285810b908a900b1380159061091e578260020b8a60020b12610919576001975050505050505050610c11565b61093c565b8160020b8a60020b121561093c576001975050505050505050610c11565b881515811515146109a0575050600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d0100000000000000000000000000000000000000000000000000000000001790555060009450610c119350505050565b6109bc85886fffffffffffffffffffffffffffffffff16611076565b6007546008548a15610a8d575b600288900b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2761814610a88578460020b8c60020b1215610b3a57600285810b600090815260208190526040812060038101805482850180548803905585039055600101547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff88019a50700100000000000000000000000000000000810490920b969550600f9190910b90610a80908b90839003611245565b9950506109c9565b610b3a565b6001610ab87ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b610ac2919061200c565b60020b8860020b14610b3a578360020b8c60020b12610b3a57600284810b600090815260208190526040902060038101805482840180548703905584039055600101549498508895507301000000000000000000000000000000000000008504900b93600f0b610b328a82611245565b995050610a8d565b50506004805462ffffff9384166301000000027fffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000858e16760100000000000000000000000000000000000000000000027fffffffffffffff000000ffffffffffffffffffffffffffffffffffffffffffff6fffffffffffffffffffffffffffffffff909c166601000000000000029b909b167fffffffffffffff00000000000000000000000000000000000000ffffffffffff90931692909217999099171693909216929092179590951790945550600193505050505b92915050565b610c1f61130c565b600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d010000000000000000000000000000000000000000000000000000000000179055565b610c7161130c565b610c7961137b565b565b610c8361130c565b610c8b61137b565b6fffffffffffffffffffffffffffffffff9182169116700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff000000000000000000000000000000001617600555565b610ce461130c565b610cf0600083836113c7565b5050565b610cfc61130c565b6004546fffffffffffffffffffffffffffffffff66010000000000008204169063ffffffff7901000000000000000000000000000000000000000000000000008204169060ff7d0100000000000000000000000000000000000000000000000000000000008204169063010000008104600290810b91900b82610dd557610d848682846114a7565b610dd557600480547fffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff167d010000000000000000000000000000000000000000000000000000000000179055600192505b50508015610de557505050610f06565b600480547fffffffffffffff000000ffffffffffffffffffffffffffffffffffffffffffff1676010000000000000000000000000000000000000000000062ffffff87160217905563ffffffff82164263ffffffff161115610e5d57610e5d82846fffffffffffffffffffffffffffffffff16611076565b84600f0b600014610f02576000610e7788868860006114cc565b90506000610e8888878960016114cc565b9050610e95868a8a6114a7565b15610edd57610ea48588611245565b600460066101000a8154816fffffffffffffffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff1602179055505b8180610ee65750805b15610eff57610eff898984848a60008d600f0b126114f0565b50505b5050505b50505050565b610f1461130c565b610cf0600183836113c7565b6000838302817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff85870982811083820303915050808411610f6057600080fd5b80600003610f7357508290049050610fd1565b8385870960008581038616958690049560026003880281188089028203028089028203028089028203028089028203028089028203028089029091030291819003819004600101858411909403939093029190930391909104170290505b9392505050565b600285810b60009081526020889052604080822087840b8084529183209293849391929088900b121561104e578860020b8760020b1261102957816002015486039350816003015485039250611038565b81600201549350816003015492505b6002810154600382015494039390920391611069565b81600201548160020154039350816003015481600301540392505b5050965096945050505050565b63ffffffff4283900316600081900361108e57505050565b81156111f4576005546006546fffffffffffffffffffffffffffffffff8083168402927001000000000000000000000000000000009081900482168502928083169291900416818411156110f257816fffffffffffffffffffffffffffffffff1693505b806fffffffffffffffffffffffffffffffff1683111561112257806fffffffffffffffffffffffffffffffff1692505b838317156111ef576fffffffffffffffffffffffffffffffff91821684900391168290038315611172576111688470010000000000000000000000000000000088610f20565b6007805490910190555b821561119e576111948370010000000000000000000000000000000088610f20565b6008805490910190555b6fffffffffffffffffffffffffffffffff808316908216700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff0000000000000000000000000000000016176006555b505050505b5050600480547fffffff00000000ffffffffffffffffffffffffffffffffffffffffffffffffff167901000000000000000000000000000000000000000000000000004263ffffffff160217905550565b60008082600f0b12156112a957508082016fffffffffffffffffffffffffffffffff808416908216106112a4576040517f1301f74800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610c11565b826fffffffffffffffffffffffffffffffff168284019150816fffffffffffffffffffffffffffffffff161015610c11576040517f997402f200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001614610c79576040517fae74b17800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600454610c7990790100000000000000000000000000000000000000000000000000810463ffffffff1690660100000000000090046fffffffffffffffffffffffffffffffff16611076565b6113cf61137b565b6fffffffffffffffffffffffffffffffff82821716156114a2576006546fffffffffffffffffffffffffffffffff80821691700100000000000000000000000000000000900416841561143957611426848361204d565b9150611432838261204d565b9050611452565b611443848361207d565b915061144f838261207d565b90505b6fffffffffffffffffffffffffffffffff9182169116700100000000000000000000000000000000027fffffffffffffffffffffffffffffffff0000000000000000000000000000000016176006555b505050565b60008260020b8460020b121580156114c457508160020b8460020b125b949350505050565b6007546008546000916114e79183918891889188918861161f565b95945050505050565b600454600154600282810b9263010000009004900b9063ffffffff16828282891561152b576115238c898386868c611753565b919450925090505b88156115475761153f8b898386868c611753565b919450925090505b8260020b8660020b14158061156257508160020b8560020b14155b8061157957508363ffffffff168163ffffffff1614155b1561161157600180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000001663ffffffff8316179055600480547fffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000016630100000062ffffff858116919091027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000016919091179085161790555b505050505050505050505050565b600286900b600090815260208890526040812080548261163f8289611245565b6fffffffffffffffffffffffffffffffff1690506d09745258e83de0d0f4e400fce79981111561169b576040517f25b8364a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001830154600f0b856116bf5788600f0b81600f0b6116ba91906120a6565b6116d1565b88600f0b81600f0b6116d191906120ce565b6001850180547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff9290921691909117905581845581159450600083900361174457841594508960020b8b60020b136117445760038401879055600284018890555b50505050979650505050505050565b6000806000831561179c5760008061176b818c611854565b915091508a60020b8860020b0361178457819750611795565b8a60020b8760020b03611795578096505b5050611832565b6000808a60020b8860020b1280156117b957508a60020b8760020b135b156117e257508690508560028a810b908c900b13156117da578a9650611822565b8a9750611822565b6117f0600360028b8e611aca565b600281810b6000908152602081905260409020600101547001000000000000000000000000000000009004900b925090505b61182f60008c8484611ba7565b50505b6000611842600360028a8d611d53565b969a9599509597509395505050505050565b600281810b60008181526020859052604081206001810180548383557fffffffffffffffffffff0000000000000000000000000000000000000000000081169091558185018390556003909101919091557001000000000000000000000000000000008104830b92730100000000000000000000000000000000000000909104900b907ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618148061193157506119287ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b60020b8360020b145b156119d657600283900b6000908152602085905260409020600101805462ffffff808516700100000000000000000000000000000000027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff91851673010000000000000000000000000000000000000002919091167fffffffffffffffffffff000000000000ffffffffffffffffffffffffffffffff909216919091171790556107c7565b8060020b8260020b03611a15576040517f0d6e094900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600282810b6000908152602086905260408082206001908101805462ffffff808816730100000000000000000000000000000000000000027fffffffffffffffffffff000000ffffffffffffffffffffffffffffffffffffff909216919091179091559385900b83529120018054918416700100000000000000000000000000000000027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff9092169190911790559250929050565b600190810190600090600883811d610d8a01901c90829061ffff83161b851663ffffffff1615611b2d57611afe8785611deb565b90945090925090508015611b135750506114c4565b611b2486610d8b840160010b611deb565b90945090925090505b80611b7057611b4b8563ffffffff168360010193508360010b611e1c565b909350905080611b635750620d89e891506114c49050565b611b6d8684611f73565b92505b611b9c877ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2768501611f73565b979650505050505050565b600283900b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff276181480611c065750611bfd7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff27618611fce565b60020b8360020b145b610f06578260020b8260020b128015611c2457508260020b8160020b135b611c5a576040517fe45ac17d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600283810b60009081526020959095526040808620600190810180547fffffffffffffffffffff000000000000ffffffffffffffffffffffffffffffff1673010000000000000000000000000000000000000062ffffff87811682027fffffffffffffffffffffffffff000000ffffffffffffffffffffffffffffffff908116939093177001000000000000000000000000000000008a831681029190911790945597860b8a52848a20840180547fffffffffffffffffffff000000ffffffffffffffffffffffffffffffffffffff1698909916908102979097179097559390920b865290942090930180549092169202919091179055565b81600080611d908785600881901d600181810b60009081526020949094526040909320805460ff9093169390931b80831890935591811490151891565b915091508115611de157610d8a01600181810b60081d80820b6000908152602089905260409020805460ff9094169290921b808418909255821591909214818118935014611de1576001811b831892505b5050949350505050565b600881901d600181900b6000908152602084905260408120548190611e109085611e1c565b93969095509293505050565b60008060ff831684811c808303611e38578460ff179350611f6a565b7f555555555555555555555555555555555555555555555555555555555555555560008290038216908116156fffffffffffffffffffffffffffffffff82161560071b1777ffffffffffffffff0000000000000000ffffffffffffffff82161560061b177bffffffff00000000ffffffff00000000ffffffff00000000ffffffff82161560051b177dffff0000ffff0000ffff0000ffff0000ffff0000ffff0000ffff0000ffff82161560041b177eff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff82161560031b177f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f82161560021b177f33333333333333333333333333333333333333333333333333333333333333339091161560011b1760ff1685019350600192505b50509250929050565b600181900b600090815260208390526040902054600882901b90611f979082611e1c565b509392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008160020b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff800000810361200357612003611f9f565b60000392915050565b600282810b9082900b037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000008112627fffff82131715610c1157610c11611f9f565b6fffffffffffffffffffffffffffffffff81811683821601908082111561207657612076611f9f565b5092915050565b6fffffffffffffffffffffffffffffffff82811682821603908082111561207657612076611f9f565b80820182811260008312801582168215821617156120c6576120c6611f9f565b505092915050565b818103600083128015838313168383128216171561207657612076611f9f56fea164736f6c6343000814000aa164736f6c6343000814000a',
    linkReferences: {},
    deployedLinkReferences: {},
};
