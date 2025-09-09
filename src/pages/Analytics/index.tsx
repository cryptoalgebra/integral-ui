import PageContainer from "@/components/common/PageContainer";
import AnalyticsModule from "@/modules/AnalyticsModule";
import { ReactNode } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";

const { DexCharts } = AnalyticsModule.components;

const PATHS = {
    BASE: "/analytics",
    JETTONS: "/analytics/tokens",
    TRANSACTIONS: "/analytics/transactions",
};

const tabs = [
    {
        title: "Pools",
        link: "/analytics",
        active: [PATHS.BASE],
    },
    {
        title: "Tokens",
        link: "/analytics/tokens",
        active: [PATHS.JETTONS],
    },
    {
        title: "Transactions",
        link: "/analytics/transactions",
        active: [PATHS.TRANSACTIONS],
    },
];

function Navigation() {
    const { pathname, search } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        paths.some((path) => matchPath(path, pathname)) ? "text-primary-200" : "hover:text-primary-200";

    return (
        <nav className="w-full text-xl pb-3 border-b my-6">
            <ul className="flex gap-8 whitespace-nowrap">
                {tabs.map((tab) => (
                    <NavLink
                        key={`explore-nav-item-${tab.link}`}
                        to={{ pathname: tab.link, search }}
                        className={`${setNavlinkClasses(tab.active)} select-none font-semibold duration-200`}
                    >
                        {tab.title}
                    </NavLink>
                ))}
            </ul>
        </nav>
    );
}

function AnalyticsPage({ children }: { children: ReactNode }) {
    return (
        <PageContainer>
            <div className="flex flex-col items-start w-full">
                <DexCharts />
                <Navigation />
                <div className="pb-5 bg-card border border-card-border/60 rounded-xl w-full">{children}</div>
            </div>
        </PageContainer>
    );
}

export default AnalyticsPage;
