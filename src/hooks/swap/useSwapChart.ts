import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

import dayjs from 'dayjs'
import { getBlocksFromTimestamps } from "@/graphql/utils/getBlocksFromTimestamps"

const mainnetInfoClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    cache: new InMemoryCache(),
});

const mainnetBlocksClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    cache: new InMemoryCache()
})

const CHART_STEPS = {
    day: 3600,
    week: 3600,
    month: 3600 * 24,
}

export function useSwapChart() {

    async function fetchPoolPriceData(address: string, span: 'day' | 'week' | 'month') {
        return fetchPriceData(address, span, 'pool')
    }

    async function fetchTokenPriceData(address: string, span: 'day' | 'week' | 'month') {
        return fetchPriceData(address, span, 'token')
    }

    async function fetchPriceData(
        address: string,
        span: 'day' | 'week' | 'month',
        field: string
    ): Promise<{
        data: any[]
        error: boolean
    }> {
        // start and end bounds

        const utcCurrentTime = dayjs()

        const startTimestamp = utcCurrentTime.subtract(1, span).startOf('hour').unix()

        const fetchEntity = span === 'day' || span === 'week' ? 'Hour' : 'Day'

        const timestamp = span === 'day' || span === 'week' ? 'periodStartUnix' : 'date'

        try {
            const endTimestamp = utcCurrentTime.unix()

            if (!startTimestamp) {
                console.log('Error constructing price start timestamp')
                return {
                    data: [],
                    error: false,
                }
            }

            const timestamps: any = []
            let time = startTimestamp
            while (time <= endTimestamp) {
                timestamps.push(time)
                time += CHART_STEPS[span]
            }

            if (timestamps.length === 0) {
                return {
                    data: [],
                    error: false,
                }
            }

            const blocks = await getBlocksFromTimestamps(timestamps, mainnetBlocksClient, 500)
            if (!blocks || blocks.length === 0) {
                console.log('Error fetching blocks')
                return {
                    data: [],
                    error: false,
                }
            }

            let data: {
                periodStartUnix: number
                high: string
                low: string
                open: string
                close: string
            }[] = []
            let skip = 0
            let allFound = false
            while (!allFound) {
                const {
                    data: priceData,
                    errors,
                    loading,
                } = await mainnetInfoClient.query<any>({
                    query: gql`
                        query ${field}${fetchEntity}Datas($startTime: Int!, $skip: Int!, $address: Bytes!) {
                            ${field}${fetchEntity}Datas(
                            first: 1000
                            skip: $skip
                            where: { ${field}: $address, ${timestamp}_gt: $startTime }
                            orderBy: ${timestamp}
                            orderDirection: asc
                          ) {
                            periodStartUnix: ${timestamp}
                            high
                            low
                            open
                            close
                            ${field === 'pool'
                            ? `token0Price
                            token1Price`
                            : 'priceUSD'
                        }
                          }
                        }
                      `,
                    variables: {
                        address: address.toLowerCase(),
                        startTime: startTimestamp,
                        skip,
                    },
                    fetchPolicy: 'no-cache',
                })

                if (!loading) {
                    skip += 100
                    if ((priceData && priceData[`${field}${fetchEntity}Datas`].length < 100) || errors) {
                        allFound = true
                    }
                    if (priceData) {
                        data = data.concat(priceData[`${field}${fetchEntity}Datas`])
                    }
                }
            }

            const periods = data.map((v) => v.periodStartUnix)

            return {
                data: data.filter((v, idx) => !periods.includes(v.periodStartUnix, idx + 1)),
                error: false,
            }
        } catch (e) {
            console.log(e)
            return {
                data: [],
                error: true,
            }
        }
    }


    return {
        fetchPoolPriceData, fetchTokenPriceData
    }

}