import { useCurrency } from "@/hooks/common/useCurrency";
import { truncateHash } from "@/utils/common/truncateHash";
import { Address } from "viem";
import CurrencyLogo from "../CurrencyLogo";
import EtherScanLogo from "@/assets/etherscan-logo-circle.svg"
import { Check, ExternalLinkIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Transaction, TransactionType } from "@/state/pendingTransactionsStore";
import Loader from "../Loader";
import { FarmingPositionImg } from "@/components/farming/FarmingPositionImg";

export const TransactionCard = ({ hash, transaction }: { hash: Address, transaction: Transaction }) => {
    const currencyA = useCurrency(transaction.data.tokenA, true);
    const currencyB = useCurrency(transaction.data.tokenB, true);

    const txType = transaction.data.type;

    return <Link
            to={`https://holesky.etherscan.io/tx/${hash}`}
            target={'_blank'}
            >
                <li className="flex group h-16 justify-between items-center gap-4 w-full bg-card-dark rounded-3xl p-4 border border-border/60 hover:border-border hover:bg-card-dark/60 transition-all duration-200" key={hash}>
                    {
                        txType === TransactionType.FARM && transaction.data.tokenId ?
                        <FarmingPositionImg positionId={BigInt(transaction.data.tokenId)} size={10} />
                        :
                        
                            currencyB && currencyA ?
                            <div className="w-[36px] relative">
                                <CurrencyLogo className="absolute bottom-0 translate-y-1/4" currency={currencyA} size={28} />
                                <CurrencyLogo className="absolute top-0 left-3 -translate-y-1/4" currency={currencyB} size={28} />
                            </div>
                            :
                            currencyA ?
                            <CurrencyLogo currency={currencyA} size={40} />
                            :
                            <img className="brightness-150" src={EtherScanLogo} width={40} height={40} />
                        
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
                            transaction.data.tokenId ? 
                            <span className="text-sm">Position #{transaction.data.tokenId}</span>
                            :
                            <span className="text-sm">{truncateHash(hash as Address)}</span>
                        }
                    </div>
                    {
                        transaction.loading ? <Loader className="group-hover:hidden" size={20} /> 
                        : 
                        transaction.success ? <Check className="text-blue-300 group-hover:hidden" size={18} /> 
                        :
                        transaction.error && <X className="text-red-500 group-hover:hidden" size={18} />
                    }
                    <ExternalLinkIcon className="hidden group-hover:block" size={18} />
                </li>
            </Link> 
}