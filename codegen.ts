import type { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        process.env.VITE_INFO_GRAPH,
        process.env.VITE_LIMIT_ORDERS_GRAPH,
        process.env.VITE_BLOCKS_GRAPH,
        process.env.VITE_FARMING_GRAPH,
    ] as string[],
    documents: "src/graphql/queries/!(*.d).{ts,tsx}",
    generates: {
        "src/graphql/generated/graphql.tsx": {
            plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
            config: {
                withHooks: true,
                withResultType: true,
            },
        },
    },
};

export default config;
