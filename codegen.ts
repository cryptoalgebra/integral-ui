import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.goldsky.com/api/public/project_cmafph25ltm5g01yv3vr7bsoe/subgraphs/analytics/1.0.0/gn",
    "https://api.goldsky.com/api/public/project_cmafph25ltm5g01yv3vr7bsoe/subgraphs/blocks/1.0.0/gn",
    "https://api.goldsky.com/api/public/project_cmafph25ltm5g01yv3vr7bsoe/subgraphs/farms/1.0.0/gn",
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
