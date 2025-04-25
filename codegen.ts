import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        'https://api.studio.thegraph.com/query/109724/holesky_test_algebra_integral_2/v0.0.2',
        'https://api.studio.thegraph.com/query/50593/goerli-blocks/version/latest',
        'https://api.studio.thegraph.com/query/109724/holesky_test_algebra_integral_2_farming/v0.0.2',
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
