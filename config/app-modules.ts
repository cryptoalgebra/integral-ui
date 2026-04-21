export enum AppFeatureModule {
    SmartRouter = "SmartRouterModule",

    CustomPools = "CustomPoolsModule",
    Analytics = "AnalyticsModule",
    Farming = "FarmingModule",
    LimitOrders = "LimitOrdersModule",
    ALM = "ALMModule",

    VE_33 = "Ve33Module",

    BoostedPools = "BoostedPoolsModule",
}

/* configure enabled modules here */
export const enabledModules: Record<AppFeatureModule, boolean> = {
    [AppFeatureModule.SmartRouter]: false,

    [AppFeatureModule.CustomPools]: false,
    [AppFeatureModule.Analytics]: false,
    [AppFeatureModule.Farming]: false,
    [AppFeatureModule.LimitOrders]: false,
    [AppFeatureModule.ALM]: false,

    [AppFeatureModule.VE_33]: false,

    [AppFeatureModule.BoostedPools]: false,
};
