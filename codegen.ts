import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        "https://api.studio.thegraph.com/query/50593/holesky-analytics/version/latest",
        "https://api.studio.thegraph.com/query/50593/holesky-farming/version/latest",
        "https://api.thegraph.com/subgraphs/name/iliaazhel/goerli-blocks",
    ],
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
