import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import deepMerge from "lodash.merge";

interface PositionNamesState {
    positionNames: Record<string, string>;
    actions: {
        setPositionName: (positionId: string, name: string) => void;
        removePositionName: (positionId: string) => void;
    };
}

export const usePositionNamesStore = create(
    persist<PositionNamesState>(
        (set, get) => ({
            positionNames: {},
            actions: {
                setPositionName: (positionId, name) => {
                    const trimmedName = name.trim();
                    if (!trimmedName) return;

                    set({
                        positionNames: {
                            ...get().positionNames,
                            [positionId]: trimmedName,
                        },
                    });
                },
                removePositionName: (positionId) => {
                    const nextPositionNames = { ...get().positionNames };
                    delete nextPositionNames[positionId];

                    set({
                        positionNames: nextPositionNames,
                    });
                },
            },
        }),
        {
            name: "position-names-storage",
            storage: createJSONStorage(() => localStorage),
            merge: (persistedState, currentState) => deepMerge(currentState, persistedState),
        }
    )
);
