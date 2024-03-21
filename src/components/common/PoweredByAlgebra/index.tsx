import AlgebraLogo from '@/assets/algebra-logo.svg';
import AlgebraIntegral from '@/assets/algebra-itegral.svg';
import { cn } from '@/lib/utils';

const PoweredByAlgebra = ({ className }: { className?: string }) => {
    return (
        <a
            href={'https://algebra.finance'}
            className={cn('flex items-center gap-2 p-2', className)}
        >
            <span className="text-sm font-semibold">Powered by</span>
            <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full">
                    <img src={AlgebraLogo} width={18} height={18} />
                </div>
                <img src={AlgebraIntegral} width={120} height={18} />
            </div>
        </a>
    );
};

export default PoweredByAlgebra;
