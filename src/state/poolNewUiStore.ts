import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import deepMerge from "lodash.merge";

interface PoolNewUiState {
    showClosedPositions: boolean;
    actions: {
        setShowClosedPositions: (value: boolean) => void;
        toggleShowClosedPositions: () => void;
    };
}

export const usePoolNewUiStore = create(
    persist<PoolNewUiState>(
        (set) => ({
            showClosedPositions: true,
            actions: {
                setShowClosedPositions: (value) => set({ showClosedPositions: value }),
                toggleShowClosedPositions: () => set((state) => ({ showClosedPositions: !state.showClosedPositions })),
            },
        }),
        {
            name: "pool-new-ui-storage",
            storage: createJSONStorage(() => localStorage),
            merge: (persistedState, currentState) => deepMerge(currentState, persistedState),
        }
    )
);
