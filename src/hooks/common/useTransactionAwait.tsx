import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { TransactionToastContent } from "@/components/common/TransactionToastContent";
import { TransactionInfo, usePendingTransactionsStore } from "@/state/pendingTransactionsStore";
import { useAppKitNetwork } from "@reown/appkit/react";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

export const ViewTxOnExplorer = ({ hash }: { hash: Address | undefined }) => {
    const { caipNetwork: chain } = useAppKitNetwork();

    return hash ? (
        <ToastAction altText="View on explorer" asChild>
            <Link
                to={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
                target={"_blank"}
                className="h-auto border-none p-0 hover:bg-transparent hover:text-blue-400"
            >
                <span className="sr-only">View on explorer</span>
                <ExternalLinkIcon size={16} />
            </Link>
        </ToastAction>
    ) : (
        <></>
    );
};

export function useTransactionAwait(hash: Address | undefined, transactionInfo: TransactionInfo, redirectPath?: string) {
    const { toast } = useToast();

    const navigate = useNavigate();

    const { address: account } = useAccount();

    const {
        actions: { addPendingTransaction, updatePendingTransaction },
    } = usePendingTransactionsStore();

    const { data, isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isLoading && hash && account) {
            toast({
                toastContent: <TransactionToastContent hash={hash} transactionInfo={transactionInfo} status="pending" />,
            });
            addPendingTransaction(account, hash);
            updatePendingTransaction(account, hash, { data: transactionInfo, loading: true, success: null, error: null });
        }
    }, [isLoading, hash, account]);

    useEffect(() => {
        if (isError && hash) {
            toast({
                toastContent: <TransactionToastContent hash={hash} transactionInfo={transactionInfo} status="error" />,
            });
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess && hash) {
            toast({
                toastContent: <TransactionToastContent hash={hash} transactionInfo={transactionInfo} status="success" />,
            });
            if (transactionInfo.callback) {
                transactionInfo.callback();
            }
            if (redirectPath) {
                navigate(redirectPath);
            }
        }
    }, [isSuccess]);

    return {
        data,
        isError,
        isLoading,
        isSuccess,
    };
}
