import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Address } from "viem";
import { useEffect } from "react";

export interface NFTPermitSignature {
    v: number;
    r: string;
    s: string;
    deadline: number;
}

interface NFTPermitData {
    tokenId: string;
    chainId: number;
    spender: Address;
    signature: NFTPermitSignature;
    owner: Address;
}

interface NFTPermitState {
    permits: Record<string, NFTPermitData>;
    setPermit: (data: NFTPermitData) => void;
    getPermit: (tokenId: string | number, chainId: number, spender: Address, owner: Address) => NFTPermitSignature | undefined;
    clearPermit: (tokenId: string | number, chainId: number) => void;
    clearAllPermits: () => void;
    clearExpiredPermits: () => void;
}

export const getPermitKey = (tokenId: string | number, chainId: number): string => {
    return `${chainId}-${tokenId}`;
};

export const isPermitValid = (permit: NFTPermitData, spender: Address, owner: Address): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return (
        permit.signature.deadline >= now &&
        permit.spender.toLowerCase() === spender.toLowerCase() &&
        permit.owner.toLowerCase() === owner.toLowerCase()
    );
};

export const useNFTPermitStore = create<NFTPermitState>()(
    persist(
        (set, get) => ({
            permits: {},

            setPermit: (data: NFTPermitData) => {
                const key = getPermitKey(data.tokenId, data.chainId);
                set((state) => ({
                    permits: {
                        ...state.permits,
                        [key]: data,
                    },
                }));
            },

            getPermit: (tokenId: string | number, chainId: number, spender: Address, owner: Address) => {
                const key = getPermitKey(tokenId, chainId);
                const permit = get().permits[key];

                if (!permit) return undefined;

                // Check if permit is valid (not expired and matches spender/owner)
                if (!isPermitValid(permit, spender, owner)) {
                    // Clear invalid permit
                    get().clearPermit(tokenId, chainId);
                    return undefined;
                }

                return permit.signature;
            },

            clearPermit: (tokenId: string | number, chainId: number) => {
                const key = getPermitKey(tokenId, chainId);
                set((state) => {
                    const newPermits = { ...state.permits };
                    delete newPermits[key];
                    return { permits: newPermits };
                });
            },

            clearAllPermits: () => {
                set({ permits: {} });
            },

            clearExpiredPermits: () => {
                const now = Math.floor(Date.now() / 1000);
                set((state) => {
                    const newPermits = { ...state.permits };
                    let hasChanges = false;

                    for (const key in newPermits) {
                        if (newPermits[key].signature.deadline < now) {
                            delete newPermits[key];
                            hasChanges = true;
                        }
                    }

                    return hasChanges ? { permits: newPermits } : state;
                });
            },
        }),
        {
            name: "nft-permit-storage",
            version: 1,
        }
    )
);

const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

export function useNFTPermitCleanup() {
    const { clearExpiredPermits } = useNFTPermitStore();

    useEffect(() => {
        const interval = setInterval(() => {
            clearExpiredPermits();
        }, CLEANUP_INTERVAL);

        return () => clearInterval(interval);
    }, [clearExpiredPermits]);
}
