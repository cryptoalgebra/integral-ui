import deepMerge from 'lodash.merge';
import { Percent } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address, useWatchPendingTransactions } from "wagmi";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
    success: boolean;
    loading: boolean;
    error: Error | null;
}

export interface PendingTransactions {
    [hash: Address]: Transaction
}

const MAX_TRANSACTIONS = 5;

interface UserState {
    txDeadline: number;
    slippage: Percent | "auto";
    pendingTransactions: PendingTransactions;
    isExpertMode: boolean;
    isMultihop: boolean;
    actions: {
        setTxDeadline: (txDeadline: number) => void;
        setSlippage: (slippage: Percent | "auto") => void;
        addPendingTransaction: (hash: Address) => void;
        updatePendingTransaction: (hash: Address, transaction: Transaction) => void;
        deletePendingTransaction: (hash: Address) => void;
        setIsExpertMode: (isExpertMode: boolean) => void;
        setIsMultihop: (isMultihop: boolean) => void;
    }
}

export const useUserState = create(persist<UserState>((set, get) => ({
    txDeadline: 180,
    slippage: "auto",
    isExpertMode: false,
    isMultihop: true,
    pendingTransactions: {},
    importedTokens: {},
    actions: {
        setTxDeadline: (txDeadline) => set({
            txDeadline
        }),
        setSlippage: (slippage) => set({
            slippage
        }),
        addPendingTransaction: (hash) => {
            const { pendingTransactions } = get();
            const transactionKeys = Object.keys(pendingTransactions);
            
            if (transactionKeys.length >= MAX_TRANSACTIONS) {
              delete pendingTransactions[transactionKeys[0] as Address];
            }
            
            set({
                pendingTransactions: {
                    ...pendingTransactions,
                    [hash]: {
                        loading: true,
                        success: null,
                        error: null
                    }
                }
            });
        },
        updatePendingTransaction: (hash, transaction) => set({
            pendingTransactions: {
                ...get().pendingTransactions,
                [hash]: transaction
            }
        }),
        deletePendingTransaction: (hash) => {
            const { pendingTransactions } = get()
            delete pendingTransactions[hash]
            set({
                pendingTransactions
            })
        },
        setIsExpertMode: (isExpertMode) => set({
            isExpertMode
        }),
        setIsMultihop: (isMultihop) => set({
            isMultihop
        })
    }
}), {
        name: 'user-state-storage',
        merge(persistedState: any, currentState) {
            return deepMerge(
                { ...currentState, slippage: persistedState.slippage === "auto" ? "auto" : new Percent(0) },
                persistedState
                );
        },
    }
))


export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
    const { slippage } = useUserState();
    return useMemo(() => (slippage === "auto" ? defaultSlippageTolerance : slippage), [slippage, defaultSlippageTolerance]);
}

export function usePendingTransactions() {
    const { pendingTransactions, actions: { deletePendingTransaction } } = useUserState();

    useWatchPendingTransactions({
        listener: (hashes) => {
            for (const txIndex in pendingTransactions) {
                if (!hashes.includes(txIndex as Address)) {
                    deletePendingTransaction(txIndex as Address);
                }
            }
        }
    })
}