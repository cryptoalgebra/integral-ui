import { isDefined } from "@/utils/common/isDefined";
import { tokensColumns, TokensTable } from "../TokensTable";
import { useAllTokensQuery } from "@/graphql/generated/graphql";
import { Token, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { useClients } from "@/hooks/graphql/useClients";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { useChainId } from "wagmi";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

interface TokensListProps {
    link?: string;
}

export function TokensList({ link = "analytics/tokens" }: TokensListProps = {}) {
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

                  const tokenSDK = unwrappedToken(new Token(chainId, id, Number(decimals), symbol, name));

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
        <div className="flex w-full flex-col gap-2 md:gap-6">
            <TokensTable
                columns={tokensColumns}
                data={formattedTokens}
                defaultSortingID={"tvl"}
                link={link}
                showPagination
                loading={loading}
                searchID={"id"}
            />
        </div>
    );
}
