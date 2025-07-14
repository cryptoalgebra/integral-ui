export enum AppFeatureModule {
    LimitOrders = "limitOrders",
    Analytics = "analytics",
    ALM = "alm",
    Farming = "farming",
}

export const moduleNameToPath: Record<AppFeatureModule, string> = {
    [AppFeatureModule.LimitOrders]: "LimitOrdersModule",
    [AppFeatureModule.Analytics]: "AnalyticsModule",
    [AppFeatureModule.ALM]: "ALMModule",
    [AppFeatureModule.Farming]: "FarmingModule",
};

export const enabledModules: Record<AppFeatureModule, boolean> = {
    [AppFeatureModule.LimitOrders]: false,
    [AppFeatureModule.Analytics]: true,
    [AppFeatureModule.ALM]: false,
    [AppFeatureModule.Farming]: true,
};
