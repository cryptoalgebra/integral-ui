import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.studio.thegraph.com/query/81732/primex-dex-analytics-monad-testnet/v1.0.0",
    "https://api.studio.thegraph.com/query/81732/primex-dex-blocks-monad-testnet/v0.0.1",
    "https://api.studio.thegraph.com/query/81732/primex-dex-farming-monad-testnet/v1.0.0",
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
