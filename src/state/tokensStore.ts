import { Address } from "viem";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ImportedTokens {
    [chainId: number]: { 
        [address: Address]: { id: Address, symbol: string, name: string, decimals: number } 
    }
}

interface TokensState {
    importedTokens: ImportedTokens,
    actions: {
        importToken: (address: Address, symbol: string, name: string, decimals: number, chainId: number) => void;
    }
}

export const useTokensState = create(persist<TokensState>((set, get) => ({
    importedTokens: {},
    actions: {
        importToken: (address, symbol, name, decimals, chainId) => {
            const { importedTokens } = get()

            set({
                importedTokens: {
                    ...importedTokens,
                    [chainId]: {
                        ...importedTokens[chainId],
                        [address]: {
                            id: address,
                            symbol,
                            name,
                            decimals
                        }
                    }
                }
            })
        },
    }
}), { name: 'tokens-storage', storage: createJSONStorage(() => localStorage) }))