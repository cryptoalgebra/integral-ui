import { GraphQLClient, gql } from "graphql-request";
import useSWR from "swr";
import { Address } from "viem";
import { useChainId } from "wagmi";

const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql";
const client = new GraphQLClient(MORPHO_GRAPHQL_URL);

async function getVaultWithRewards(vaultAddress: string, chainId: number) {
    const query = gql`
        query VaultRewards($address: String!, $chainId: Int!) {
            vaultByAddress(address: $address, chainId: $chainId) {
                state {
                    netApy # Convenience field: complete APY including rewards
                }
            }
        }
    `;

    const response = await client.request(query, {
        address: vaultAddress,
        chainId,
    });

    const vault = response.vaultByAddress;
    return parseFloat(vault.state.netApy);
}

export function useBoostedTokenAPR(tokenAddress: Address | undefined) {
    const chainId = useChainId();

    const { data, isLoading, error } = useSWR(
        tokenAddress && chainId ? ["boosted-token-apr", tokenAddress, chainId] : null,
        () => getVaultWithRewards(tokenAddress!, chainId),
        {
            dedupingInterval: 60000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: true,
            errorRetryCount: 3,
        }
    );

    return {
        data,
        isLoading,
        error,
    };
}
