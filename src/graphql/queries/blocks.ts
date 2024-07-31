import { gql } from "@apollo/client"


export const GET_BLOCKS = (timestamps: string[]) => {
    let queryString = 'query blocks {'
    queryString += timestamps.map((timestamp) => {
        return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp + 600
            } }) {
            number
          }`
    })
    queryString += '}'
    return gql(queryString)
}
