import CurrencyLogo from "@/components/common/CurrencyLogo";
import AddAutomatedLiquidityButton from "@/components/create-position/AddAutomatedLiquidityButton";
import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import { ExtendedVault } from "@/hooks/alm/useALMVaults";
import { useMintActionHandlers, useMintState } from "@/state/mintStore";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useState, useEffect } from "react";

interface CreateAutomatedPositionProps {
    vaults?: ExtendedVault[];
}

export function CreateAutomatedPosition({ vaults }: CreateAutomatedPositionProps) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3  w-full lg:gap-8 mt-8 lg:mt-16 text-left">
            <div className="col-span-2">
                <div className="flex items-center justify-between w-full mb-6">
                    <h2 className="font-semibold text-2xl text-left">1. Select Strategy</h2>
                </div>

                <div className="flex flex-col w-full p-4 gap-4 bg-card border border-card-border rounded-3xl">
                    <p className="p-2 ">
                        <span className="font-semibold">Simplify liquidity provisioning with ALM strategies.</span>
                        <br />
                        <span>
                            Deposit a single token, and automated settings will optimize your position to maximize profits without manual
                            adjustments. Perfect for those seeking simplicity and consistent returns.
                        </span>
                    </p>
                    <form>
                        <fieldset className="flex flex-col gap-2 bg-card">
                            {vaults?.map((vault) => (
                                <label htmlFor={vault.id} className="grid grid-cols-3 cursor-pointer gap-4 rounded-2xl bg-card-dark p-4">
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
                                        <span className="font-semibold">{Math.abs(vault.apr).toFixed(2)}%</span>
                                        <span className="text-sm">APR Range</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">${vault.tvlUsd.toFixed(2)}</span>
                                        <span className="text-sm">TVL</span>
                                    </div>
                                </label>
                            ))}
                        </fieldset>
                    </form>

                    {/* <img
                        alt="ichi-strategy"
                        src="https://docs.ichi.org/~gitbook/image?url=https%3A%2F%2F1172929898-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FOUojwAvkzrENCQOkhMq6%252Fuploads%252Fwp6zE7EaX39OBZr9SDT4%252Fimage.png%3Falt%3Dmedia%26token%3D4e677895-df0c-4834-bef6-28a403e99abd&width=768&dpr=4&quality=100&sign=8cf81481&sv=2"
                    /> */}
                </div>
            </div>

            <div className="flex flex-col">
                <h2 className="font-semibold text-2xl text-left mb-6">2. Enter Amount</h2>

                <div className="flex flex-col w-full h-fit gap-2 bg-card border border-card-border rounded-3xl p-2">
                    <EnterAmountCard
                        currency={selectedVault.depositToken}
                        value={typedValue}
                        handleChange={(value) => onFieldAInput(value)}
                    />
                    <AddAutomatedLiquidityButton vault={selectedVault} amount={parsedAmountA} />
                </div>
            </div>
        </div>
    );
}
