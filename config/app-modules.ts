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

    [AppFeatureModule.CustomPools]: true,
    [AppFeatureModule.Analytics]: true,
    [AppFeatureModule.Farming]: true,
    [AppFeatureModule.LimitOrders]: true,
    [AppFeatureModule.ALM]: true,

    [AppFeatureModule.VE_33]: false,

    [AppFeatureModule.BoostedPools]: true,
};
