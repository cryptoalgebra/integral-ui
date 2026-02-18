import { useWeb3Auth } from "@web3auth/modal/react";
import { DEFAULT_CHAIN_ID } from "config";

function parseChainId(chainId: string | null | undefined): number | undefined {
    if (!chainId) {
        return undefined;
    }

    const parsedChainId = chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : Number.parseInt(chainId, 10);

    return Number.isNaN(parsedChainId) ? undefined : parsedChainId;
}

export const useChainId = (): number => {
    const { web3Auth } = useWeb3Auth();

    const chainId = parseChainId(web3Auth?.currentChain?.chainId ?? web3Auth?.currentChainId);

    return chainId ?? DEFAULT_CHAIN_ID;
};
