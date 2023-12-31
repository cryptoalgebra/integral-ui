import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import dayjs from 'dayjs'

/**
 * Used to get large amounts of data when
 * @param query
 * @param localClient
 * @param vars - any variables that are passed in every query
 * @param values - the keys that are used as the values to map over if
 * @param skipCount - amount of entities to skip per query
 */
export async function splitQuery<T>(
    query: any,
    client: ApolloClient<NormalizedCacheObject>,
    vars: any[],
    values: any[],
    skipCount = 1000
) {
    let fetchedData: { [key: string]: T } = {}
    let allFound = false
    let skip = 0
    try {
        while (!allFound) {
            let end = values.length
            if (skip + skipCount < values.length) {
                end = skip + skipCount
            }
            const sliced = values.slice(skip, end)
            const result = await client.query<any>({
                query: query(...vars, sliced),
                fetchPolicy: 'network-only'
            })
            fetchedData = {
                ...fetchedData,
                ...result.data
            }
            if (Object.keys(result.data).length < skipCount || skip + skipCount > values.length) {
                allFound = true
            } else {
                skip += skipCount
            }
        }
        return fetchedData
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export function useDeltaTimestamps(): [number, number, number, number] {
    const utcCurrentTime = dayjs()
    const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
    const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
    const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
    const tMonth = utcCurrentTime.subtract(1, 'month').startOf('minute').unix()
    return [t1, t2, tWeek, tMonth]
}
