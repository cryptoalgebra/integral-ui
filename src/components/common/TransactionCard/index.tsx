import { useCurrency } from "@/hooks/common/useCurrency";
import { truncateHash } from "@/utils/common/truncateHash";
import { Address } from "viem";
import CurrencyLogo from "../CurrencyLogo";
import EtherScanLogo from "@/assets/etherscan-logo-circle.svg"
import { Check, ExternalLinkIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Transaction } from "@/state/pendingTransactionsStore";
import Loader from "../Loader";
import { useState } from "react";

export const TransactionCard = ({ hash, transaction }: { hash: Address, transaction: Transaction }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const currencyA = useCurrency(transaction.data.tokenA, true);
    const currencyB = useCurrency(transaction.data.tokenB, true);

    return <Link
            to={`https://holesky.etherscan.io/tx/${hash}`}
            target={'_blank'}
            >
                <li onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="flex h-16 justify-between items-center gap-4 w-full bg-card-dark rounded-3xl p-4 border border-border/60 hover:border-border hover:bg-card-dark/60 transition-all duration-200" key={hash}>
                    {
                        currencyB && currencyA ?
                        <div className="w-[36px] relative">
                            <CurrencyLogo className="absolute bottom-0 translate-y-1/4" currency={currencyA} size={28} />
                            <CurrencyLogo className="absolute top-0 left-3 -translate-y-1/4" currency={currencyB} size={28} />
                        </div>
                        :
                        currencyA ?
                        <CurrencyLogo currency={currencyA} size={36} />
                        :
                        <img className="brightness-150" src={EtherScanLogo} width={36} height={36} />
                    }
                    <div className="flex flex-col mr-auto">
                        <span className="text-xs opacity-60">{transaction.data.title}</span>
                        {
                            currencyB && currencyA ? 
                            <span className="text-sm">{currencyA.symbol} / {currencyB.symbol}</span>
                            :
                            currencyA ?
                            <span className="text-sm">{currencyA.symbol}</span>
                            :
                            <span>{truncateHash(hash as Address)}</span>
                        }
                    </div>
                    {
                        transaction.loading && !isHovered ? <Loader size={20} /> 
                        : 
                        transaction.success && !isHovered ? <Check className="text-blue-300" size={18} /> 
                        :
                        transaction.error && !isHovered ? <X className="text-red-500" size={18} />
                        :
                        <ExternalLinkIcon size={18} />
                    }
                </li>
            </Link> 
}