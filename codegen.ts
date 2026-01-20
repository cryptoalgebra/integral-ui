import type { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";
import { DEFAULT_CHAIN_ID, INFO_GRAPH_URL, LIMIT_ORDERS_GRAPH_URL, FARMING_GRAPH_URL, BLOCKS_GRAPH_URL } from "./config";

const config: CodegenConfig = {
    overwrite: true,
    schema: [INFO_GRAPH_URL[DEFAULT_CHAIN_ID], LIMIT_ORDERS_GRAPH_URL[DEFAULT_CHAIN_ID], FARMING_GRAPH_URL[DEFAULT_CHAIN_ID], BLOCKS_GRAPH_URL[DEFAULT_CHAIN_ID]],
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
