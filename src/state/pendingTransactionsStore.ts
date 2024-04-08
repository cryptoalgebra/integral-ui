import deepMerge from 'lodash.merge';
import { useEffect } from "react";
import { Address, useAccount, usePublicClient } from "wagmi";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { waitForTransactionReceipt } from 'viem/actions';

interface TransactionData {
    title: string;
    description?: string;
    tokenA?: Address;
    tokenB?: Address;
}

export interface Transaction {
    data: TransactionData;
    success: boolean | null;
    loading: boolean;
    error: Error | null;
}

interface PendingTransactions {
    [hash: Address]: Transaction
}

interface UserTransactions {
    [account: Address]: PendingTransactions
}

const MAX_TRANSACTIONS = 8;

interface UserState {
    pendingTransactions: UserTransactions;
    actions: {
        addPendingTransaction: (account: Address, hash: Address) => void;
        updatePendingTransaction: (account: Address, hash: Address, transaction: Transaction) => void;
        deletePendingTransaction: (account: Address, hash: Address) => void;
    }
}

export const usePendingTransactionsStore = create(persist<UserState>((set, get) => ({
    pendingTransactions: {},
    actions: {
        addPendingTransaction: (account, hash) => {
            const { pendingTransactions } = get();
            const transactionKeys = pendingTransactions[account] ? Object.keys(pendingTransactions[account]) : [];
            
            if (transactionKeys.length >= MAX_TRANSACTIONS) {
              delete pendingTransactions[transactionKeys[0] as Address];
            }
            
            set({
                pendingTransactions: {
                    ...get().pendingTransactions,
                    [account]: {
                        ...get().pendingTransactions[account],
                        [hash]: {
                            loading: true,
                            success: null,
                            error: null
                        }
                    }
                }
            });
        },
        updatePendingTransaction: (account, hash, transaction) => set({
            pendingTransactions: {
                ...get().pendingTransactions,
                [account]: {
                    ...get().pendingTransactions[account],
                    [hash]: transaction
                }
            }
        }),
        deletePendingTransaction: (account, hash) => {
            const { pendingTransactions } = get()
            delete pendingTransactions[account][hash]
            set({
                pendingTransactions
            })
        },
    }
}), {
        name: 'pending-transactions-storage',
        merge(persistedState, currentState) {
            return deepMerge(currentState, persistedState);
        },
    }
))

export function usePendingTransactions() {
    const { pendingTransactions, actions: { deletePendingTransaction } } = usePendingTransactionsStore();

    const { address: account } = useAccount();

    const config = usePublicClient();

    useEffect(() => {
        if (!account) return;
        for (const txHash of Object.keys(pendingTransactions[account])) {
            waitForTransactionReceipt(config, { confirmations: 1, hash: txHash as Address })
                .then(() => deletePendingTransaction(account, txHash as Address));
        }
    }, [config, pendingTransactions, deletePendingTransaction, account]);

    return pendingTransactions;
}