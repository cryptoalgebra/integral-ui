import deepMerge from "lodash.merge";
import { Percent } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
    txDeadline: number;
    slippage: Percent | "auto";
    isExpertMode: boolean;
    isMultihop: boolean;
    isSplit: boolean;
    actions: {
        setTxDeadline: (txDeadline: number) => void;
        setSlippage: (slippage: Percent | "auto") => void;
        setIsExpertMode: (isExpertMode: boolean) => void;
        setIsMultihop: (isMultihop: boolean) => void;
        setIsSplit: (isSplit: boolean) => void;
    };
}

export const useUserState = create(
    persist<UserState>(
        (set) => ({
            txDeadline: 180,
            slippage: "auto",
            isExpertMode: false,
            isMultihop: true,
            isSplit: true,
            importedTokens: {},
            actions: {
                setTxDeadline: (txDeadline) =>
                    set({
                        txDeadline,
                    }),
                setSlippage: (slippage) =>
                    set({
                        slippage,
                    }),
                setIsExpertMode: (isExpertMode) =>
                    set({
                        isExpertMode,
                    }),
                setIsMultihop: (isMultihop) =>
                    set({
                        isMultihop,
                    }),
                setIsSplit: (isSplit) =>
                    set({
                        isSplit,
                    }),
            },
        }),
        {
            name: "user-state-storage",
            merge(persistedState: any, currentState) {
                return deepMerge(
                    { ...currentState, slippage: persistedState.slippage === "auto" ? "auto" : new Percent(0) },
                    persistedState
                );
            },
        }
    )
);

export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
    const { slippage } = useUserState();
    return useMemo(() => (slippage === "auto" ? defaultSlippageTolerance : slippage), [slippage, defaultSlippageTolerance]);
}
