import CurrencyLogo from "@/components/common/CurrencyLogo";
import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import { useMintActionHandlers, useMintState } from "@/state/mintStore";
import { formatAmount } from "@/utils/common/formatAmount";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useState, useEffect } from "react";
import { ExtendedVault } from "../../hooks";
import AddAutomatedLiquidityButton from "../AddAutomatedLiquidityButton";

interface CreateAutomatedPositionProps {
    vaults?: ExtendedVault[];
    poolId?: string;
}

export function CreateAutomatedPosition({ vaults, poolId }: CreateAutomatedPositionProps) {
    const [selectedVault, setSelectedVault] = useState<ExtendedVault>();
    const { typedValue } = useMintState();

    const { onFieldAInput, onFieldBInput } = useMintActionHandlers(true);

    const parsedAmountA = tryParseAmount(typedValue, selectedVault?.depositToken);

    useEffect(() => {
        return () => {
            onFieldAInput("");
            onFieldBInput("");
        };
    }, []);

    useEffect(() => {
        if (vaults && vaults.length > 0) {
            setSelectedVault(vaults[0]);
        }
    }, [vaults]);

    if (!selectedVault) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-y-3 md:gap-3 text-left">
            <div className="col-span-2">
                <div className="flex flex-col w-full p-4 gap-3 bg-card border border-card-border rounded-xl">
                    <p className="font-semibold">Simplify liquidity provisioning with ALM strategies.</p>
                    <p className="text-text-100/75">
                        Deposit a single token, and automated settings will optimize your position to maximize profits without manual
                        adjustments. Perfect for those seeking simplicity and consistent returns.
                    </p>
                    <form>
                        <fieldset className="flex flex-col gap-2 bg-card">
                            {vaults?.map((vault) => (
                                <label
                                    key={vault.id}
                                    htmlFor={vault.id}
                                    className="grid grid-cols-3 cursor-pointer gap-4 rounded-lg bg-card-hover p-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            id={vault.id}
                                            type="radio"
                                            checked={selectedVault.id === vault.id}
                                            onChange={() => setSelectedVault(vault)}
                                        />
                                        <CurrencyLogo currency={vault.depositToken} size={30} /> {vault.depositToken?.symbol}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">{formatAmount(vault.apr, 2)}%</span>
                                        <span className="text-sm">APR Range</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">${formatAmount(vault.tvlUsd, 2)}</span>
                                        <span className="text-sm">TVL</span>
                                    </div>
                                </label>
                            ))}
                        </fieldset>
                    </form>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex flex-col w-full h-fit gap-2 bg-card border border-card-border rounded-xl p-2">
                    <EnterAmountCard
                        currency={selectedVault.depositToken}
                        value={typedValue}
                        handleChange={(value) => onFieldAInput(value)}
                    />
                    <AddAutomatedLiquidityButton vault={selectedVault} amount={parsedAmountA} poolId={poolId} />
                </div>
            </div>
        </div>
    );
}
