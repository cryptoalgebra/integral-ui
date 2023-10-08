import { gql } from "@apollo/client"
import { useClients } from "../graphql/useClients"

import dayjs from 'dayjs'
import { getBlocksFromTimestamps } from "@/graphql/utils/getBlocksFromTimestamps"

export function useSwapChart() {

    const { infoClient, blocksClient } = useClients()

    async function fetchPoolPriceData(address: string,
        span: 'day' | 'week') {
        return fetchPriceData(address, span, 'pool')
    }

    async function fetchTokenPriceData(address: string,
        span: 'day' | 'week') {
        return fetchPriceData(address, span, 'token')
    }

    async function fetchPriceData(
        address: string,
        span: 'day' | 'week',
        field: string
    ): Promise<{
        data: any[]
        error: boolean
    }> {
        // start and end bounds

        const utcCurrentTime = dayjs()

        const startTimestamp = utcCurrentTime.subtract(1, span).startOf('hour').unix()

        try {
            const endTimestamp = utcCurrentTime.unix()

            if (!startTimestamp) {
                console.log('Error constructing price start timestamp')
                return {
                    data: [],
                    error: false,
                }
            }

            // create an array of hour start times until we reach current hour
            const timestamps: any = []
            let time = startTimestamp
            while (time <= endTimestamp) {
                timestamps.push(time)
                time += 3600
            }

            // backout if invalid timestamp format
            if (timestamps.length === 0) {
                return {
                    data: [],
                    error: false,
                }
            }

            // fetch blocks based on timestamp
            const blocks = await getBlocksFromTimestamps(timestamps, blocksClient, 500)
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
                const { data: priceData, errors, loading } = await infoClient.query<any>({
                    query: gql`
                    query ${field}HourDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
                        ${field}HourDatas(
                        first: 100
                        skip: $skip
                        where: { ${field}: $address, periodStartUnix_gt: $startTime }
                        orderBy: periodStartUnix
                        orderDirection: asc
                      ) {
                        periodStartUnix
                        high
                        low
                        open
                        close
                        ${field === 'pool'
                            ? `token0Price 
                        token1Price`
                            : 'priceUSD'}
                      }
                    }
                  `,
                    variables: {
                        address: address,
                        startTime: startTimestamp,
                        skip,
                    },
                    fetchPolicy: 'no-cache',
                })

                if (!loading) {
                    skip += 100
                    if ((priceData && priceData[`${field}HourDatas`].length < 100) || errors) {
                        allFound = true
                    }
                    if (priceData) {
                        data = data.concat(priceData[`${field}HourDatas`])
                    }
                }
            }

            return {
                data,
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