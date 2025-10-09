export const algebraEternalFarmingABI = [
    {
        inputs: [
            {
                internalType: "contract IAlgebraPoolDeployer",
                name: "_deployer",
                type: "address",
            },
            {
                internalType: "contract INonfungiblePositionManager",
                name: "_nonfungiblePositionManager",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "anotherFarmingIsActive",
        type: "error",
    },
    {
        inputs: [],
        name: "claimToZeroAddress",
        type: "error",
    },
    {
        inputs: [],
        name: "emergencyActivated",
        type: "error",
    },
    {
        inputs: [],
        name: "farmDoesNotExist",
        type: "error",
    },
    {
        inputs: [],
        name: "incentiveNotExist",
        type: "error",
    },
    {
        inputs: [],
        name: "incentiveStopped",
        type: "error",
    },
    {
        inputs: [],
        name: "invalidPool",
        type: "error",
    },
    {
        inputs: [],
        name: "invalidTokenAmount",
        type: "error",
    },
    {
        inputs: [],
        name: "minimalPositionWidthTooWide",
        type: "error",
    },
    {
        inputs: [],
        name: "pluginNotConnected",
        type: "error",
    },
    {
        inputs: [],
        name: "poolReentrancyLock",
        type: "error",
    },
    {
        inputs: [],
        name: "positionIsTooNarrow",
        type: "error",
    },
    {
        inputs: [],
        name: "reentrancyLock",
        type: "error",
    },
    {
        inputs: [],
        name: "tokenAlreadyFarmed",
        type: "error",
    },
    {
        inputs: [],
        name: "zeroLiquidity",
        type: "error",
    },
    {
        inputs: [],
        name: "zeroRewardAmount",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bool",
                name: "newStatus",
                type: "bool",
            },
        ],
        name: "EmergencyWithdraw",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IERC20Minimal",
                name: "rewardToken",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract IERC20Minimal",
                name: "bonusRewardToken",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract IAlgebraPool",
                name: "pool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "virtualPool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "bonusReward",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint24",
                name: "minimalAllowedPositionWidth",
                type: "uint24",
            },
        ],
        name: "EternalFarmingCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "rewardAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "bonusRewardToken",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "bonusReward",
                type: "uint256",
            },
        ],
        name: "FarmEnded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
            },
        ],
        name: "FarmEntered",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "farmingCenter",
                type: "address",
            },
        ],
        name: "FarmingCenter",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "IncentiveDeactivated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "bonusRewardAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "RewardAmountsDecreased",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "rewardAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "RewardClaimed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "bonusRewardAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "RewardsAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "bonusRewardAmount",
                type: "uint256",
            },
        ],
        name: "RewardsCollected",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint128",
                name: "rewardRate",
                type: "uint128",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "bonusRewardRate",
                type: "uint128",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "RewardsRatesChanged",
        type: "event",
    },
    {
        inputs: [],
        name: "FARMINGS_ADMINISTRATOR_ROLE",
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
        name: "INCENTIVE_MAKER_ROLE",
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
                components: [
                    {
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint128",
                name: "rewardAmount",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "bonusRewardAmount",
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
                internalType: "contract IERC20Minimal",
                name: "rewardToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amountRequested",
                type: "uint256",
            },
        ],
        name: "claimReward",
        outputs: [
            {
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract IERC20Minimal",
                name: "rewardToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amountRequested",
                type: "uint256",
            },
        ],
        name: "claimRewardFrom",
        outputs: [
            {
                internalType: "uint256",
                name: "reward",
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
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_owner",
                type: "address",
            },
        ],
        name: "collectRewards",
        outputs: [
            {
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "bonusReward",
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
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "uint128",
                        name: "reward",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "bonusReward",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "rewardRate",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "bonusRewardRate",
                        type: "uint128",
                    },
                    {
                        internalType: "uint24",
                        name: "minimalPositionWidth",
                        type: "uint24",
                    },
                ],
                internalType: "struct IAlgebraEternalFarming.IncentiveParams",
                name: "params",
                type: "tuple",
            },
            {
                internalType: "address",
                name: "plugin",
                type: "address",
            },
        ],
        name: "createEternalFarming",
        outputs: [
            {
                internalType: "address",
                name: "virtualPool",
                type: "address",
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
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
        ],
        name: "deactivateIncentive",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint128",
                name: "rewardAmount",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "bonusRewardAmount",
                type: "uint128",
            },
        ],
        name: "decreaseRewardsAmount",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "enterFarming",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_owner",
                type: "address",
            },
        ],
        name: "exitFarming",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "farmingCenter",
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
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "farms",
        outputs: [
            {
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
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
                internalType: "uint256",
                name: "innerRewardGrowth0",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "innerRewardGrowth1",
                type: "uint256",
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
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getRewardInfo",
        outputs: [
            {
                internalType: "uint256",
                name: "reward",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "bonusReward",
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
                name: "pool",
                type: "address",
            },
        ],
        name: "incentiveKeys",
        outputs: [
            {
                internalType: "contract IERC20Minimal",
                name: "rewardToken",
                type: "address",
            },
            {
                internalType: "contract IERC20Minimal",
                name: "bonusRewardToken",
                type: "address",
            },
            {
                internalType: "contract IAlgebraPool",
                name: "pool",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "incentives",
        outputs: [
            {
                internalType: "uint128",
                name: "totalReward",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "bonusReward",
                type: "uint128",
            },
            {
                internalType: "address",
                name: "virtualPoolAddress",
                type: "address",
            },
            {
                internalType: "uint24",
                name: "minimalPositionWidth",
                type: "uint24",
            },
            {
                internalType: "bool",
                name: "deactivated",
                type: "bool",
            },
            {
                internalType: "address",
                name: "pluginAddress",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "isEmergencyWithdrawActivated",
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
                internalType: "bytes32",
                name: "incentiveId",
                type: "bytes32",
            },
        ],
        name: "isIncentiveDeactivated",
        outputs: [
            {
                internalType: "bool",
                name: "res",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "nonfungiblePositionManager",
        outputs: [
            {
                internalType: "contract INonfungiblePositionManager",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "numOfIncentives",
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
                name: "owner",
                type: "address",
            },
            {
                internalType: "contract IERC20Minimal",
                name: "rewardToken",
                type: "address",
            },
        ],
        name: "rewards",
        outputs: [
            {
                internalType: "uint256",
                name: "rewardAmount",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bool",
                name: "newStatus",
                type: "bool",
            },
        ],
        name: "setEmergencyWithdrawStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_farmingCenter",
                type: "address",
            },
        ],
        name: "setFarmingCenterAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "contract IERC20Minimal",
                        name: "rewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IERC20Minimal",
                        name: "bonusRewardToken",
                        type: "address",
                    },
                    {
                        internalType: "contract IAlgebraPool",
                        name: "pool",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                ],
                internalType: "struct IncentiveKey",
                name: "key",
                type: "tuple",
            },
            {
                internalType: "uint128",
                name: "rewardRate",
                type: "uint128",
            },
            {
                internalType: "uint128",
                name: "bonusRewardRate",
                type: "uint128",
            },
        ],
        name: "setRates",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
