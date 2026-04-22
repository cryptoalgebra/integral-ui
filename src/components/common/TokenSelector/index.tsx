import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { useAlgebraToken } from "@/hooks/common/useAlgebraToken";
import { useCurrency } from "@/hooks/common/useCurrency";
import useDebounce from "@/hooks/common/useDebounce";
import { useFuse } from "@/hooks/common/useFuse";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import CurrencyLogo from "../CurrencyLogo";
import { ADDRESS_ZERO, Currency, ExtendedNative, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { useTokensState } from "@/state/tokensStore";
import { Check, Copy, Search as SearchIcon } from "lucide-react";
import { cn } from "@/utils/common/cn";
import { formatAmount } from "@/utils";
import { DEFAULT_CHAIN_ID, TOKENS } from "config";
import { Input } from "@/components/ui/input";

const TokenSelectorView = {
    DEFAULT_LIST: "DEFAULT_LIST",
    IMPORT_TOKEN: "IMPORT_TOKEN",
    NOT_FOUND: "NOT_FOUND",
};

type TokenSelectorViewType = typeof TokenSelectorView[keyof typeof TokenSelectorView];

type ImportableToken = Currency & {
    address: string;
    symbol?: string;
    name?: string;
    decimals: number;
    chainId: number;
};

const FEATURED_TOKENS = [
    ADDRESS_ZERO,
    WNATIVE[DEFAULT_CHAIN_ID].wrapped.address,
    TOKENS[DEFAULT_CHAIN_ID].USDC.address,
    TOKENS[DEFAULT_CHAIN_ID].USDT.address,
    "0x6fA0BE17e4beA2fCfA22ef89BF8ac9aab0AB0fc9", // A7A5
];

const isTokenLocked = (tokenAddress: string, otherCurrency: Currency | null | undefined) =>
    otherCurrency?.isNative ? tokenAddress === ADDRESS_ZERO : tokenAddress.toLowerCase() === otherCurrency?.wrapped.address.toLowerCase();

const SearchField = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => {
    return (
        <div className="flex items-center gap-2 relative">
            <SearchIcon className="h-4 w-4 left-3 shrink-0 text-text-muted absolute" />
            <Input
                type="text"
                value={query}
                placeholder="Search by name or address"
                autoComplete="off"
                className="pl-9"
                // className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                onUserInput={(e) => onQueryChange(e)}
            />
        </div>
    );
};

const LoadingRow = () => <div className="h-16 w-full rounded-lg border border-border bg-panel animate-pulse" />;

const TokenRow = ({
    account,
    token,
    onSelect,
    otherCurrency,
}: {
    token: TokenFieldsFragment;
    account: Address | undefined;
    onSelect: (currency: Currency) => void;
    otherCurrency: Currency | null | undefined;
}) => {
    const currency = useCurrency(token.id as Address, false);

    const { data: balance, isLoading } = useBalance({
        address: account,
        token: token.id === ADDRESS_ZERO ? undefined : (token.id as Address),
    });

    const balanceString = useMemo(() => {
        if (isLoading || !balance) return "Loading...";

        return formatAmount(balance.formatted, 6);
    }, [balance, isLoading]);

    const lock = isTokenLocked(token.id, otherCurrency);

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        navigator.clipboard.writeText(token.id).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    const isDisabled = lock || !currency;
    const subtitle = currency?.isNative ? `${token.symbol} • Native` : token.symbol;

    return (
        <div
            role="button"
            aria-disabled={isDisabled}
            className={cn(
                "flex w-full items-center cursor-pointer justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent",
                isDisabled ? "pointer-events-none opacity-60" : "hover:bg-panel",
            )}
            onClick={() => currency && onSelect(currency)}
        >
            <div className="flex min-w-0 items-center gap-3">
                <CurrencyLogo currency={currency} size={36} />
                <div className="min-w-0">
                    <div className="truncate text-base font-medium text-text">{token.name}</div>
                    <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <span className="truncate">{subtitle}</span>
                        <button
                            type="button"
                            className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text",
                                isCopied ? "text-primary" : "",
                            )}
                            onClick={handleCopy}
                        >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-base font-medium text-text">{isLoading ? "Loading..." : balance ? balanceString : "0"}</div>
                <div className="text-xs text-text-muted">Balance</div>
            </div>
        </div>
    );
};

const FeaturedTokenButton = ({
    token,
    onSelect,
    otherCurrency,
}: {
    token: TokenFieldsFragment;
    onSelect: (currency: Currency) => void;
    otherCurrency: Currency | null | undefined;
}) => {
    const currency = useCurrency(token.id as Address, false);
    const lock = isTokenLocked(token.id, otherCurrency);

    return (
        <button
            type="button"
            disabled={lock || !currency}
            className="flex-1 flex min-w-20 flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-center transition-colors duration-200 hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-card"
            onClick={() => currency && onSelect(currency)}
        >
            <CurrencyLogo currency={currency} size={28} />
            <span className="text-xs font-medium text-text">{token.symbol}</span>
        </button>
    );
};

const ImportTokenRow = ({ token, onImport }: { token: ImportableToken; onImport: (token: ImportableToken) => void }) => (
    <div className="rounded-lg border border-border bg-panel p-4 text-left">
        <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
                <CurrencyLogo currency={token} size={36} />
                <div className="min-w-0">
                    <div className="truncate text-base font-medium text-text">{token.name}</div>
                    <div className="truncate text-sm text-text-muted">{token.symbol}</div>
                </div>
            </div>
            <Button type="button" variant="primary" size="sm" className="px-4" onClick={() => onImport(token)}>
                Import
            </Button>
        </div>
        <p className="mt-3 text-sm text-text-muted">This token was found by address and is not yet in your saved token list.</p>
    </div>
);

export const TokenSelector = ({
    onSelect,
    otherCurrency,
    showNativeToken,
}: {
    onSelect: (currency: Currency) => void;
    otherCurrency: Currency | null | undefined;
    showNativeToken?: boolean;
}) => {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const [query, setQuery] = useState("");

    const {
        actions: { importToken },
    } = useTokensState();

    const { tokens, isLoading } = useAllTokens(showNativeToken);
    const debouncedQuery = useDebounce(query, 200);
    const tokenEntity = useAlgebraToken(debouncedQuery && isAddress(debouncedQuery) ? (debouncedQuery as Address) : undefined, chainId);

    const fuseOptions = useMemo(
        () => ({
            keys: ["id", "symbol", "name"],
            threshold: 0,
        }),
        [],
    );

    const { result, search } = useFuse<TokenFieldsFragment>({
        data: tokens,
        options: fuseOptions,
    });

    useEffect(() => {
        search(query.trim() || undefined);
    }, [query, search]);

    const normalizedQuery = query.trim();

    const tokenForImport =
        normalizedQuery && tokenEntity && !(tokenEntity instanceof ExtendedNative) && result.length === 0 ? tokenEntity : undefined;

    const selectorView: TokenSelectorViewType = normalizedQuery
        ? result.length > 0
            ? TokenSelectorView.DEFAULT_LIST
            : tokenForImport
            ? TokenSelectorView.IMPORT_TOKEN
            : !isLoading
            ? TokenSelectorView.NOT_FOUND
            : TokenSelectorView.DEFAULT_LIST
        : TokenSelectorView.DEFAULT_LIST;

    const filteredTokens = useMemo(() => (normalizedQuery ? result : tokens), [normalizedQuery, result, tokens]);

    const featuredTokens = useMemo(() => {
        const addressLookup = new Map(tokens.map((token) => [token.id?.toLowerCase(), token]));
        const featured = FEATURED_TOKENS.map((address) =>
            addressLookup.get(address.toLowerCase()),
        ).filter((token): token is TokenFieldsFragment => Boolean(token));

        if (featured.length >= 6) {
            return featured.slice(0, 6);
        }

        return [...featured];
    }, [tokens]);

    const handleImport = (token: ImportableToken) => {
        importToken(token.address as Address, token.symbol || "Unknown", token.name || "Unknown", token.decimals, token.chainId);
        setQuery("");
    };

    return (
        <div className="flex flex-col gap-4 pt-1">
            <SearchField query={query} onQueryChange={setQuery} />
            {!normalizedQuery && featuredTokens.length > 0 ? (
                <div className="flex gap-2 w-full overflow-x-auto pb-1">
                    {featuredTokens.map((token) => (
                        <FeaturedTokenButton key={token.id} token={token} onSelect={onSelect} otherCurrency={otherCurrency} />
                    ))}
                </div>
            ) : null}
            {selectorView === TokenSelectorView.DEFAULT_LIST ? (
                isLoading ? (
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <LoadingRow key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex max-h-112 flex-col gap-0.5 overflow-y-auto pr-1">
                        {filteredTokens.map((token) => (
                            <TokenRow key={token.id} account={account} onSelect={onSelect} token={token} otherCurrency={otherCurrency} />
                        ))}
                    </div>
                )
            ) : selectorView === TokenSelectorView.IMPORT_TOKEN && tokenForImport ? (
                <ImportTokenRow token={tokenForImport} onImport={handleImport} />
            ) : (
                <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-panel px-6 text-center text-sm text-text-muted">
                    Token not found
                </div>
            )}
        </div>
    );
};
