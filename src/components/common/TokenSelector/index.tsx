import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { useAlgebraToken } from "@/hooks/common/useAlgebraToken";
import { useCurrency } from "@/hooks/common/useCurrency";
import useDebounce from "@/hooks/common/useDebounce";
import { useFuse } from "@/hooks/common/useFuse";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import { Address, isAddress } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import CurrencyLogo from "../CurrencyLogo";
import { ADDRESS_ZERO, Currency, ExtendedNative, Token } from "@cryptoalgebra/custom-pools-sdk";
import { useTokensState } from "@/state/tokensStore";
import { Copy } from "lucide-react";
import { cn } from "@/utils/common/cn";
import { formatAmount } from "@/utils";

const TokenSelectorView = {
    DEFAULT_LIST: "DEFAULT_LIST",
    IMPORT_TOKEN: "IMPORT_TOKEN",
    NOT_FOUND: "NOT_FOUND",
};

type TokenSelectorViewType = typeof TokenSelectorView[keyof typeof TokenSelectorView];

const Search = ({
    data,
    onSearch,
}: {
    data: TokenFieldsFragment[];
    onSearch: (matchedTokens: TokenFieldsFragment[], importToken: Token | undefined) => void;
}) => {
    const chainId = useChainId();

    const [query, setQuery] = useState<Address | string | undefined>(undefined);
    const debouncedQuery = useDebounce(query, 200);
    const tokenEntity = useAlgebraToken(debouncedQuery && isAddress(debouncedQuery) ? debouncedQuery : undefined, chainId);

    const fuseOptions = useMemo(
        () => ({
            keys: ["id", "symbol", "name"],
            threshold: 0,
        }),
        []
    );

    const { result, pattern, search } = useFuse<TokenFieldsFragment>({
        data,
        options: fuseOptions,
    });

    const handleInput = (input: string | undefined) => {
        setQuery(input);
    };

    useEffect(() => {
        search(query);
    }, [query, search]);

    useEffect(() => {
        onSearch(result, tokenEntity instanceof ExtendedNative ? undefined : tokenEntity);
    }, [result, tokenEntity, pattern, onSearch]);

    return (
        <input
            type="text"
            placeholder="Search name or paste address"
            autoComplete="off"
            className="w-full px-4 py-3 bg-card-dark rounded-xl border"
            onChange={(e) => handleInput(e.target.value)}
        />
    );
};

const LoadingRow = () => <div className="w-full mb-4 h-[60px] text-left bg-card rounded-2xl animate-pulse"></div>;

const TokenRow = ({
    account,
    token,
    onSelect,
    otherCurrency,
    style,
}: {
    token: TokenFieldsFragment;
    account: Address | undefined;
    onSelect: (currency: Currency) => void;
    otherCurrency: Currency | null | undefined;
    style: React.CSSProperties;
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

    const lock = otherCurrency?.isNative
        ? token.id === ADDRESS_ZERO
        : token.id.toLowerCase() === otherCurrency?.wrapped.address.toLowerCase();

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        navigator.clipboard.writeText(token.id).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    return (
        <button
            disabled={lock}
            className="flex items-center justify-between w-full py-2 px-3 text-left bg-card rounded-2xl duration-75 hover:bg-card-hover disabled:hover:bg-card disabled:opacity-60"
            onClick={() => currency && onSelect(currency)}
            style={{ ...style, height: 76 - 16 }}
        >
            <div className="flex items-center gap-4">
                <div>
                    <CurrencyLogo currency={currency} size={32} />
                </div>
                <div>
                    <div className="flex gap-2 text-base font-bold">
                        <div>{token.symbol}</div>
                        <button
                            className={cn(
                                'relative duration-75 hover:text-white/70 after:absolute after:text-xs after:left-5 after:top-1 after:content-["Copied"] after:duration-100',
                                isCopied ? "after:block" : "after:hidden"
                            )}
                            onClick={handleCopy}
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                    <div className="text-sm">{token.name}</div>
                </div>
            </div>
            <div>{isLoading ? "Loading..." : balance ? balanceString : ""}</div>
        </button>
    );
};

const ImportTokenRow = ({ token, onImport }: { token: Token; onImport: (token: Token) => void }) => (
    <div className="flex justify-between w-full text-left">
        <div className="flex items-center gap-4">
            <div>
                <CurrencyLogo currency={token} size={32} />
            </div>
            <div>
                <div>{token.symbol}</div>
                <div>{token.name}</div>
            </div>
        </div>
        <button
            className="px-4 bg-primary-button text-primary-foreground font-bold hover:bg-primary-button/80 rounded-2xl text-md"
            onClick={() => onImport(token)}
        >
            Import
        </button>
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

    const [selectorView, setSelectorView] = useState<TokenSelectorViewType>(TokenSelectorView.DEFAULT_LIST);

    const {
        actions: { importToken },
    } = useTokensState();

    const { tokens, isLoading } = useAllTokens(showNativeToken);

    const [matchedTokens, setMatchedTokens] = useState<TokenFieldsFragment[]>([]);
    const [tokenForImport, setTokenForImport] = useState<Token>();

    const filteredTokens = useMemo(() => (matchedTokens.length ? matchedTokens : tokens), [tokens, matchedTokens]);

    const handleSearch = (matchedTokens: TokenFieldsFragment[], importToken: Token | undefined) => {
        if (matchedTokens.length) {
            setMatchedTokens(matchedTokens);
            setSelectorView(TokenSelectorView.DEFAULT_LIST);
        } else if (importToken) {
            setTokenForImport(importToken);
            setSelectorView(TokenSelectorView.IMPORT_TOKEN);
        } else if (!isLoading) {
            setSelectorView(TokenSelectorView.NOT_FOUND);
        }
    };

    const handleImport = (token: Token) => {
        importToken(token.address as Address, token.symbol || "Unknown", token.name || "Unknown", token.decimals, token.chainId);
        setSelectorView(TokenSelectorView.DEFAULT_LIST);
        setTokenForImport(undefined);
    };

    const Row = useCallback(
        ({ data, index, style }: { data: TokenFieldsFragment[]; index: number; style: React.CSSProperties }) => {
            const token = data[index];

            if (!token) return null;

            return <TokenRow account={account} onSelect={onSelect} token={token} otherCurrency={otherCurrency} style={style} />;
        },
        [account, onSelect, otherCurrency]
    );

    const itemKey = useCallback((index: number, data: TokenFieldsFragment[]) => {
        const currency = data[index];
        return currency.id;
    }, []);

    return (
        <div className="flex flex-col gap-6 pt-2">
            <Search data={tokens} onSearch={handleSearch} />
            {selectorView === TokenSelectorView.DEFAULT_LIST ? (
                isLoading ? (
                    <FixedSizeList height={304} itemData={[]} itemCount={4} itemSize={76} width={"100%"}>
                        {LoadingRow}
                    </FixedSizeList>
                ) : (
                    <FixedSizeList
                        width={"100%"}
                        height={304}
                        itemData={filteredTokens}
                        itemCount={filteredTokens.length}
                        itemKey={itemKey}
                        itemSize={76}
                    >
                        {Row}
                    </FixedSizeList>
                )
            ) : selectorView === TokenSelectorView.IMPORT_TOKEN && tokenForImport ? (
                <ImportTokenRow token={tokenForImport} onImport={handleImport} />
            ) : (
                <div className="flex items-center justify-center h-[304px]">Token not found</div>
            )}
        </div>
    );
};
