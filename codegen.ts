import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        'https://api.studio.thegraph.com/query/90229/monark-analytics/v0.0.1',
        'https://api.studio.thegraph.com/query/90229/monark-farming/v0.0.1',
        'https://api.studio.thegraph.com/query/90229/monark-farming/v0.0.1',
    ],
    documents: 'src/graphql/queries/!(*.d).{ts,tsx}',
    generates: {
        'src/graphql/generated/graphql.tsx': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ],
            config: {
                withHooks: true,
                withResultType: true,
            },
        },
    },
};

export default config;
