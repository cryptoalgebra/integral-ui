export enum AppFeatureModule {
    CustomPools = "customPools",
    SmartRouter = "smartRouter",
    Analytics = "analytics",
    Farming = "farming",
    LimitOrders = "limitOrders",
    ALM = "alm",
}

export const moduleNameToPath: Record<AppFeatureModule, string> = {
    [AppFeatureModule.CustomPools]: "CustomPoolsModule",
    [AppFeatureModule.SmartRouter]: "SmartRouterModule",
    [AppFeatureModule.Analytics]: "AnalyticsModule",
    [AppFeatureModule.Farming]: "FarmingModule",
    [AppFeatureModule.LimitOrders]: "LimitOrdersModule",
    [AppFeatureModule.ALM]: "ALMModule",
};

/* configure enabled modules here */
export const enabledModules: Record<AppFeatureModule, boolean> = {
    [AppFeatureModule.CustomPools]: false,
    [AppFeatureModule.SmartRouter]: false,

    [AppFeatureModule.Analytics]: true,
    [AppFeatureModule.Farming]: false,
    [AppFeatureModule.LimitOrders]: false,
    [AppFeatureModule.ALM]: false,
};
