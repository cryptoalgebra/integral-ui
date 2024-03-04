import { NavLink, matchPath, useLocation } from "react-router-dom";

const PATHS = {
    SWAP: '/swap',
    POOLS: '/pools'
}

const menuItems = [
    {
        title: 'Swap',
        link: '/swap',
        active: [PATHS.SWAP]
    },
    {
        title: 'Pools',
        link: '/pools',
        active: [PATHS.POOLS]
    }
]

const Navigation = () => {

    const { pathname } = useLocation()

    const setNavlinkClasses = (paths: string[]) => paths.some((path) => matchPath(path, pathname)) ? "text-primary-text bg-muted-primary" : "hover:bg-card-hover";

    return <nav>
        <ul className="flex justify-center gap-1 rounded-full whitespace-nowrap">
            {
                menuItems.map((item) => <NavLink
                    key={`nav-item-${item.link}`}
                    to={item.link}
                    className={`${setNavlinkClasses(item.active)} py-2 px-4 rounded-3xl font-semibold select-none duration-200`}
                >{item.title}</NavLink>)
            }
        </ul>
    </nav>

}

export default Navigation;