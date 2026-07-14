import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { TransactionInfo, usePendingTransactionsStore } from "@/state/pendingTransactionsStore";
import { useAppKitNetwork } from "@reown/appkit/react";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect, useRef } from "react";
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
                className="border-none gap-2 hover:bg-transparent hover:text-blue-400"
            >
                View on explorer
                <ExternalLinkIcon size={16} />
            </Link>
        </ToastAction>
    ) : (
        <></>
    );
};

export function useTransactionAwait(hash: Address | undefined, transactionInfo: TransactionInfo, redirectPath?: string) {
    const { toast } = useToast();
    const transactionInfoRef = useRef<{ hash?: Address; info: TransactionInfo }>({ info: transactionInfo });

    const navigate = useNavigate();

    const { address: account } = useAccount();

    const {
        actions: { addPendingTransaction, updatePendingTransaction },
    } = usePendingTransactionsStore();

    const { data, isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const currentTransactionInfo = hash && transactionInfoRef.current.hash === hash ? transactionInfoRef.current.info : transactionInfo;

    useEffect(() => {
        if (isLoading && hash && account) {
            transactionInfoRef.current = { hash, info: transactionInfo };
            toast({
                title: transactionInfo.title,
                description: transactionInfo.description || "Transaction was sent",
                action: <ViewTxOnExplorer hash={hash} />,
            });
            addPendingTransaction(account, hash);
            updatePendingTransaction(account, hash, { data: transactionInfo, loading: true, success: null, error: null });
        }
    }, [isLoading, hash, account]);

    useEffect(() => {
        if (isError && hash) {
            toast({
                title: currentTransactionInfo.title,
                description: currentTransactionInfo.description || "Transaction failed",
                action: <ViewTxOnExplorer hash={hash} />,
            });
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess && hash) {
            toast({
                title: currentTransactionInfo.title,
                description: currentTransactionInfo.description || "Transaction confirmed",
                action: <ViewTxOnExplorer hash={hash} />,
            });
            if (currentTransactionInfo.callback) {
                currentTransactionInfo.callback();
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
