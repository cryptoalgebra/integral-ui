import type { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";
import { DEFAULT_CHAIN_ID, INFO_GRAPH_URL, LIMIT_ORDERS_GRAPH_URL, FARMING_GRAPH_URL } from "./config";

const INFO_GRAPH = INFO_GRAPH_URL[DEFAULT_CHAIN_ID];
const FARMING_GRAPH = FARMING_GRAPH_URL[DEFAULT_CHAIN_ID];
const LIMIT_ORDERS_GRAPH = LIMIT_ORDERS_GRAPH_URL[DEFAULT_CHAIN_ID];

const schema = [
  INFO_GRAPH,
  FARMING_GRAPH,
  LIMIT_ORDERS_GRAPH,
].filter(Boolean) as string[];

const documents = [
  "src/graphql/queries/*.{ts,tsx}",
  !LIMIT_ORDERS_GRAPH && "!src/graphql/queries/limit-orders.ts",
].filter(Boolean) as string[];

const config: CodegenConfig = {
    overwrite: true,
    schema,
    documents,
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
