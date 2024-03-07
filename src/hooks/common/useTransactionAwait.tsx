import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Address, useWaitForTransaction } from 'wagmi';

export const ViewTxOnExplorer = ({ hash }: { hash: Address | undefined }) =>
    hash ? (
        <ToastAction altText="View on explorer" asChild>
            <Link
                to={`https://holesky.etherscan.io/tx/${hash}`}
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

export function useTransitionAwait(
    hash: Address | undefined,
    title: string,
    description?: string,
    redirectPath?: string
) {
    const { toast } = useToast();

    const navigate = useNavigate();

    const { data, isError, isLoading, isSuccess } = useWaitForTransaction({
        hash,
    });

    useEffect(() => {
        if (isLoading) {
            toast({
                title: title,
                description: description || 'Transaction was sent',
                action: <ViewTxOnExplorer hash={hash} />,
            });
        }
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) {
            toast({
                title: title,
                description: description || 'Transaction failed',
                action: <ViewTxOnExplorer hash={hash} />,
            });
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: title,
                description: description || 'Transaction confirmed',
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
