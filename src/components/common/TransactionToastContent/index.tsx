import EtherScanLogo from "@/assets/etherscan-logo-circle.svg";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import Loader from "@/components/common/Loader";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { useCurrency } from "@/hooks/common/useCurrency";
import { TransactionInfo } from "@/state/pendingTransactionsStore";
import { Check, ExternalLinkIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Address } from "viem";

export type TransactionToastStatus = "pending" | "success" | "error";

const STATUS_DESCRIPTION: Record<TransactionToastStatus, string> = {
    pending: "Transaction was sent",
    success: "Transaction confirmed",
    error: "Transaction failed",
};

interface TransactionToastContentProps {
    hash?: Address;
    transactionInfo: TransactionInfo;
    status: TransactionToastStatus;
}

export const TransactionToastContent = ({ hash, transactionInfo, status }: TransactionToastContentProps) => {
    const currencyA = useCurrency(transactionInfo.tokenA, true);
    const currencyB = useCurrency(transactionInfo.tokenB, true);

    const blockExplorerUrl = useBlockExplorerURL();
    const link = hash && blockExplorerUrl ? `${blockExplorerUrl}/tx/${hash}` : "#";

    // const description =
    //     transactionInfo.type === TransactionType.FARM && transactionInfo.tokenId
    //         ? `Position #${transactionInfo.tokenId}`
    //         : currencyA && currencyB
    //         ? `${currencyA.symbol} / ${currencyB.symbol}`
    //         : currencyA?.symbol || (hash ? truncateHash(hash) : "Transaction");

    return (
        <Link to={link} target="_blank" className="flex w-full items-center gap-3 p-5 group">
            {currencyA && currencyB ? (
                <div className="relative w-[32px]">
                    <CurrencyLogo className="absolute bottom-0 translate-y-1/4" currency={currencyA} size={24} />
                    <CurrencyLogo className="absolute left-3 top-0 -translate-y-1/4" currency={currencyB} size={24} />
                </div>
            ) : currencyA ? (
                <CurrencyLogo currency={currencyA} size={32} />
            ) : (
                <img className="brightness-150" src={EtherScanLogo} width={32} height={32} />
            )}
            <div className="mr-auto flex min-w-0 flex-col">
                <span className="truncate text-sm">{transactionInfo.title}</span>
                {/* <span className="truncate text-xs opacity-60">{description}</span> */}
                <span className="truncate text-xs opacity-60">{transactionInfo.description || STATUS_DESCRIPTION[status]}</span>
            </div>
            <div className="group-hover:hidden animate-fade-in">
                {status === "pending" && <Loader size={18} />}
                {status === "success" && <Check className="text-primary" size={18} />}
                {status === "error" && <X className="text-red-400" size={18} />}
            </div>
            <div className="hidden group-hover:flex">
                {<ExternalLinkIcon className="hidden group-hover:block animate-fade-in" size={18} />}
            </div>
        </Link>
    );
};
