import {
    ADDRESS_ZERO,
    BoostedRoute,
    BoostedRouteStepType,
    Currency,
    Pool,
    Route,
    computeCustomPoolAddress,
    computePoolAddress,
} from "@cryptoalgebra/integral-sdk";
import { Address, Hex, encodeAbiParameters, keccak256 } from "viem";

export function getSdkPoolAddress(pool: Pool): Address {
    if (pool.deployer && pool.deployer.toLowerCase() !== ADDRESS_ZERO.toLowerCase()) {
        return computeCustomPoolAddress({
            tokenA: pool.token0,
            tokenB: pool.token1,
            customPoolDeployer: pool.deployer as Address,
        }) as Address;
    }

    return computePoolAddress({ tokenA: pool.token0, tokenB: pool.token1 }) as Address;
}

export function getRoutePoolAddresses(
    route: Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
): Address[] {
    const pools = route.isBoosted
        ? route.steps
              .filter((step) => step.type === BoostedRouteStepType.SWAP)
              .map((step) => step.pool)
        : route.pools;

    return [...new Set(pools.map((pool) => getSdkPoolAddress(pool).toLowerCase()))] as Address[];
}

export function getTradePoolAddresses(trade: any): Address[] {
    if (!trade) return [];

    const addresses: Address[] = [];

    if (Array.isArray(trade.routes)) {
        for (const route of trade.routes) {
            for (const pool of route.pools || []) {
                if (pool?.type === 1 && pool.address) addresses.push(pool.address as Address);
            }
        }
    } else {
        for (const swap of trade.swaps || []) {
            const route = swap.route;
            if (route) addresses.push(...getRoutePoolAddresses(route));
        }
    }

    return [...new Set(addresses.map((address) => address.toLowerCase()))] as Address[];
}

export function getGatewayAuthorizationDigest(identityOwner: Address, salt: string, signatureExpiry: bigint): Hex {
    return keccak256(
        encodeAbiParameters(
            [{ type: "string" }, { type: "address" }, { type: "string" }, { type: "uint256" }],
            ["Authorize ONCHAINID deployment", identityOwner, salt, signatureExpiry],
        ),
    );
}

export function getClaimDigest(identityAddress: Address, topic: bigint, data: Hex): Hex {
    return keccak256(
        encodeAbiParameters([{ type: "address" }, { type: "uint256" }, { type: "bytes" }], [identityAddress, topic, data]),
    );
}

export function getClaimId(issuerIdentityAddress: Address, topic: bigint): Hex {
    return keccak256(
        encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [issuerIdentityAddress, topic]),
    );
}
