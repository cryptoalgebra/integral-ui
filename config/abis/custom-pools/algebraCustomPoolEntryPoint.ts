export const algebraCustomPoolEntryPointABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_algebraFactory",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_entryPoint",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "alpha1",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "alpha2",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint32",
                        "name": "beta1",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "beta2",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint16",
                        "name": "gamma1",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "gamma2",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "baseFee",
                        "type": "uint16"
                    }
                ],
                "indexed": false,
                "internalType": "struct AlgebraFeeConfiguration",
                "name": "newConfig",
                "type": "tuple"
            }
        ],
        "name": "DefaultFeeConfiguration",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "newFarmingAddress",
                "type": "address"
            }
        ],
        "name": "FarmingAddress",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "afterCreatePoolHook",
        "outputs": [],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "algebraFactory",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "beforeCreatePoolHook",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "createCustomPool",
        "outputs": [
            {
                "internalType": "address",
                "name": "customPool",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "defaultFeeConfiguration",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "alpha1",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "alpha2",
                "type": "uint16"
            },
            {
                "internalType": "uint32",
                "name": "beta1",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "beta2",
                "type": "uint32"
            },
            {
                "internalType": "uint16",
                "name": "gamma1",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "gamma2",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "baseFee",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "entryPoint",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "farmingAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            }
        ],
        "name": "pluginByPool",
        "outputs": [
            {
                "internalType": "address",
                "name": "pluginAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "alpha1",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "alpha2",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint32",
                        "name": "beta1",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "beta2",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint16",
                        "name": "gamma1",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "gamma2",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "baseFee",
                        "type": "uint16"
                    }
                ],
                "internalType": "struct AlgebraFeeConfiguration",
                "name": "newConfig",
                "type": "tuple"
            }
        ],
        "name": "setDefaultFeeConfiguration",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newFarmingAddress",
                "type": "address"
            }
        ],
        "name": "setFarmingAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
