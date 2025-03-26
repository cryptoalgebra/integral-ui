import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        "https://api.studio.thegraph.com/query/50593/clamm-analytics/version/latest ",
        "https://api.studio.thegraph.com/query/50593/clamm-blocks/version/latest",
        "https://api.studio.thegraph.com/query/50593/clamm-farms/version/latest",
        "https://api.studio.thegraph.com/query/50593/clamm-limits/version/latest",
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
