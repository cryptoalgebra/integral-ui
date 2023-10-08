import Account from "@/components/wallet/Account"
import Navigation from "@/components/common/Navigation"

const Header = () => {

    return (
        <header className="flex justify-between gap-4">
            <div>Algebra Integral</div>
            <Navigation/>
            <Account/>
        </header>
    )
}

export default Header