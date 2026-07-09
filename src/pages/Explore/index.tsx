import PageContainer from "@/components/common/PageContainer";
import PoolsList from "@/components/pools/PoolsList";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { useReadSecurityRegistryGlobalStatus } from "@/generated";
import { SecurityState } from "@/hooks/pools/usePool";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Link, matchPath, NavLink, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import AnalyticsModule from "@/modules/AnalyticsModule";

const { DexChartsGrid, TokensList, TransactionsList } = AnalyticsModule.components;

const PATHS = {
    POOLS: "/explore",
    TOKENS: "/explore/tokens",
    TRANSACTIONS: "/explore/transactions",
};

const tabs = [
    {
        title: "Pools",
        link: PATHS.POOLS,
        active: [PATHS.POOLS],
    },
    {
        title: "Tokens",
        link: PATHS.TOKENS,
        active: [PATHS.TOKENS],
    },
    {
        title: "Transactions",
        link: PATHS.TRANSACTIONS,
        active: [PATHS.TRANSACTIONS],
    },
];

function ExploreNavigation() {
    const { pathname, search } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        paths.some((path) => matchPath(path, pathname)) ? "text-primary-200" : "hover:text-primary-200";

    return (
        <nav className="w-full border-b pb-3 text-lg">
            <ul className="flex gap-8 whitespace-nowrap">
                {tabs.map((tab) => (
                    <NavLink
                        key={`explore-nav-item-${tab.link}`}
                        to={{ pathname: tab.link, search }}
                        className={`${setNavlinkClasses(tab.active)} select-none font-medium duration-200`}
                    >
                        {tab.title}
                    </NavLink>
                ))}
            </ul>
        </nav>
    );
}

const ExplorePage = () => {
    const { data: globalStatus } = useReadSecurityRegistryGlobalStatus();
    const { pathname } = useLocation();

    const enableActions = globalStatus === SecurityState.ENABLED;

    const activeSection = matchPath(PATHS.TOKENS, pathname) ? "tokens" : matchPath(PATHS.TRANSACTIONS, pathname) ? "transactions" : "pools";

    const sectionContent = {
        pools: <PoolsList isExplore />,
        tokens: <TokensList link="explore/token" />,
        transactions: <TransactionsList />,
    } as const;

    return (
        <PageContainer className="gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <PageTitle
                    title="Explore"
                    description="Discover and compare liquidity pools. Analyze liquidity, fees, and market activity in one place."
                />

                {!enableActions && <SecurityStatusTag status={globalStatus} />}

                {enableActions && (
                    <Button className="w-fit whitespace-nowrap" variant="primary" size="md">
                        <Link className="flex gap-2 items-center" to="/create-pool">
                            <Plus size={18} />
                            Create Pool
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                <DexChartsGrid
                    containerClassName="grid gap-4 lg:grid-cols-2"
                    cardClassName="rounded-lg bg-card"
                    height={200}
                    volumeTitle="Volume"
                />
            </div>

            <ExploreNavigation />

            {sectionContent[activeSection]}
        </PageContainer>
    );
};

export default ExplorePage;
