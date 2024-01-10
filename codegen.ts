
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.goldsky.com/api/public/project_clqew1h1z5jgg01zkhgs7bib9/subgraphs/bera-analytics/1.0.0/gn",
    "https://api.goldsky.com/api/public/project_clqew1h1z5jgg01zkhgs7bib9/subgraphs/bera-blocks/1.0.0/gn"
  ],
  documents: "src/graphql/queries/!(*.d).{ts,tsx}",
  generates: {
    "src/graphql/generated/graphql.tsx": {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withResultType: true
      }
    }
  }
};

export default config;