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
