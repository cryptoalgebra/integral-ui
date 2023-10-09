import { Percent } from "@cryptoalgebra/integral-sdk";
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
    txDeadline: string;
    slippage: Percent;
    pendingTransactions: PendingTransactions;
    actions: {
        setTxDeadline: (txDeadline: string) => void;
        setSlippage: (slippage: Percent) => void;
        addPendingTransaction: (hash: Address) => void;
        updatePendingTransaction: (hash: Address, transaction: Transaction) => void;
        deletePendingTransaction: (hash: Address) => void
    }
}

export const useUserState = create<UserState>((set, get) => ({
    txDeadline: '300',
    slippage: new Percent('1', '100'),
    pendingTransactions: {},
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
        }
    }
}))