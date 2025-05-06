import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.goldsky.com/api/public/project_cm8gyxv0x02qv01uphvy69ey6/subgraphs/avax-fuji-analytics/v0.0.1/gn",
    "https://api.goldsky.com/api/public/project_cm8gyxv0x02qv01uphvy69ey6/subgraphs/avax-fuji-blocks/v0.0.1/gn",
    "https://api.goldsky.com/api/public/project_cm8gyxv0x02qv01uphvy69ey6/subgraphs/avax-fuji-farms/v0.0.1/gn",
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
