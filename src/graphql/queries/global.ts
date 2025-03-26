import { gql } from "@apollo/client";

export const BUNDLE_FRAGMENT = gql`
    fragment BundleFields on Bundle {
        id
        maticPriceUSD
    }
`;

export const NATIVE_PRICE = gql`
    query NativePrice {
        bundles {
            ...BundleFields
        }
    }
`;
