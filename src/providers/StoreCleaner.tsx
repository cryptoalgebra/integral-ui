import { useNFTPermitCleanup } from "@/state/nftPermitStore";

/**
 * Provider that periodically cleans up expired state data
 */
function StoreCleaner() {
    useNFTPermitCleanup();

    return null;
}

export default StoreCleaner;
