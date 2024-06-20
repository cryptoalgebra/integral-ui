import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/common/formatCurrency";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useMemo } from "react";
import { Address, useAccount, useBalance } from "wagmi";


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
  handleChange,
}: EnterAmountsCardProps) => {
  const { address: account } = useAccount();

  const { data: balance, isLoading } = useBalance({
    address: account,
    token: currency?.isNative ? undefined : currency?.wrapped.address as Address,
    watch: true
  });

  const balanceString = useMemo(() => {
    if (isLoading || !balance) return "Loading...";

    return formatCurrency.format(Number(balance.formatted))

  }, [balance, isLoading]);

  const handleInput = useCallback((value: string) => {
    if (value === ".") value = "0.";
    handleChange(value);
  }, []);

  function setMax() {
    handleChange(balance?.formatted || '0');
  }

  return <div className="flex w-full bg-card-dark p-3 rounded-2xl">
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <CurrencyLogo currency={currency} size={35} />
        <span className="font-bold text-lg">{currency ? currency.symbol : "Select a token"}</span>
      </div>
      {currency && account && (
        <div className={"flex text-sm whitespace-nowrap"}>
          <div>
            <span className="font-semibold">Balance: </span>
            <span>{balanceString}</span>
          </div>
          <button className="ml-2 text-[#63b4ff]" onClick={setMax}>
            Max
          </button>
        </div>
      )}
    </div>

    <div className="flex flex-col items-end w-full">
      <Input 
        value={value} 
        id={`amount-${currency?.symbol}`} 
        onUserInput={v => handleInput(v)}
        className={`text-right border-none text-xl font-bold w-9/12 p-0`} 
        placeholder={'0.0'}
        maxDecimals={currency?.decimals}
       />
      {/* <div className="text-sm">{fiatValue && formatUSD.format(fiatValue)}</div> */}
    </div>
  </div>

  // return (
  //   <div
  //       className="flex flex-col justify-between w-full relative">
  //     <div
  //     className="absolute text-right">
  //       {/* // {`Balance: ${displayNumber(balance)}`} */}
  //       {`Balance: ${balance.toString()}`}
  //     </div>

  //     <div
  //     className="flex items-center justify-between">
  //       <div className="flex items-center p-2">
  //         {/* <EquilibreAvatar
  //           src={asset?.logoURI || ''}
  //           size={'md'}
  //           ml={1}
  //           mr={4}
  //         /> */}
  //         <Input value={value} onChange={v => handleChange(v.target.value)} />
  //         {/* <InputGroup flexDirection={'column'}>
  //           <NumberInput
  //             step={0.1}
  //             colorScheme="white"
  //             variant={'unstyled'}
  //             value={value}
  //             onChange={handleChange}>
  //             <NumberInputField
  //               fontSize={'2xl'}
  //               placeholder="0"
  //               textAlign={'left'}
  //             />
  //           </NumberInput>
  //         </InputGroup> */}
  //       </div>
  //       <Button
  //         onClick={setMax}>
  //         MAX
  //       </Button>
  //     </div>
  //     <div className="mt-4">
  //       {error ? (
  //         <div className="flex flex-col absolute">
  //           {error}
  //         </div>
  //       ) : needApprove ? (
  //         <Button
  //           disabled={!approve || isApprovalLoading}
  //           onClick={() => approve()}>
  //           {isApprovalLoading ? 'Loading...' : `Approve ${currency?.symbol}`}
  //         </Button>
  //       ) : valueForApprove ? (
  //         <div className="absolute">
  //           {/* <CheckIcon /> */}
  //           Approved
  //         </div>
  //       ) : null}
  //     </div>
  //   </div>
  // );
};

export default EnterAmountCard;
