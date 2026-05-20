import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Token, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { Droplets } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Address, encodeFunctionData, isAddress, multicall3Abi } from "viem";
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import TokenRow, { MintableTokenRow } from "./TokenRow.tsx";

const MINT_SIMULATION_RECIPIENT = "0x1111111111111111111111111111111111111111" as Address;
const MINT_SIMULATION_AMOUNT = 1n;
const CLAIM_BASE_AMOUNT = 1000n;
const MINT_BATCH_SIZE = 64;
const EMPTY_MINTABLE_TOKENS: MintableTokenRow[] = [];

const erc20MintAbi = [
    {
        type: "function",
        name: "mint",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
] as const;

const getClaimAmount = (decimals: number) => CLAIM_BASE_AMOUNT * 10n ** BigInt(Math.max(decimals, 0));

const PoolTokensFaucetModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());

    const chainId = useChainId();
    const { address: account } = useAccount();

    const { tokens } = useAllTokens(false);
    const publicClient = usePublicClient();
    const multicall3Address = publicClient?.chain?.contracts?.multicall3?.address as Address | undefined;

    const { data: claimHash, writeContract: claimTokens, isPending: isClaimPending } = useWriteContract();

    const { isLoading: isClaimTxLoading } = useTransactionAwait(claimHash, {
        title: "Claim faucet tokens",
        type: TransactionType.POOL,
    });

    const addressableTokens = useMemo(() => {
        const uniqueTokens = new Map<string, typeof tokens[number]>();

        for (const token of tokens) {
            if (!isAddress(token.id) || token.id.toLowerCase() === WNATIVE[chainId].address.toLowerCase()) continue;
            uniqueTokens.set(token.id.toLowerCase(), token);
        }

        return [...uniqueTokens.values()];
    }, [tokens, chainId]);

    const tokensSignature = useMemo(
        () => addressableTokens.map((token) => `${token.id}-${token.decimals}-${token.symbol}-${token.name}`).join("|"),
        [addressableTokens],
    );

    const { data: mintableTokensData, isLoading: isMintableLoading, isValidating: isMintableValidating } = useSWR(
        isOpen && publicClient && tokensSignature ? ["pool-faucet-mintable-tokens", publicClient.chain.id, tokensSignature] : null,
        async (): Promise<MintableTokenRow[]> => {
            if (!publicClient) return [];

            const mintable: MintableTokenRow[] = [];

            for (let i = 0; i < addressableTokens.length; i += MINT_BATCH_SIZE) {
                const chunk = addressableTokens.slice(i, i + MINT_BATCH_SIZE);

                const results = await publicClient.multicall({
                    allowFailure: true,
                    account: MINT_SIMULATION_RECIPIENT,
                    contracts: chunk.map((token) => ({
                        address: token.id as Address,
                        abi: erc20MintAbi,
                        functionName: "mint",
                        args: [MINT_SIMULATION_RECIPIENT, MINT_SIMULATION_AMOUNT],
                    })),
                });

                results.forEach((result, index) => {
                    if (result.status !== "success") return;

                    const token = chunk[index];
                    const address = token.id as Address;
                    const decimals = Number(token.decimals);

                    mintable.push({
                        address,
                        decimals,
                        symbol: token.symbol || "Unknown",
                        name: token.name || "Unnamed token",
                        tokenEntity: new Token(chainId, address, decimals, token.symbol || "Unknown", token.name || "Unnamed token"),
                    });
                });
            }

            return mintable;
        },
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
        },
    );

    const mintableTokens = useMemo(() => mintableTokensData ?? EMPTY_MINTABLE_TOKENS, [mintableTokensData]);

    const mintableAddressesKey = useMemo(() => mintableTokens.map((token) => token.address.toLowerCase()).join("|"), [mintableTokens]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedAddresses(new Set());
            return;
        }

        setSelectedAddresses((prev) => {
            const next = new Set(mintableTokens.map((token) => token.address.toLowerCase()));

            if (prev.size === next.size && [...next].every((address) => prev.has(address))) {
                return prev;
            }

            return next;
        });
    }, [isOpen, mintableAddressesKey, mintableTokens]);

    const selectedTokens = useMemo(() => mintableTokens.filter((token) => selectedAddresses.has(token.address.toLowerCase())), [
        mintableTokens,
        selectedAddresses,
    ]);

    const isClaimLoading = isClaimPending || isClaimTxLoading;
    const showLoadingState = (isMintableLoading || isMintableValidating) && !mintableTokens.length;
    const isClaimDisabled = !account || !multicall3Address || !selectedTokens.length || showLoadingState || isClaimLoading;
    const isAllSelected = mintableTokens.length > 0 && selectedTokens.length === mintableTokens.length;

    const handleToggleToken = (tokenAddress: Address, checked: boolean) => {
        const normalizedAddress = tokenAddress.toLowerCase();

        setSelectedAddresses((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.add(normalizedAddress);
            } else {
                next.delete(normalizedAddress);
            }

            return next;
        });
    };

    const handleClaimTokens = () => {
        if (!account || !multicall3Address || !selectedTokens.length) return;

        claimTokens({
            address: multicall3Address,
            abi: multicall3Abi,
            functionName: "aggregate3",
            args: [
                selectedTokens.map((token) => ({
                    target: token.address,
                    allowFailure: false,
                    callData: encodeFunctionData({
                        abi: erc20MintAbi,
                        functionName: "mint",
                        args: [account, getClaimAmount(token.decimals)],
                    }),
                })),
            ],
        });
    };

    const handleSelectAllToggle = () => {
        if (!mintableTokens.length) {
            setSelectedAddresses(new Set());
            return;
        }

        if (isAllSelected) {
            setSelectedAddresses(new Set());
            return;
        }

        setSelectedAddresses(new Set(mintableTokens.map((token) => token.address.toLowerCase())));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"} size={"md"} className="whitespace-nowrap rounded-full gap-2">
                    <Droplets size={18} />
                    Get Pool Tokens
                </Button>
            </DialogTrigger>

            <DialogContent className="md:min-w-[560px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Pool Tokens Faucet</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex w-full justify-between items-center">
                        <span className="text-sm text-muted-foreground">Choose tokens to claim</span>
                        <Button
                            variant={"ghost"}
                            size={"sm"}
                            className="rounded-full"
                            disabled={showLoadingState || !mintableTokens.length || isClaimLoading}
                            onClick={handleSelectAllToggle}
                        >
                            {isAllSelected ? "Deselect all" : "Select all"}
                        </Button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2">
                        {showLoadingState && (
                            <div className="w-full flex justify-center py-12">
                                <Loader />
                            </div>
                        )}

                        {!showLoadingState && !mintableTokens.length && (
                            <div className="w-full py-10 text-center text-muted-foreground">No publicly mintable tokens found.</div>
                        )}

                        {!showLoadingState &&
                            mintableTokens.map((token) => (
                                <TokenRow
                                    key={token.address}
                                    token={token}
                                    checked={selectedAddresses.has(token.address.toLowerCase())}
                                    disabled={isClaimLoading}
                                    onCheckedChange={(checked) => handleToggleToken(token.address, checked)}
                                />
                            ))}
                    </div>

                    <Button
                        variant={"primary"}
                        size={"md"}
                        className="w-full rounded-full"
                        disabled={isClaimDisabled}
                        onClick={handleClaimTokens}
                    >
                        {isClaimLoading ? <Loader /> : `Claim Tokens${selectedTokens.length ? ` (${selectedTokens.length})` : ""}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PoolTokensFaucetModal;
