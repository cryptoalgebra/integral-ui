import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.studio.thegraph.com/query/78728/katana-v-4-analytics/v0.0.1",
    "https://api.studio.thegraph.com/query/78728/katana-v-4-blocks/v0.0.1",
    "https://api.studio.thegraph.com/query/78728/katana-v-4-farming/v0.0.1",
  ],
  documents: "src/graphql/queries/!(*.d).{ts,tsx}",
  generates: {
    "src/graphql/generated/graphql.tsx": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withResultType: true,
      },
    },
  },
};

export default config;
