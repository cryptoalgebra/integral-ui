import { gql } from "graphql-request";

export const GET_BLOCK_BY_TIMESTAMP = gql`
    query GetBlockByTimestamp($timestampFrom: BigInt!, $timestampTo: BigInt!) {
        blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gte: $timestampFrom, timestamp_lte: $timestampTo }) {
            number
            timestamp
        }
    }
`;
