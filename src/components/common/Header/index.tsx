import Navigation from "@/components/common/Navigation"
import AlgebraLogo from "@/assets/algebra-logo.svg"
import AlgebraIntegral from "@/assets/algebra-itegral.svg"
import { NavLink } from "react-router-dom"

const Header = () => {

    return (
        <header className="grid grid-cols-3 justify-between items-center py-1 px-2 bg-card border border-card-border rounded-3xl gap-4">
            <Algebra />
            <Navigation />
            <Account />
        </header>
    )
}

const Algebra = () => <div className="flex items-center gap-2">
     <NavLink to={'/'}>
        <div className="flex items-center gap-2 py-1 pl-2 pr-3 bg-card rounded-3xl hover:bg-card-hover">
            <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full">
                <img src={AlgebraLogo} width={25} height={25} />
            </div>
            <img src={AlgebraIntegral} width={140} height={25} />
        </div>
        </NavLink>
    </div>

const Account = () => {

    return <div className="flex justify-end gap-4 pt-[2px]">
        <w3m-network-button />
        <w3m-button />
    </div>
}

// const Transactions = () => {

//     const [pendingTransactions, setPendingTransactions] = useState<OnTransactionsParameter>([])

//     useWatchPendingTransactions({
//         listener: (hashes) => setPendingTransactions(hashes)
//     })

//     return <Avatar className="w-[35px] h-[35px]">
//         <AvatarFallback>{pendingTransactions.length}</AvatarFallback>
//     </Avatar>

// }

export default Header