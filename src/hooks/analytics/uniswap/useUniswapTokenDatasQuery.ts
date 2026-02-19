import { useClients } from "@/hooks/graphql/useClients";
import { gql } from "@apollo/client";
import useSWR from "swr";
import { uniswapPlaceholderTokens } from "./uniswap-addresses";

export function useUniswapTokenDatasQuery({
    variables,
    skip,
    span,
}: {
    variables: { from: number; to: number; token: string };
    skip: boolean;
    span: "Hour" | "Day";
}) {
    const { uniswapInfoClient } = useClients();

    return useSWR([`uniswapToken${span}Query`, variables, skip], () => {
        if (skip) return null;
        return uniswapInfoClient.query<any>({
            query: gql`
                query Token${span}Datas($token: String!, $from: Int!, $to: Int!) {
                    token${span}Datas(orderBy: date, orderDirection: asc, where: { token: $token, date_gt: $from, date_lt: $to }) {
                        date
                        token {
                            id
                            symbol
                            name
                            decimals
                            volumeUSD
                            totalValueLockedUSD
                            feesUSD
                            txCount
                        }
                        feesUSD
                        totalValueLockedUSD
                        volumeUSD
                        id
                        date
                        open
                        high
                        low
                        close
                        priceUSD
                        totalValueLocked
                    }
                }
            `,
            variables: {
                ...variables,
                token: uniswapPlaceholderTokens[variables.token],
            },
        });
    });
}
