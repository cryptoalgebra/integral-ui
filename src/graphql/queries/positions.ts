import { gql } from "@apollo/client";

export const SINGLE_POSITION = gql`
    query SinglePosition($tokenId: ID!) {
        position(id: $tokenId) {
            id
            collectedFeesToken1
            collectedFeesToken0
            transaction {
                timestamp
            }
        }
    }
`;

export const POSITION_ANALYTICS = gql`
    query PositionAnalytics($tokenId: ID!) {
        position(id: $tokenId) {
            id
            depositedToken0
            depositedToken1
            withdrawnToken0
            withdrawnToken1
            collectedFeesToken0
            collectedFeesToken1
            transaction {
                mints(first: 1) {
                    amount
                    amount0
                    amount1
                    amountUSD
                    timestamp
                    tickLower
                    tickUpper
                }
            }
        }
    }
`;

export const BATCH_POSITIONS = gql`
    query BatchPositions($tokenIds: [ID!]!) {
        positions(where: { id_in: $tokenIds }) {
            id
            collectedFeesToken0
            collectedFeesToken1
            transaction {
                timestamp
            }
        }
    }
`;
