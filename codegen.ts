import type { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";
import { INFO_GRAPH_URL, LIMIT_ORDERS_GRAPH_URL, BLOCKS_GRAPH_URL, FARMING_GRAPH_URL } from "./config";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Use Base Sepolia for codegen since Hyperliquid subgraphs might not all be deployed yet
const BASE_SEPOLIA_CHAIN_ID = ChainId.BaseSepolia;

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        INFO_GRAPH_URL[BASE_SEPOLIA_CHAIN_ID],
        LIMIT_ORDERS_GRAPH_URL[BASE_SEPOLIA_CHAIN_ID],
        BLOCKS_GRAPH_URL[BASE_SEPOLIA_CHAIN_ID],
        FARMING_GRAPH_URL[BASE_SEPOLIA_CHAIN_ID],
    ],
    documents: "src/graphql/queries/!(*.d).{ts,tsx}",
    generates: {
        "src/graphql/generated/graphql.tsx": {
            plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
            config: {
                withHooks: true,
                withResultType: true,
                scalars: {
                    BigInt: "string",
                    BigDecimal: "string",
                    Bytes: "string",
                    Int8: "number",
                    Int: "number",
                    Timestamp: "number",
                },
            },
        },
    },
};

export default config;
