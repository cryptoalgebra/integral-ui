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

export const POSITION_SNAPSHOTS = gql`
    query PositionSnapshots($tokenId: String!) {
        positionSnapshots(where: { position: $tokenId }) {
            id
            depositedToken0
            depositedToken1
            withdrawnToken0
            withdrawnToken1
            collectedFeesToken0
            collectedFeesToken1
            timestamp
            transaction {
                id
            }
        }
    }
`