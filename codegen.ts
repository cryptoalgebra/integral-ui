import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        'https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/analytics-testnet/v1.0.0/gn',
        'https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/blocks-testnet/v1.0.0/gn',
        'https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/farms-testnet/v1.0.0/gn',
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
