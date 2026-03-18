import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { usePoolsListQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useAllOpenMarkets } from "@/hooks/prediction/useAllOpenMarkets";
import { useMemo } from "react";
import { Address } from "viem";

interface IPredictionPoolSelectorModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    onSelect: (pool: Address) => void;
    children: React.ReactNode;
}

const PredictionPoolSelectorModal = ({ isOpen, setIsOpen, onSelect, children }: IPredictionPoolSelectorModal) => {

    const { infoClient } = useClients()

    const { data: pools } = usePoolsListQuery({
        client: infoClient,
    });

    const { data: openMarkets } = useAllOpenMarkets()

    const poolsWithMarkets = useMemo(() => {

        if (!pools || !openMarkets) return []

        return pools.pools.filter((pool) => openMarkets.find((market) => market.pool.toLowerCase() === pool.id.toLowerCase()))

    }, [pools, openMarkets])

    console.log('poolsWithMarkets', poolsWithMarkets)

    return (
        <Credenza open={isOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="bg-card-dark !rounded-xl"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle>Select a pool</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody>
                    {
                        poolsWithMarkets.map((pool) => (
                            <button key={pool.id} onClick={() => onSelect(pool.id as Address)} >{pool.token0.symbol}/{pool.token1.symbol}</button>
                        ))
                    }
                    {/* <TokenSelector showNativeToken={showNativeToken} onSelect={onSelect} otherCurrency={otherCurrency} /> */}
                </CredenzaBody>
                <CredenzaClose asChild>
                    <button
                        className="absolute right-4 top-4 rounded-sm opacity-70"
                        onClick={() => setIsOpen(false)}
                        style={{ zIndex: 999 }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                    </button>
                </CredenzaClose>
            </CredenzaContent>
        </Credenza>
    );
};

export default PredictionPoolSelectorModal;
