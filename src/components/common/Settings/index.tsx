import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUserState } from "@/state/userStore";
import { cn } from "@/utils";
import { Percent } from "@cryptoalgebra/integral-sdk";
import { enabledModules } from "config";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

const Settings = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"icon"} size={"sm"}>
                    <SettingsIcon size={20} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align={"end"}
                sideOffset={10}
                className="flex w-[min(92vw,380px)] flex-col gap-4 rounded-xl border border-border bg-card p-4"
            >
                <div className="flex flex-col gap-1 text-left">
                    <div className="text-base font-medium text-text">Transaction Settings</div>
                    <p className="text-sm text-text-muted">Adjust trade safety and routing behavior.</p>
                </div>
                <Separator orientation={"horizontal"} className="bg-border" />
                <SlippageTolerance />
                <TransactionDeadline />
                <Multihop />
                {enabledModules.SmartRouterModule && <SplitTrade />}
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
        <SettingGroup title="Slippage Tolerance" description="Choose a preset or enter a custom percentage.">
            <div className="grid grid-cols-4 gap-2">
                <PresetButton active={slippageString === "auto"} onClick={() => parseSlippageInput("")}>
                    Auto
                </PresetButton>
                <PresetButton active={slippageString === "0.10"} onClick={() => parseSlippageInput("0.10")}>
                    0.1%
                </PresetButton>
                <PresetButton active={slippageString === "0.50"} onClick={() => parseSlippageInput("0.5")}>
                    0.5%
                </PresetButton>
                <PresetButton active={slippageString === "1.00"} onClick={() => parseSlippageInput("1")}>
                    1%
                </PresetButton>
                <div className="col-span-4 flex overflow-hidden rounded-lg border border-border bg-panel">
                    <Input
                        value={slippageInput.length > 0 ? slippageInput : slippage === "auto" ? "" : slippage.toFixed(2)}
                        onChange={(e) => parseSlippageInput(e.target.value)}
                        onBlur={() => {
                            setSlippageInput("");
                            setSlippageError(false);
                        }}
                        className="h-11 min-w-[70px] rounded-none border-none bg-transparent text-left text-sm font-medium ring-0!"
                        placeholder={"0.0"}
                    />
                    <div className="flex items-center border-l border-border px-4 text-sm font-medium text-text-muted">%</div>
                </div>
            </div>
            {slippageError || tooLow || tooHigh ? (
                <div className="pt-1">
                    {slippageError ? (
                        <InlineNotice tone="accent">Enter a valid slippage percentage</InlineNotice>
                    ) : (
                        <InlineNotice tone="primary">
                            {tooLow ? "Your transaction may fail" : "Your transaction may be frontrun"}
                        </InlineNotice>
                    )}
                </div>
            ) : null}
        </SettingGroup>
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
        <SettingGroup title="Transaction Deadline" description="Define how long a pending trade can stay valid.">
            <div className="flex overflow-hidden rounded-lg border border-border bg-panel">
                <Input
                    placeholder={"30"}
                    value={deadlineInput.length > 0 ? deadlineInput : txDeadline === 180 ? "" : (txDeadline / 60).toString()}
                    onChange={(e) => parseCustomDeadline(e.target.value)}
                    onBlur={() => {
                        setDeadlineInput("");
                        setDeadlineError(false);
                    }}
                    className="h-11 rounded-none border-none bg-transparent text-left text-sm font-medium ring-0!"
                />
                <div className="flex items-center border-l border-border px-4 text-sm font-medium text-text-muted select-none">minutes</div>
            </div>
            {deadlineError ? <InlineNotice tone="accent">Enter a value between 1 and 180 minutes.</InlineNotice> : null}
        </SettingGroup>
    );
};
const ExpertMode = () => {
    const {
        isExpertMode,
        actions: { setIsExpertMode },
    } = useUserState();

    return (
        <ToggleRow
            id="expert-mode"
            title="Expert mode"
            description="Allows high slippage trades. Use at your own risk."
            checked={isExpertMode}
            onCheckedChange={setIsExpertMode}
        />
    );
};

const Multihop = () => {
    const {
        isMultihop,
        actions: { setIsMultihop },
    } = useUserState();

    return (
        <ToggleRow
            id="multihop"
            title="Multihop"
            description="Optimized trades across multiple liquidity pools."
            checked={isMultihop}
            onCheckedChange={setIsMultihop}
        />
    );
};

const SplitTrade = () => {
    const {
        isSplit,
        actions: { setIsSplit },
    } = useUserState();

    return (
        <ToggleRow
            id="split"
            title="Split trade"
            description="Split trades across identical pools with different plugins."
            checked={isSplit}
            onCheckedChange={setIsSplit}
        />
    );
};

const SettingGroup = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left">
        <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-text">{title}</h3>
            {description ? <p className="text-sm text-text-muted">{description}</p> : null}
        </div>
        {children}
    </section>
);

const PresetButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <Button className="border" type="button" variant={active ? "secondary" : "outline"} size={"sm"} onClick={onClick}>
        {children}
    </Button>
);

const InlineNotice = ({ tone, children }: { tone: "primary" | "accent"; children: React.ReactNode }) => (
    <div
        className={cn(
            "rounded-xl border px-3 py-2 text-sm",
            tone === "accent" ? "border-accent/25 bg-accent-soft text-primary-foreground" : "border-primary/25 bg-primary-soft text-text",
        )}
    >
        {children}
    </div>
);

const ToggleRow = ({
    id,
    title,
    description,
    checked,
    onCheckedChange,
}: {
    id: string;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) => (
    <section className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left">
        <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-text">
                {title}
            </label>
            <p className="text-sm text-text-muted">{description}</p>
        </div>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </section>
);

export default Settings;
