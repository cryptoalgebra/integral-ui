export enum AppFeatureModule {
    SmartRouter = "SmartRouterModule",
    CustomPools = "CustomPoolsModule",
    Analytics = "AnalyticsModule",
    Farming = "FarmingModule",
    LimitOrders = "LimitOrdersModule",
    ALM = "ALMModule",
    NAVHook = "NAVHookModule",
    VE_33 = "Ve33Module",
    BoostedPools = "BoostedPoolsModule",
    Prediction = "PredictionModule",
    KYC = "KYCModule",
}

/* configure enabled modules here */
export const enabledModules: Record<AppFeatureModule, boolean> = {
    [AppFeatureModule.SmartRouter]: false,
    [AppFeatureModule.CustomPools]: false,
    [AppFeatureModule.Analytics]: true,
    [AppFeatureModule.Farming]: true,
    [AppFeatureModule.LimitOrders]: true,
    [AppFeatureModule.ALM]: false,
    [AppFeatureModule.NAVHook]: false,
    [AppFeatureModule.VE_33]: false,
    [AppFeatureModule.BoostedPools]: false,
    [AppFeatureModule.Prediction]: false,
    [AppFeatureModule.KYC]: false,
};
