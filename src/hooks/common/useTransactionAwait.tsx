import { defaultChain } from '@/App';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { TransactionInfo, usePendingTransactionsStore } from '@/state/pendingTransactionsStore';
import { ExternalLinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Address, useAccount, useWaitForTransaction } from 'wagmi';

export const ViewTxOnExplorer = ({ hash }: { hash: Address | undefined }) =>
    hash ? (
        <ToastAction altText="View on explorer" asChild>
            <Link
                to={`${defaultChain.blockExplorers.default.url}/tx/${hash}`}
                target={'_blank'}
                className="border-none gap-2 hover:bg-transparent hover:text-blue-400"
            >
                View on explorer
                <ExternalLinkIcon size={16} />
            </Link>
        </ToastAction>
    ) : (
        <></>
    );

export function useTransactionAwait(
    hash: Address | undefined,
    transactionInfo: TransactionInfo,
    redirectPath?: string,
) {
    const { toast } = useToast();

    const navigate = useNavigate();

    const { address: account } = useAccount();

    const { actions: { addPendingTransaction, updatePendingTransaction } } = usePendingTransactionsStore();

    const { data, isError, isLoading, isSuccess } = useWaitForTransaction({
        hash,
    });

    useEffect(() => {
        if (isLoading && hash && account) {
            toast({
                title: transactionInfo.title,
                description: transactionInfo.description || 'Transaction was sent',
                action: <ViewTxOnExplorer hash={hash} />,
            });
            addPendingTransaction(account, hash);
            updatePendingTransaction(account, hash, { data: transactionInfo, loading: true, success: null, error: null });
        }
    }, [isLoading, hash, account]);

    useEffect(() => {
        if (isError && hash) {
            toast({
                title: transactionInfo.title,
                description: transactionInfo.description || 'Transaction failed',
                action: <ViewTxOnExplorer hash={hash} />,
            });
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess && hash) {
            toast({
                title: transactionInfo.title,
                description: transactionInfo.description || 'Transaction confirmed',
                action: <ViewTxOnExplorer hash={hash} />,
            });
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
