import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from '@/components/ui/credenza';
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { ArrowRight } from "lucide-react";
import { Address } from "wagmi";
import {ADDRESS_ZERO} from "@cryptoalgebra/custom-pools-sdk";
import {CUSTOM_POOL_DEPLOYER_BLANK, CUSTOM_POOL_DEPLOYER_FEE_CHANGER, CUSTOM_POOL_DEPLOYER_VOLUME_FEE } from "@/constants/addresses.ts";
import { useCurrency } from '@/hooks/common/useCurrency';
import { useMemo } from 'react';
import { Route, Currency, Pool } from '@cryptoalgebra/router-custom-pools';

interface ISwapRouteModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    routes: Route[] | undefined;
    children: React.ReactNode;
}

const customPoolDeployers = {
    [ADDRESS_ZERO]: 'Base',
    [CUSTOM_POOL_DEPLOYER_BLANK]: 'Blank',
    [CUSTOM_POOL_DEPLOYER_FEE_CHANGER]: 'Fee Changer',
    [CUSTOM_POOL_DEPLOYER_VOLUME_FEE]: 'Volume Fee'
};

const RoutePool = ({ pool }: { pool: { path: Currency[]; deployer: Address } }) => {
    const [token0, token1] = [pool.path[0], pool.path[1]];
    const currencyA = useCurrency(token0.wrapped.address as Address, true);
    const currencyB = useCurrency(token1.wrapped.address as Address, true);

    const deployer = customPoolDeployers[pool.deployer.toLowerCase()];

    return (
        <div className={'w-full flex items-center justify-between py-2'}>
            <div className={'flex flex-1 flex-col gap-2 items-start'}>
                <CurrencyLogo currency={currencyA} size={20} />
                <span className={'font-bold'}>{currencyA?.symbol}</span>
            </div>
            <div className={'flex flex-2 flex-col gap-2 items-center'}>
                <ArrowRight size={'16px'} />
                <span>{`${deployer} ${currencyA?.symbol}/${currencyB?.symbol}`}</span>
            </div>
            <div className={'flex flex-1 flex-col gap-2 items-end'}>
                <CurrencyLogo currency={currencyB} size={20} />
                <span className={'font-bold'}>{currencyB?.symbol}</span>
            </div>
        </div>
    );
};

const RouteSplit = ({ route }: { route: { pools: Pool[], path: Currency[], percent: number } }) => {


    const splits = useMemo(() => {

        const split = []

        for (let idx = 0; idx < Math.ceil(route.path.length / 2); idx++) {
            split[idx] = [
                route.path[idx],
                route.path[idx + 1]
            ]
        }

        return split


    }, [route])


    return <div className={'px-4 py-3 rounded-xl bg-gray-800'}>
        { route.percent < 100 && <div className={'pb-2 border-b border-gray-600 font-bold'}>{ `Split ${route.percent}%` }</div> }
        { route.pools.map((pool, idx) => pool.type === 1 ? <RoutePool pool={{
            path: splits[idx],
            deployer: pool.deployer 
            }} 
        /> : null)
        }
    
    </div>
}



const SwapRouteModal = ({
    isOpen,
    setIsOpen,
    routes,
    children
}: ISwapRouteModal) => {

    if (!routes) return null;

    return (
        <Credenza open={isOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="bg-card-dark !rounded-3xl"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle>Route</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className={'flex flex-col gap-4'}>
                    {
                        routes.map((route) => <RouteSplit key={`route-split-${route.path.join('-')}`} route={route} />)
                    }
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

export default SwapRouteModal;
