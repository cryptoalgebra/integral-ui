import { useChainId } from "wagmi";
import { Token } from "@cryptoalgebra/integral-sdk";

export function useSideCurrency(side: "yes" | "no"): Token | undefined {
    const chainId = useChainId();
    const YES_TOKEN = new Token(chainId, "0x1111111111111111111111111111111111111111", 6, "YES", "Yes Shares"); // Placeholder address for YES token
    const NO_TOKEN = new Token(chainId, "0x2222222222222222222222222222222222222222", 6, "NO", "No Shares"); // Placeholder address for NO token

    return side === "yes" ? YES_TOKEN : NO_TOKEN;
}
