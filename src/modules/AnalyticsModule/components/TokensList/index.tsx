import { isDefined } from "@/utils/common/isDefined";
import { tokensColumns, TokensTable } from "../TokensTable";
import { useAllTokensQuery } from "@/graphql/generated/graphql";
import { Token, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";
import { useClients } from "@/hooks/graphql/useClients";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { useChainId } from "wagmi";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { findStablecoin } from "@/utils/common/findStablecoin";
import { Address } from "viem";

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

                  const stablecoin = findStablecoin(token.id as Address, chainId);

                  const id = token.id;
                  const price = Number(token.derivedMatic) * nativeTokenPriceUSD;
                  const volume = Number(token.volumeUSD);
                  const tvl = Number(token.totalValueLockedUSD);
                  const change = 0; // TODO;

                  const tokenSDK = stablecoin ?? unwrappedToken(new Token(chainId, id, Number(token.decimals), token.symbol, token.name));

                  return {
                      id,
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
        <div className="flex w-full flex-col gap-4">
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
    );
}
