import { cn } from "@/utils";
import { ArrowUpDown } from "lucide-react";
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
        title: "Trade",
        link: "/swap",
        active: [PATHS.SWAP, PATHS.LIMIT_ORDERS],
        icon: <ArrowUpDown size={20} />,
    },
    // {
    //     title: "Pools",
    //     link: "/pools",
    //     active: [PATHS.POOLS, PATHS.POOL],
    //     icon: <Droplets size={20} />,
    // },
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
].filter(Boolean) as { title: string; link: string; active: string[]; icon?: React.ReactNode }[];

export function NavButtons() {
    const { pathname } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        paths.some((path) => matchPath(path, pathname)) ? "text-primary" : "text-text-muted hover:text-text";

    return (
        <>
            {menuItems.map((item) => (
                <NavLink
                    key={`nav-item-${item.link}`}
                    to={{ pathname: item.link }}
                    className={cn(
                        "flex items-center justify-center gap-1.5 w-fit md:min-w-10 rounded-full px-1 py-2 text-[13px] font-medium transition-colors duration-200 md:px-0",
                        setNavlinkClasses(item.active),
                    )}
                >
                    <div className="text-lg md:hidden">{item.icon}</div>
                    <span className="max-md:text-sm">{item.title}</span>
                </NavLink>
            ))}
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
        <nav className="fixed bottom-4 left-1/2 z-50 flex h-full max-h-[40px] -translate-x-1/2 gap-2 rounded-full border border-border bg-card p-2 shadow-[0_18px_45px_-26px_var(--color-border)] md:hidden">
            <NavButtons />
        </nav>
    );
}
