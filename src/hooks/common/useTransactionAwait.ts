import { useToast } from "@/components/ui/use-toast";
import { useUserState } from "@/state/userStore";
import { useEffect } from "react";
import { Address, useWaitForTransaction, useWatchPendingTransactions } from "wagmi";

export function useTransitionAwait(hash: Address | undefined, title: string, description?: string) {

    const { pendingTransactions, actions: { updatePendingTransaction } } = useUserState()

    const { toast } = useToast()

    const { data, isError, isLoading, isSuccess } = useWaitForTransaction({
        hash
    })

    useEffect(() => {
        if (isLoading) {
            toast({
                title,
                description: description || 'Transaction was sent!'
            })
        }
    }, [isLoading])

    useEffect(() => {
        if (isLoading) {
            toast({
                title,
                description: description || 'Transaction failed'
            })
        }
    }, [isError])

    useEffect(() => {
        if (isSuccess) {
            toast({
                title,
                description: description || 'Transaction successed!'
            })
        }
    }, [isSuccess])

}  