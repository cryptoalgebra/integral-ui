import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Address, useWaitForTransaction } from "wagmi";

export function useTransitionAwait(hash: Address | undefined, title: string, description?: string) {

    // const { pendingTransactions, actions: { updatePendingTransaction } } = useUserState()

    const { toast } = useToast()

    const { data, isError, isLoading, isSuccess } = useWaitForTransaction({
        hash
    })

    useEffect(() => {
        if (isLoading) {
            toast({
                title: title,
                description: description || 'Transaction was sent',
                action: <ToastAction altText="View on explorer" asChild>
                    <Link to={'https://goerli.etherscan.io'} target={'_blank'} className="border-none gap-2 hover:bg-transparent hover:text-blue-400">
                        View on explorer
                        <ExternalLinkIcon size={16} />
                    </Link>
                </ToastAction>,
            })
        }
    }, [isLoading])

    useEffect(() => {
        if (isLoading) {
            toast({
                title: title,
                description: description || 'Transaction failed',
                action: <ToastAction altText="View on explorer" asChild>
                    <Link to={'https://goerli.etherscan.io'} target={'_blank'} className="border-none gap-2 hover:bg-transparent hover:text-blue-400">
                        View on explorer
                        <ExternalLinkIcon size={16} />
                    </Link>
                </ToastAction>,
            })
        }
    }, [isError])

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: title,
                description: description || 'Transaction approved',
                action: <ToastAction altText="View on explorer" asChild>
                    <Link to={'https://goerli.etherscan.io'} target={'_blank'} className="border-none gap-2 hover:bg-transparent hover:text-blue-400">
                        View on explorer
                        <ExternalLinkIcon size={16} />
                    </Link>
                </ToastAction>,
            })
        }
    }, [isSuccess])

    return {
        data, 
        isError, 
        isLoading, 
        isSuccess
    }

}  