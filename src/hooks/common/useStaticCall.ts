import { useEffect, useState } from "react";
import { Abi } from "viem";
import { Address, useAccount } from "wagmi"
import { watchReadContract, readContract } from "wagmi/actions"

interface StaticCallProps {
    address: Address;
    abi: Abi;
    functionName: string;
    args: any;
}

export function useStaticCall({ address, abi, functionName, args }: StaticCallProps) {

    const { address: account } = useAccount()

    const [callData, setCallData] = useState<any>()

    const unwatch = watchReadContract({
        account,
        address,
        abi,
        functionName,
        args,
        listenToBlock: true
    }, (d) => {
    })

    useEffect(() => {

        readContract({
            account,
            address,
            abi,
            functionName,
            args,
        }).then(setCallData).catch(err => console.error('STATIC CALL', err))

    }, [])

    return {
        data: callData
    }

}