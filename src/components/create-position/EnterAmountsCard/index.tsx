import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALGEBRA_POSITION_MANAGER } from "@/constants/addresses";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useEffect } from "react";
import { erc20ABI, useAccount, useBalance, useContractWrite, useWaitForTransaction } from "wagmi";


interface EnterAmountsCardProps {
  currency: Currency | undefined;
  value: string;
  needApprove: boolean;
  error: string | undefined;
  valueForApprove: CurrencyAmount<Currency> | undefined;
  handleChange: (value: string) => void;
}

const EnterAmountCard = ({
  currency,
  value,
  valueForApprove,
  needApprove,
  error,
  handleChange,
}: EnterAmountsCardProps) => {
  const { address } = useAccount();

//   const {
//     actions: { getBaseAsset },
//   } = useBaseAssetStore();

//   const asset = getBaseAsset(currency?.wrapped.address || '');

  const {
    data: balanceData,
    isLoading,
    isError,
  } = useBalance({
    address,
    token: currency?.isNative
      ? undefined
      : (currency?.wrapped.address as `0x${string}`),
    watch: true,
  });

  const balance =
    !isLoading && !isError && balanceData ? balanceData.formatted : 0;

  const { data: approvalData, write: approve } = useContractWrite({
    address: currency ? (currency.wrapped.address as `0x${string}`) : undefined,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      ALGEBRA_POSITION_MANAGER,
      valueForApprove ? BigInt(valueForApprove.quotient.toString()) : 0,
    ] as [`0x${string}`, bigint],
    onSuccess() {
    //   generateToast(
    //     'Transaction sent',
    //     'Your transaction has been submitted to the network',
    //     'loading'
    //   );
    },
    onError() {
    //   generateToast(
    //     'Error meanwhile waiting for transaction',
    //     error.message,
    //     'error'
    //   );
    },
  });

  const { data: waitForApproval, isLoading: isApprovalLoading } =
    useWaitForTransaction({
      hash: approvalData?.hash,
    });

  useEffect(() => {
    if (waitForApproval && waitForApproval.status === 'success') {
    //   generateToast(
    //     `${currency?.symbol} approved`,
    //     '',
    //     'success',
    //     waitForApproval.transactionHash
    //   );
    }
  }, [waitForApproval]);

  function setMax() {
    handleChange(balance || '0');
  }

  return (
    <div
        className="flex flex-col justify-between w-full relative">
      <div
      className="absolute text-right">
        {/* // {`Balance: ${displayNumber(balance)}`} */}
        {`Balance: ${balance.toString()}`}
      </div>

      <div
      className="flex items-center justify-between">
        <div className="flex items-center p-2">
          {/* <EquilibreAvatar
            src={asset?.logoURI || ''}
            size={'md'}
            ml={1}
            mr={4}
          /> */}
          <Input value={value} onChange={v => handleChange(v.target.value)} />
          {/* <InputGroup flexDirection={'column'}>
            <NumberInput
              step={0.1}
              colorScheme="white"
              variant={'unstyled'}
              value={value}
              onChange={handleChange}>
              <NumberInputField
                fontSize={'2xl'}
                placeholder="0"
                textAlign={'left'}
              />
            </NumberInput>
          </InputGroup> */}
        </div>
        <Button
          onClick={setMax}>
          MAX
        </Button>
      </div>
      <div className="mt-4">
        {error ? (
          <div className="flex flex-col absolute">
            {error}
          </div>
        ) : needApprove ? (
          <Button
            disabled={!approve || isApprovalLoading}
            onClick={() => approve()}>
            {isApprovalLoading ? 'Loading...' : `Approve ${currency?.symbol}`}
          </Button>
        ) : valueForApprove ? (
          <div className="absolute">
            {/* <CheckIcon /> */}
            Approved
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EnterAmountCard;
