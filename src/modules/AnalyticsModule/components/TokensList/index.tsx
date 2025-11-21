import { isDefined } from "@/utils/common/isDefined";
import { tokensColumns, TokensTable } from "../TokensTable";
import { useAllTokensQuery } from "@/graphql/generated/graphql";
import { Token, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";
import { useClients } from "@/hooks/graphql/useClients";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { useChainId } from "wagmi";

export function TokensList() {
    const { infoClient } = useClients();
    const chainId = useChainId();
    const { data, loading } = useAllTokensQuery({ client: infoClient });

    const { formatted: nativeTokenPriceUSD } = useUSDCPrice(WNATIVE[chainId]);

    const formattedTokens = data?.tokens
        ? data.tokens
              ?.map((token) => {
                  if (!token) return undefined;

                  //   if (bannedTokens.includes(Address.parse(token.address).toString())) {
                  //       return undefined;
                  //   }

                  const id = token.id;
                  const name = token.name;
                  const symbol = token.symbol;
                  const decimals = token.decimals;
                  const price = Number(token.derivedMatic) * nativeTokenPriceUSD;
                  const volume = Number(token.volumeUSD);
                  const tvl = Number(token.totalValueLockedUSD);
                  const change = 0; // TODO;

                  const tokenSDK = new Token(chainId, id, Number(decimals), symbol, name);

                  return {
                      id,
                      name,
                      symbol,
                      decimals: Number(decimals),
                      price,
                      volume,
                      tvl,
                      change,
                      tokenSDK,
                  };
              })
              .filter(isDefined)
        : [];

    return (
        <div className="pb-4 bg-card-dark border border-card-border rounded-lg w-full max-w-[1280px] mx-auto">
            <div className="flex flex-col gap-4">
                <TokensTable
                    columns={tokensColumns}
                    data={formattedTokens}
                    defaultSortingID={"tvl"}
                    link={"analytics/tokens"}
                    showPagination
                    loading={loading}
                    searchID={"id"}
                />
            </div>
        </div>
    );
}
