import { Percent } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "wagmi";
import { create } from "zustand";

interface Transaction {
    success: boolean;
    loading: boolean;
    error: Error | null;
}

interface PendingTransactions {
    [hash: Address]: Transaction
}


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

export const useUserState = create<UserState>((set, get) => ({
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
        addPendingTransaction: (hash) => set({
            pendingTransactions: {
                ...get().pendingTransactions,
                [hash]: {
                    loading: true,
                    success: null,
                    error: null
                }
            }
        }),
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
}))


export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
    const { slippage } = useUserState();
    return useMemo(() => (slippage === "auto" ? defaultSlippageTolerance : slippage), [slippage, defaultSlippageTolerance]);
}