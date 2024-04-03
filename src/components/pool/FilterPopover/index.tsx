import { Switch } from '@/components/ui/switch';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PositionsStatus } from '@/types/position-filter-status';
import { usePositionFilterStore } from '@/state/positionFilterStore';
import { cn } from '@/lib/utils';

const FilterPopover = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const {filterStatus, actions: { setFilterStatus }} = usePositionFilterStore();

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'ghost'}
                    size={'md'}
                    className={cn(
                        'bg-transparent border border-card-border/60',
                        isOpen && 'bg-card'
                    )}
                    aria-label="Update dimensions"
                >
                    {children}
                </Button>
            </PopoverTrigger>
            <PopoverContent sideOffset={5}>
                <div className="flex flex-col gap-2">
                    <label className="flex justify-between items-center">
                        Active
                        <Switch
                            id="Active"
                            checked={Boolean(
                                filterStatus[PositionsStatus.ACTIVE]
                            )}
                            onCheckedChange={() =>
                                setFilterStatus(PositionsStatus.ACTIVE)
                            }
                        />
                    </label>
                    <label className="flex justify-between items-center">
                        On Farming
                        <Switch
                            id="On Farming"
                            checked={Boolean(
                                filterStatus[PositionsStatus.ON_FARMING]
                            )}
                            onCheckedChange={() =>
                                setFilterStatus(PositionsStatus.ON_FARMING)
                            }
                        />
                    </label>
                    <label className="flex justify-between items-center">
                        Closed
                        <Switch
                            id="Closed"
                            checked={Boolean(
                                filterStatus[PositionsStatus.CLOSED]
                            )}
                            onCheckedChange={() =>
                                setFilterStatus(PositionsStatus.CLOSED)
                            }
                        />
                    </label>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default FilterPopover;
