import deepMerge from "lodash.merge";
import { useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { waitForTransactionReceipt } from "viem/actions";
import { Address } from "viem";

export enum TransactionType {
    SWAP = "SWAP",
    FARM = "FARM",
    POOL = "POOL",
    LIMIT_ORDER = "LIMIT_ORDER",
}

export interface TransactionInfo {
    title: string;
    description?: string;
    tokenA?: Address;
    tokenB?: Address;
    tokenId?: string;
    type: TransactionType;
    callback?: () => void;
}

export interface Transaction {
    data: TransactionInfo;
    success: boolean | null;
    loading: boolean;
    error: Error | null;
}

type PendingTransactions = Record<Address, Transaction>;

type UserTransactions = Record<Address, PendingTransactions>;

const MAX_TRANSACTIONS = 10;

interface UserState {
    pendingTransactions: UserTransactions;
    actions: {
        addPendingTransaction: (account: Address, hash: Address) => void;
        updatePendingTransaction: (account: Address, hash: Address, transaction: Transaction) => void;
        deletePendingTransaction: (account: Address, hash: Address) => void;
    };
}

export const usePendingTransactionsStore = create(
    persist<UserState>(
        (set, get) => ({
            pendingTransactions: {},
            actions: {
                addPendingTransaction: (account, hash) => {
                    const { pendingTransactions } = get();
                    const transactionKeys = pendingTransactions[account] ? Object.keys(pendingTransactions[account]) : [];

                    if (transactionKeys.length >= MAX_TRANSACTIONS) {
                        delete pendingTransactions[account][transactionKeys[0] as Address];
                    }

                    set({
                        pendingTransactions: {
                            ...get().pendingTransactions,
                            [account]: {
                                ...get().pendingTransactions[account],
                                [hash]: {
                                    loading: true,
                                    success: null,
                                    error: null,
                                },
                            },
                        },
                    });
                },
                updatePendingTransaction: (account, hash, transaction) =>
                    set({
                        pendingTransactions: {
                            ...get().pendingTransactions,
                            [account]: {
                                ...get().pendingTransactions[account],
                                [hash]: transaction,
                            },
                        },
                    }),
                deletePendingTransaction: (account, hash) => {
                    const { pendingTransactions } = get();
                    delete pendingTransactions[account][hash];
                    set({
                        pendingTransactions,
                    });
                },
            },
        }),
        {
            name: "pending-transactions-storage",
            merge(persistedState, currentState) {
                return deepMerge(currentState, persistedState);
            },
        }
    )
);

export function usePendingTransactions() {
    const {
        pendingTransactions,
        actions: { updatePendingTransaction },
    } = usePendingTransactionsStore();

    const { address: account } = useAccount();

    const config = usePublicClient();

    useEffect(() => {
        if (!account || !config) return;
        const pendingTransactionsList = Object.entries(pendingTransactions[account]).filter(([, transaction]) => transaction.loading);
        for (const [txHash] of pendingTransactionsList) {
            waitForTransactionReceipt(config, { confirmations: 1, hash: txHash as Address })
                .then(() =>
                    updatePendingTransaction(account, txHash as Address, {
                        ...pendingTransactions[account][txHash as Address],
                        loading: false,
                        success: true,
                        error: null,
                    })
                )
                .catch((error) =>
                    updatePendingTransaction(account, txHash as Address, {
                        ...pendingTransactions[account][txHash as Address],
                        loading: false,
                        success: false,
                        error,
                    })
                );
        }
    }, [config, pendingTransactions, updatePendingTransaction, account]);

    return pendingTransactions;
}
