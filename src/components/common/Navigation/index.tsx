import { cn } from "@/utils";
import { ArrowUpDown, Droplets, LucideLineChart } from "lucide-react";
import { matchPath, NavLink, useLocation } from "react-router-dom";

const PATHS = {
    SWAP: "/swap",
    LIMIT_ORDERS: "limit-order",
    POOLS: "/pools",
    POOL: "/pool/*",
    ANALYTICS: "/analytics/*",
    VE_TOKEN: "/vetoken/*",
    VOTE: "/vote/*",
};

const menuItems = [
    {
        title: "Swap",
        link: "/swap",
        active: [PATHS.SWAP, PATHS.LIMIT_ORDERS],
        icon: <ArrowUpDown size={14} />,
    },
    {
        title: "Liquidity",
        link: "/pools",
        active: [PATHS.POOLS, PATHS.POOL],
        icon: <Droplets size={14} />,
    },
    {
        title: "Earn",
        link: "/earn",
        active: [],
        icon: <LucideLineChart size={14} />,
        disabled: true,
    },
    {
        title: "Analytics",
        link: "/analytics",
        active: [],
        icon: <LucideLineChart size={14} />,
        disabled: true,
    },

    // ...(enabledModules.Ve33Module
    //     ? [
    //           {
    //               title: "veTOKEN",
    //               link: "/vetoken",
    //               active: [PATHS.VE_TOKEN],
    //               icon: <ContrastIcon size={20} />,
    //           },
    //           {
    //               title: "Vote",
    //               link: "/vote",
    //               active: [PATHS.VOTE],
    //               icon: <Vote size={20} />,
    //           },
    //       ]
    //     : []),
    // enabledModules.AnalyticsModule && {
    //     title: "Analytics",
    //     link: "/analytics",
    //     active: [PATHS.ANALYTICS],
    //     icon: <LucideLineChart size={20} />,
    // },
].filter(Boolean) as { title: string; link: string; active: string[]; icon?: React.ReactNode; disabled?: boolean }[];

export function NavButtons() {
    const { pathname } = useLocation();

    const getClasses = (paths: string[], disabled?: boolean) =>
        cn(
            "flex max-md:flex-col items-center justify-center gap-1.5 w-fit md:min-w-10 rounded-md p-2 text-xs font-medium transition-colors duration-200 md:px-4 tracking-[2px] uppercase",
            disabled
                ? "text-text-muted pointer-events-none opacity-50"
                : paths.some((path) => matchPath(path, pathname))
                ? "bg-panel"
                : "text-text-muted hover:text-text hover:bg-panel",
        );

    return (
        <>
            {menuItems.map((item) => {
                const content = <span>{item.title}</span>;

                return item.disabled ? (
                    <span key={`nav-item-${item.link}`} className={getClasses(item.active, item.disabled)}>
                        {content}
                    </span>
                ) : (
                    <NavLink key={`nav-item-${item.link}`} to={{ pathname: item.link }} className={getClasses(item.active, item.disabled)}>
                        {content}
                    </NavLink>
                );
            })}
        </>
    );
}
export function Navigation() {
    return (
        <ul className="flex w-full h-full gap-6 whitespace-nowrap items-center max-md:hidden">
            <NavButtons />
        </ul>
    );
}
export function MobileNavigation() {
    return (
        <nav className="fixed bottom-4 left-1/2 z-50 flex h-full max-h-[40px] -translate-x-1/2 gap-2 rounded-lg border border-border bg-card p-1 shadow-[0_18px_45px_-26px_var(--color-border)] md:hidden">
            <NavButtons />
        </nav>
    );
}
