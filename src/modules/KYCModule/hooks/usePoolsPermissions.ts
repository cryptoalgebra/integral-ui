import { usePoolsActiveModules } from "@/hooks/pools/usePoolActiveModules";
import { allowlistCheckerRegistryAbi, onchainIdAllowlistCheckerAbi } from "@/generated";
import { ALLOWLIST_CHECKER_REGISTRY } from "config";
import { useCallback, useMemo } from "react";
import { Address, Hex, zeroAddress } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { LIQUIDITY_PERMISSION, PERMISSION_ALL, PERMISSION_NONE, PERMISSIONED_POOL_MODULE_NAME, SWAP_PERMISSION } from "../constants";
import { PoolPermissionState, PoolsPermissionsResult, TokenPermissionState } from "../types";

function hasPermission(permission: Hex, flag: bigint): boolean {
    return (BigInt(permission) & flag) !== 0n;
}

function normalizeAddresses(addresses: Address[]): Address[] {
    return [...new Set(addresses.map((address) => address.toLowerCase() as Address))];
}

export function usePoolsPermissions(poolAddresses: Address[]): PoolsPermissionsResult {
    const chainId = useChainId();
    const { address: account } = useAccount();
    const registryAddress = ALLOWLIST_CHECKER_REGISTRY[chainId];
    const normalizedPoolAddresses = useMemo(() => normalizeAddresses(poolAddresses), [poolAddresses]);
    const modules = usePoolsActiveModules(normalizedPoolAddresses);

    const permissionedPoolAddresses = useMemo(
        () =>
            normalizedPoolAddresses.filter((poolAddress) =>
                modules.activeModulesByPool[poolAddress]?.includes(PERMISSIONED_POOL_MODULE_NAME),
            ),
        [modules.activeModulesByPool, normalizedPoolAddresses],
    );
    const permissionedTokens = useMemo(
        () => normalizeAddresses(permissionedPoolAddresses.flatMap((poolAddress) => modules.tokensByPool[poolAddress] || [])),
        [modules.tokensByPool, permissionedPoolAddresses],
    );

    const checkerContracts = useMemo(
        () =>
            registryAddress
                ? permissionedTokens.map((tokenAddress) => ({
                      address: registryAddress,
                      abi: allowlistCheckerRegistryAbi,
                      functionName: "getChecker" as const,
                      args: [tokenAddress] as const,
                  }))
                : [],
        [permissionedTokens, registryAddress],
    );
    const checkerReads = useReadContracts({
        contracts: checkerContracts,
        query: { enabled: !modules.isLoading && !modules.isError && checkerContracts.length > 0 },
    });

    const checkerByToken = useMemo(() => {
        const result: Record<string, Address | undefined> = {};
        permissionedTokens.forEach((tokenAddress, index) => {
            const read = checkerReads.data?.[index];
            if (read?.status === "success" && read.result !== zeroAddress) {
                result[tokenAddress] = read.result as Address;
            }
        });
        return result;
    }, [checkerReads.data, permissionedTokens]);

    const eligibilityInputs = useMemo(
        () =>
            account
                ? permissionedTokens.flatMap((tokenAddress) => {
                      const checkerAddress = checkerByToken[tokenAddress];
                      return checkerAddress ? [{ tokenAddress, checkerAddress }] : [];
                  })
                : [],
        [account, checkerByToken, permissionedTokens],
    );
    const eligibilityContracts = useMemo(
        () =>
            eligibilityInputs.map(({ tokenAddress, checkerAddress }) => ({
                address: checkerAddress,
                abi: onchainIdAllowlistCheckerAbi,
                functionName: "checkAllowlist" as const,
                args: [account!, tokenAddress] as const,
            })),
        [account, eligibilityInputs],
    );
    const eligibilityReads = useReadContracts({
        contracts: eligibilityContracts,
        query: { enabled: eligibilityContracts.length > 0 },
    });

    const tokenPermissions = useMemo(() => {
        const result: Record<string, TokenPermissionState> = {};
        const eligibilityIndex = new Map(eligibilityInputs.map((input, index) => [input.tokenAddress, index]));

        for (const tokenAddress of permissionedTokens) {
            const checkerAddress = checkerByToken[tokenAddress];
            const index = eligibilityIndex.get(tokenAddress);
            const read = index === undefined ? undefined : eligibilityReads.data?.[index];
            const permission = !checkerAddress
                ? PERMISSION_ALL
                : !account
                ? PERMISSION_NONE
                : read?.status === "success"
                ? (read.result as Hex)
                : PERMISSION_NONE;

            result[tokenAddress] = {
                tokenAddress,
                checkerAddress,
                permission,
                isPermissioned: Boolean(checkerAddress),
                canSwap: hasPermission(permission, SWAP_PERMISSION),
                canAddLiquidity: hasPermission(permission, LIQUIDITY_PERMISSION),
                isError: Boolean(checkerAddress && account && read?.status === "failure"),
            };
        }

        return result;
    }, [account, checkerByToken, eligibilityInputs, eligibilityReads.data, permissionedTokens]);

    const permissionsByPool = useMemo(() => {
        const result: Record<string, PoolPermissionState> = {};

        for (const poolAddress of normalizedPoolAddresses) {
            const hasPermissionModule = Boolean(modules.activeModulesByPool[poolAddress]?.includes(PERMISSIONED_POOL_MODULE_NAME));
            const tokens = modules.tokensByPool[poolAddress];
            const token0 = tokens ? tokenPermissions[tokens[0].toLowerCase()] : undefined;
            const token1 = tokens ? tokenPermissions[tokens[1].toLowerCase()] : undefined;
            const poolTokens = [token0, token1].filter((token): token is TokenPermissionState => Boolean(token));
            const isPermissioned = hasPermissionModule && poolTokens.some((token) => token.isPermissioned);

            result[poolAddress] = {
                poolAddress,
                pluginAddress: modules.pluginByPool[poolAddress],
                token0,
                token1,
                hasPermissionModule,
                isPermissioned,
                canSwap: !isPermissioned || poolTokens.every((token) => token.canSwap),
                canAddLiquidity: !isPermissioned || poolTokens.every((token) => token.canAddLiquidity),
                deniedSwapTokens: poolTokens.filter((token) => token.isPermissioned && !token.canSwap).map((token) => token.tokenAddress),
                deniedLiquidityTokens: poolTokens
                    .filter((token) => token.isPermissioned && !token.canAddLiquidity)
                    .map((token) => token.tokenAddress),
            };
        }

        return result;
    }, [modules.activeModulesByPool, modules.pluginByPool, modules.tokensByPool, normalizedPoolAddresses, tokenPermissions]);

    const checkersAreLoading = permissionedTokens.length > 0 && Boolean(registryAddress) && checkerReads.isLoading;
    const configuredCheckerCount = Object.keys(checkerByToken).length;
    const eligibilityIsLoading = Boolean(account) && configuredCheckerCount > 0 && eligibilityReads.isLoading;
    const checkerReadFailed = Boolean(checkerReads.data?.some((read) => read.status === "failure"));
    const isError = modules.isError || (permissionedPoolAddresses.length > 0 && !registryAddress) || checkerReadFailed;

    const refetch = useCallback(async () => {
        const results: unknown[] = [await modules.refetch()];
        if (checkerContracts.length > 0) results.push(await checkerReads.refetch());
        if (eligibilityContracts.length > 0) results.push(await eligibilityReads.refetch());
        return results;
    }, [checkerContracts.length, checkerReads, eligibilityContracts.length, eligibilityReads, modules]);

    return {
        permissionsByPool,
        isLoading: modules.isLoading || checkersAreLoading || eligibilityIsLoading,
        isError,
        refetch,
    };
}

export function usePoolPermissions(poolAddress: Address | undefined) {
    const poolAddresses = useMemo(() => (poolAddress ? [poolAddress] : []), [poolAddress]);
    const result = usePoolsPermissions(poolAddresses);
    const normalizedPoolAddress = poolAddress?.toLowerCase();

    return {
        permission: normalizedPoolAddress ? result.permissionsByPool[normalizedPoolAddress] : undefined,
        isLoading: result.isLoading,
        isError: result.isError,
        refetch: result.refetch,
    };
}
