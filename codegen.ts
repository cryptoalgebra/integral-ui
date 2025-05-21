import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        'https://api.goldsky.com/api/public/project_cmawqb0uwngmc01vf808d56yz/subgraphs/analytics/v1.0.0/gn',
        'https://api.goldsky.com/api/public/project_cmawqb0uwngmc01vf808d56yz/subgraphs/blocks/v1.0.0/gn',
        'https://api.goldsky.com/api/public/project_cmawqb0uwngmc01vf808d56yz/subgraphs/farms/v1.0.0/gn',
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
