import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useBalance } from "wagmi";

const ConnectWallet = () => {

    const { open } = useWeb3Modal()

    return <Button onClick={() => open()}>Connect Wallet</Button>

}

interface AddressProps {
    address: Account
}

type BalanceProps = AddressProps

const Address = ({ address }: AddressProps) => {

    // Wallet disconnect

    return <Button>{address}</Button>

}

const Balance = ({ address }: BalanceProps) => {

    const { data: balance, isLoading, isError } = useBalance({
        address,
        chainId: DEFAULT_CHAIN_ID,
        watch: true
    })

    if (isLoading) return 'Loading...'

    if (isError) return 'Error'

    return <Button>
        <span>{balance?.formatted}</span>
        <span>{balance?.symbol}</span>
    </Button>
    

}

const Account = () => {

    const { address } = useAccount()


    if (!address) return <ConnectWallet/> 

    return <div className="flex gap-4">
        <Balance address={address} />
        <Address address={address} />
    </div> 

}

export default Account;