/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REOWN_PROJECT_ID?: string;
    readonly VITE_GRAPH_API_KEY?: string;
    readonly VITE_KYC_DEMO_SIGNER_PRIVATE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
