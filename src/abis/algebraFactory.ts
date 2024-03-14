export const algebraFactoryABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_poolDeployer',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint8',
                name: 'newDefaultCommunityFee',
                type: 'uint8',
            },
        ],
        name: 'DefaultCommunityFee',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'newFarmingAddress',
                type: 'address',
            },
        ],
        name: 'FarmingAddress',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint16',
                name: 'alpha1',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'uint16',
                name: 'alpha2',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'uint32',
                name: 'beta1',
                type: 'uint32',
            },
            {
                indexed: false,
                internalType: 'uint32',
                name: 'beta2',
                type: 'uint32',
            },
            {
                indexed: false,
                internalType: 'uint16',
                name: 'gamma1',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'uint16',
                name: 'gamma2',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'uint16',
                name: 'baseFee',
                type: 'uint16',
            },
        ],
        name: 'FeeConfiguration',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'token0',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'token1',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'pool',
                type: 'address',
            },
        ],
        name: 'Pool',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'previousAdminRole',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'newAdminRole',
                type: 'bytes32',
            },
        ],
        name: 'RoleAdminChanged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'RoleGranted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'RoleRevoked',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
        ],
        name: 'renounceOwnershipFinished',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'finishTimestamp',
                type: 'uint256',
            },
        ],
        name: 'renounceOwnershipStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
        ],
        name: 'renounceOwnershipStopped',
        type: 'event',
    },
    {
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
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
        name: 'acceptOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'baseFeeConfiguration',
        outputs: [
            {
                internalType: 'uint16',
                name: 'alpha1',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: 'alpha2',
                type: 'uint16',
            },
            {
                internalType: 'uint32',
                name: 'beta1',
                type: 'uint32',
            },
            {
                internalType: 'uint32',
                name: 'beta2',
                type: 'uint32',
            },
            {
                internalType: 'uint16',
                name: 'gamma1',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: 'gamma2',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: 'baseFee',
                type: 'uint16',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'communityVault',
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
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
            },
        ],
        name: 'createPool',
        outputs: [
            {
                internalType: 'address',
                name: 'pool',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'defaultCommunityFee',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'farmingAddress',
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
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
        ],
        name: 'getRoleAdmin',
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
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
            },
        ],
        name: 'getRoleMember',
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
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
        ],
        name: 'getRoleMemberCount',
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
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'hasRole',
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
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'hasRoleOrOwner',
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
        inputs: [],
        name: 'owner',
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
        inputs: [],
        name: 'pendingOwner',
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
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'poolByPair',
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
        inputs: [],
        name: 'poolDeployer',
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
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnershipStartTimestamp',
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
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'renounceRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'revokeRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint16',
                        name: 'alpha1',
                        type: 'uint16',
                    },
                    {
                        internalType: 'uint16',
                        name: 'alpha2',
                        type: 'uint16',
                    },
                    {
                        internalType: 'uint32',
                        name: 'beta1',
                        type: 'uint32',
                    },
                    {
                        internalType: 'uint32',
                        name: 'beta2',
                        type: 'uint32',
                    },
                    {
                        internalType: 'uint16',
                        name: 'gamma1',
                        type: 'uint16',
                    },
                    {
                        internalType: 'uint16',
                        name: 'gamma2',
                        type: 'uint16',
                    },
                    {
                        internalType: 'uint16',
                        name: 'baseFee',
                        type: 'uint16',
                    },
                ],
                internalType: 'struct IAlgebraFeeConfiguration.Configuration',
                name: '_config',
                type: 'tuple',
            },
        ],
        name: 'setBaseFeeConfiguration',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint8',
                name: 'newDefaultCommunityFee',
                type: 'uint8',
            },
        ],
        name: 'setDefaultCommunityFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newFarmingAddress',
                type: 'address',
            },
        ],
        name: 'setFarmingAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'startRenounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'stopRenounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceId',
                type: 'bytes4',
            },
        ],
        name: 'supportsInterface',
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
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;
