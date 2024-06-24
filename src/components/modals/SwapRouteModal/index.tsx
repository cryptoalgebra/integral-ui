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

interface ISwapRouteModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    routes: any[] | undefined;
    children: React.ReactNode;
}

const customPoolDeployers = {
    [ADDRESS_ZERO]: 'Base',
    [CUSTOM_POOL_DEPLOYER_BLANK]: 'Blank',
    [CUSTOM_POOL_DEPLOYER_FEE_CHANGER]: 'Fee Changer',
    [CUSTOM_POOL_DEPLOYER_VOLUME_FEE]: 'Volume Fee'
};


const RoutePool = ({ pool }: { pool: { path: any[]; deployer: Address; percent: number } }) => {
    const [token0, token1] = [pool.path[0], pool.path[1]];
    const deployer = customPoolDeployers[pool.deployer];

    return (
        <div className={'w-full flex items-center justify-between '}>
            <div className={'flex flex-col gap-2 items-center'}>
                <CurrencyLogo currency={token0} size={20} />
                <span className={'font-bold'}>{token0.symbol}</span>
            </div>
            <div className={'flex flex-col gap-2 items-center'}>
                <ArrowRight size={'16px'} />
                <span>{`${deployer} ${token0.symbol}/${token1.symbol}${
                    pool.percent < 100 ? ` (${pool.percent}%)` : ''
                }`}</span>
            </div>
            <div className={'flex flex-col gap-2 items-center'}>
                <CurrencyLogo currency={token1} size={20} />
                <span className={'font-bold'}>{token1.symbol}</span>
            </div>
        </div>
    );
};


const SwapRouteModal = ({
    isOpen,
    setIsOpen,
    routes,
    children
}: ISwapRouteModal) => {

    if (!routes) return null;

    const pools = routes.flatMap((route) => route.pools);
    const percents = routes.flatMap((route) => route.percent);

    const paths = routes
        .flatMap((route) => route.path)
        .reduce<any[]>((acc, path, idx, arr) => {
            if (arr.length % 2 === 0) {
                return [...acc, path];
            }
            if (idx % 2 === 0 && idx > 1) {
                return [...acc, acc[acc.length - 1], path];
            }
            return [...acc, path];
        }, [])
        .reduce((acc, path, idx, arr) => {
            if (idx % 2 !== 0 || idx === arr.length - 1) {
                acc[acc.length - 1].path.push(path);
                acc[acc.length - 1].deployer = pools[acc.length - 1].deployer;
                acc[acc.length - 1].percent = percents[acc.length - 1];
            } else if (idx !== arr.length - 1) {
                acc.push({ path: [path] });
            }

            return [...acc];
        }, []);

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
                    {paths.map((pool: any) => (
                        <RoutePool key={`route-pool-${pool.version}`} pool={pool} />
                    ))}
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
