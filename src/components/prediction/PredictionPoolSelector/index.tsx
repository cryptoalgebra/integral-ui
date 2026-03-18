import CurrencyLogo from "@/components/common/CurrencyLogo";
import PredictionPoolSelectorModal from "@/components/modals/PredictionPoolSelectorModal";
import { usePool } from "@/hooks/pools/usePool";
import { useState } from "react";
import { Address } from "viem";

const PredictionPoolSelector = () => {

    const [isOpen, setIsOpen] = useState(false)

    const [selectedPool, setSelectedPool] = useState<Address>("0x671ddf7e29272c5bf6996f765fabf58351cff137")
    const [, pool] = usePool(selectedPool)

    return <div className="flex w-full px-4 py-4 bg-card-dark border border-card-border rounded-t-lg border-b-0">
        <PredictionPoolSelectorModal isOpen={isOpen} setIsOpen={setIsOpen} onSelect={(pool) => setSelectedPool(pool)}>
            {pool && <button
                className="flex items-center py-1 w-full bg-card rounded-lg text-left"
            >
                <div className="relative w-12 h-12">
                    <CurrencyLogo currency={pool.token0} size={48} />
                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-b from-white/0 to-white/30 border border-card-dark shadow-primary/40 group-hover:border-primary group-hover:shadow-lg duration-100" />
                </div>
                <div className="relative w-12 h-12 -ml-2">
                    <CurrencyLogo currency={pool.token1} size={48} />
                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-b from-white/0 to-white/30 border border-card-dark shadow-primary/40 group-hover:border-primary group-hover:shadow-lg duration-100" />
                </div>
                <div className="ml-4">
                    <div className="uppercase text-xs text-text-200">Pool</div>
                    <div className="font-bold text-lg">{`${pool.token0.symbol} / ${pool.token1.symbol}`}</div>
                </div>
                {/* <ChevronRight size={16} className="ml-auto duration-100 group-hover:rotate-90" /> */}
            </button>}
        </PredictionPoolSelectorModal>
    </div>

};

export default PredictionPoolSelector;