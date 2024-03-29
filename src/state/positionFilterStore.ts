import { create } from 'zustand';
import { PositionsStatus } from '@/types/position-filter-status';

type FilteredPositions = {
    [key in PositionsStatus]: boolean;
};

type FilterStore = {
    filterStatus: FilteredPositions;
    handleSwitchToggle: (positionStatus: PositionsStatus) => void;
    reset: () => void;
};

export const usePositionFilterStore = create<FilterStore>((set) => ({
    filterStatus: {
        [PositionsStatus.ACTIVE]: true,
        [PositionsStatus.ON_FARMING]: true,
        [PositionsStatus.CLOSED]: false,
    },
    handleSwitchToggle: (positionStatus: PositionsStatus) => {
        set((state) => ({
            filterStatus: {
                ...state.filterStatus,
                [positionStatus]: !state.filterStatus[positionStatus],
            },
        }));
    },
    reset: () =>
        set({
            filterStatus: {
                [PositionsStatus.ACTIVE]: true,
                [PositionsStatus.ON_FARMING]: true,
                [PositionsStatus.CLOSED]: false,
            },
        }),
}));
