import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Deposit } from '@/graphql/generated/graphql';

interface SelectPositionFarmModalProps {
    positions: Deposit[];
}

export function SelectPositionFarmModal({
    positions,
}: SelectPositionFarmModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={'md'} className="whitespace-nowrap">
                    Enter Farm
                </Button>
            </DialogTrigger>
            <DialogContent
                className="min-w-[500px] rounded-3xl bg-card-dark"
                style={{ borderRadius: '32px' }}
            >
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">
                        Select Position
                    </DialogTitle>
                </DialogHeader>

                <ul className="flex flex-col gap-4">
                    {positions &&
                        positions.map((position) => (
                            <li
                                className="flex items-center px-4 gap-4 w-full h-12 border border-white cursor-pointer hover:bg-neutral-500"
                                key={position.id}
                            >
                                <p>{position.id}.</p>
                                <p>{position.liquidity / 10 ** 18}</p>
                            </li>
                        ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
