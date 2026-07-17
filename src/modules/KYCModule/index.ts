import * as KYCHooks from "./hooks";
import * as KYCComponents from "./components";
import * as KYCUtils from "./utils";

const KYCModule = {
    hooks: KYCHooks,
    components: KYCComponents,
    utils: KYCUtils,
};

export default KYCModule;
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./utils";
