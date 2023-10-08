import { NavLink } from "react-router-dom";

const menuItems = [
    {
        title: 'Swap',
        link: '/swap'
    },
    {
        title: 'Pools',
        link: '/pools'
    }
]

const Navigation = () => {

    return <nav>
        <ul className="flex">
            {
                menuItems.map((item) => <NavLink
                    key={`nav-item-${item.link}`}
                    to={item.link}
                    className={({ isActive, isPending }) =>
                        isActive
                            ? "text-blue-500"
                            : isPending
                                ? "text-yellow-500"
                                : ""
                    }
                >{item.title}</NavLink>)
            }
        </ul>
    </nav>

}

export default Navigation;