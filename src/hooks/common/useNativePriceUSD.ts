import { useNativePriceQuery } from "@/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";

export function useNativePriceUSD() {
    const { infoClient } = useClients();

    const { data: bundles, loading: isLoading } = useNativePriceQuery({
        client: infoClient,
    });

    return {
        nativePriceUSD: Number(bundles?.bundles[0].maticPriceUSD || 0),
        isLoading,
    };
}
