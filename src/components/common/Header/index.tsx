import Navigation from "@/components/common/Navigation"
import ThenaLogo from "@/assets/thena-logo.svg"
import { NavLink } from "react-router-dom"
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id"
import { Button } from "@/components/ui/button"
import { UnplugIcon, WalletIcon } from "lucide-react"

const Header = () => <header className="sticky top-4 z-10 grid grid-cols-3 justify-between items-center py-1 px-2 bg-card border border-card-border rounded-3xl gap-4">
    <Algebra />
    <Navigation />
    <Account />
</header>

const Algebra = () => <div className="flex items-center gap-2">
    <NavLink to={'/'}>
        <div className="flex items-center gap-2 py-1 pl-2 pr-3 bg-card rounded-3xl hover:bg-card-hover duration-200">
            <div className="flex items-center justify-center gap-2 w-[100px] h-[20px] rounded-full">
                <img src={ThenaLogo} width={100} />
            </div>
        </div>
    </NavLink>
</div>

const Account = () => {

    const { open } = useWeb3Modal()

    const { selectedNetworkId } = useWeb3ModalState()

    if (selectedNetworkId !== DEFAULT_CHAIN_ID) return <div className="flex justify-end">
        <Button onClick={() => open({
            view: 'Networks'
        })} size={'sm'} variant={'destructive'} className="hidden md:block">Connect to BNB Testnet</Button>
        <Button onClick={() => open({
            view: 'Networks'
        })} size={'icon'} variant={'icon'} className="md:hidden text-red-500">
            <UnplugIcon />
        </Button>
    </div>

    return <div className="flex justify-end gap-4 pt-[2px] whitespace-nowrap">
        <div className="hidden lg:block">
            <w3m-network-button />
        </div>
        <div className="hidden md:block">
            <w3m-button />
        </div>
        <div className="md:hidden">
            <Button onClick={() => open()} variant={'icon'} size={'icon'}>
                <WalletIcon />
            </Button>
        </div>
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