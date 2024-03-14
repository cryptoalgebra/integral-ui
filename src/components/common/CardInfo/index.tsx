import { cn } from '@/lib/utils';
import React, { FC } from 'react';

interface CardInfoProps {
    title: string;
    additional?: string;
    className?: string;
    children?: React.ReactNode;
}

const CardInfo: FC<CardInfoProps> = ({
    title,
    children,
    additional,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex items-start flex-col gap-2 rounded-3xl border-border border bg-card-dark p-4',
                className
            )}
        >
            <h3 className="font-bold text-sm">{title}</h3>
            <div className="flex justify-between w-full items-end">
                <div className="flex items-center mr-auto text-2xl font-bold">
                    {children}
                </div>
                {additional && <p className="max-sm:hidden">{additional}</p>}
            </div>
        </div>
    );
};

export default CardInfo;
