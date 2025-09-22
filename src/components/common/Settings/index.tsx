import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUserState } from "@/state/userStore";
import { Percent } from "@cryptoalgebra/custom-pools-sdk";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

const Settings = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"icon"} size={"md"} className="border border-card-border">
                    <SettingsIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align={"end"}
                className="flex flex-col gap-4 p-6 w-full max-w-[360px] bg-card-dark shadow-popover rounded-xl border border-card-border"
            >
                <div className="text-md font-bold">Transaction Settings</div>
                <Separator orientation={"horizontal"} className="bg-border" />
                <SlippageTolerance />
                <TransactionDeadline />
                <Multihop />
                <SplitTrade />
                <ExpertMode />
            </PopoverContent>
        </Popover>
    );
};

const SlippageTolerance = () => {
    const {
        slippage,
        actions: { setSlippage },
    } = useUserState();

    const [slippageInput, setSlippageInput] = useState("");
    const [slippageError, setSlippageError] = useState<boolean>(false);

    function parseSlippageInput(value: string) {
        // populate what the user typed and clear the error
        setSlippageInput(value);
        setSlippageError(false);

        if (value.length === 0) {
            setSlippage("auto");
        } else {
            const parsed = Math.floor(Number.parseFloat(value) * 100);

            if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
                setSlippage("auto");
                if (value !== ".") {
                    setSlippageError(true);
                }
            } else {
                setSlippage(new Percent(parsed, 10_000));
            }
        }
    }

    const tooLow = slippage !== "auto" && slippage.lessThan(new Percent(5, 10_000));
    const tooHigh = slippage !== "auto" && slippage.greaterThan(new Percent(1, 100));

    const slippageString = slippage !== "auto" ? slippage.toFixed(2) : "auto";

    return (
        <div className="flex flex-col gap-2">
            <div className="text-md font-semibold">Slippage Tolerance</div>
            <div className="grid grid-cols-4 gap-4">
                <Button variant={slippageString === "auto" ? "iconActive" : "outline"} size={"sm"} onClick={() => parseSlippageInput("")}>
                    Auto
                </Button>
                <Button
                    variant={slippageString === "0.10" ? "iconActive" : "outline"}
                    size={"sm"}
                    onClick={() => parseSlippageInput("0.10")}
                >
                    0.1%
                </Button>
                <Button
                    variant={slippageString === "0.50" ? "iconActive" : "outline"}
                    size={"sm"}
                    onClick={() => parseSlippageInput("0.5")}
                >
                    0.5%
                </Button>
                <Button variant={slippageString === "1.00" ? "iconActive" : "outline"} size={"sm"} onClick={() => parseSlippageInput("1")}>
                    1%
                </Button>
                <div className="flex col-span-4">
                    <Input
                        value={slippageInput.length > 0 ? slippageInput : slippage === "auto" ? "" : slippage.toFixed(2)}
                        onChange={(e) => parseSlippageInput(e.target.value)}
                        onBlur={() => {
                            setSlippageInput("");
                            setSlippageError(false);
                        }}
                        className={`text-left border-none text-md font-semibold bg-card-hover rounded-l-lg rounded-r-none w-full min-w-[70px] ring-0!`}
                        placeholder={"0.0"}
                    />
                    <div className="bg-card-hover text-sm p-2 pt-2.5 rounded-r-lg select-none">%</div>
                </div>
            </div>
            {slippageError || tooLow || tooHigh ? (
                <div>
                    {slippageError ? (
                        <div className="bg-red-900 text-red-200 border border-red-500 px-2 py-1 rounded-lg">Enter a valid slippage percentage</div>
                    ) : (
                        <div className="bg-yellow-900 text-yellow-200 border border-yellow-500 px-2 py-1 rounded-lg">
                            {tooLow ? "Your transaction may fail" : "Your transaction may be frontrun"}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

const TransactionDeadline = () => {
    const {
        txDeadline,
        actions: { setTxDeadline },
    } = useUserState();

    const [deadlineInput, setDeadlineInput] = useState("");
    const [deadlineError, setDeadlineError] = useState<boolean>(false);

    function parseCustomDeadline(value: string) {
        setDeadlineInput(value);
        setDeadlineError(false);

        if (value.length === 0) {
            setTxDeadline(60 * 30);
        } else {
            try {
                const parsed: number = Math.floor(Number.parseFloat(value) * 60);
                if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
                    setDeadlineError(true);
                } else {
                    setTxDeadline(parsed);
                }
            } catch (error) {
                setDeadlineError(true);
            }
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="text-md font-semibold">Transaction Deadline</div>
            <div className="flex">
                <Input
                    placeholder={"30"}
                    value={deadlineInput.length > 0 ? deadlineInput : txDeadline === 180 ? "" : (txDeadline / 60).toString()}
                    onChange={(e) => parseCustomDeadline(e.target.value)}
                    onBlur={() => {
                        setDeadlineInput("");
                        setDeadlineError(false);
                    }}
                    color={deadlineError ? "red" : ""}
                    className={`text-left border-none text-md font-semibold bg-card-hover rounded-l-lg rounded-r-none w-full ring-0!`}
                />
                <div className="bg-card-hover text-sm p-2 pt-2.5 rounded-r-lg select-none">minutes</div>
            </div>
        </div>
    );
};
const ExpertMode = () => {
    const {
        isExpertMode,
        actions: { setIsExpertMode },
    } = useUserState();

    return (
        <div className="flex flex-col gap-2 max-w-[332px]">
            <div className="flex justify-between items-center gap-2 text-md font-semibold">
                <label htmlFor="expert-mode">Expert mode</label>
                <Switch id="expert-mode" checked={isExpertMode} onCheckedChange={setIsExpertMode} />
            </div>
            <p className="whitespace-break-spaces">Allows high slippage trades. Use at your own risk.</p>
        </div>
    );
};

const Multihop = () => {
    const {
        isMultihop,
        actions: { setIsMultihop },
    } = useUserState();

    return (
        <div className="flex flex-col gap-2 max-w-[332px]">
            <div className="flex justify-between items-center gap-2 text-md font-semibold">
                <label htmlFor="multihop">Multihop</label>
                <Switch id="multihop" checked={isMultihop} onCheckedChange={setIsMultihop} />
            </div>
            <p className="whitespace-break-spaces">Optimized trades across multiple liquidity pools.</p>
        </div>
    );
};

const SplitTrade = () => {
    const {
        isSplit,
        actions: { setIsSplit },
    } = useUserState();

    return (
        <div className="flex flex-col gap-2 max-w-[332px]">
            <div className="flex justify-between items-center gap-2 text-md font-semibold">
                <label htmlFor="split">Split trade</label>
                <Switch id="split" checked={isSplit} onCheckedChange={setIsSplit} />
            </div>
            <p className="whitespace-break-spaces">Split trades across identical pools with different plugins.</p>
        </div>
    );
};

export default Settings;
