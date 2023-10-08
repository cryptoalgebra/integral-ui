import { gql } from "@apollo/client";

export const TOKEN_FRAGMENT = gql`
    fragment TokenFields on Token {
        id
        symbol
        name
        decimals
        derivedMatic
    }
`

export const SINGLE_TOKEN = gql`
    query SingleToken($tokenId: ID!){
        token(id: $tokenId) {
            ...TokenFields
        }
    }
`