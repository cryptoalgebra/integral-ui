import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        'https://api.studio.thegraph.com/proxy/50593/integral-v1-1/version/latest',
        'https://api.thegraph.com/subgraphs/name/iliaazhel/goerli-blocks',
        'https://api.thegraph.com/subgraphs/name/iliaazhel/farming-test',
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
