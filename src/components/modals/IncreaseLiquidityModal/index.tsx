
import AmountsSection from '@/components/create-position/AmountsSection';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { IDerivedMintInfo } from '@/state/mintStore';
import { type Currency } from '@cryptoalgebra/integral-sdk';
import { useState } from 'react';

interface IncreaseLiquidityModalProps {
  tokenId: number;
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  onSuccess?: () => void;
}

export function IncreaseLiquidityModal({
  tokenId,
  currencyA,
  currencyB,
  mintInfo,
//   onSuccess,
}: IncreaseLiquidityModalProps) {
  const [isOpen, setIsOpen] = useState(false);

//   const handleSuccess = () => {
//     setIsOpen(false);
//     onSuccess?.();
//   };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={false} variant={'primary'} className='whitespace-nowrap w-full gap-2'>
          Add liquidity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Add Liquidity</DialogHeader>
        <div className='flex flex-col gap-4'>
          <AmountsSection
            tokenId={tokenId}
            currencyA={currencyA}
            currencyB={currencyB}
            mintInfo={mintInfo}
            // onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
