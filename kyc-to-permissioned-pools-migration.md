# Migration: KYC module → Permissioned Pools module

## Why

The `KycConnector` module (`packages/kyc`, branch `feature/kyc-module`) has been superseded by a new, more general **Permissioned Pools** module (`packages/permissioned-pools`, now wired into `AlgebraUpgradeablePlugin`). Both gate pool access via OnchainID claims, but the architecture is different enough that this is not a drop-in interface swap — read this fully before touching frontend code.

## High-level differences

| | Old: KYC module | New: Permissioned Pools module |
|---|---|---|
| Scope | Whole pool, one global "verified" bit per wallet | **Per-token** — each currency in the pool can have its own checker, or none |
| Identity source | Hardcoded to OnchainID (identity factory + claim topic + trusted issuers), all config lives directly on the plugin | Pluggable `IAllowlistChecker` behind a shared `AllowlistCheckerRegistry`; OnchainID is just the reference implementation (`OnchainIdAllowlistChecker`), not baked into the plugin |
| Real user resolution | `tx.origin` | Every caller must be a registered router - the plugin calls `sender.msgSender()` and trusts what's reported; if `sender` was never approved via `setRouterAllowed`, the call reverts with `RouterNotAllowed` (no fallback to checking the caller's own address) |
| Eligibility result | `bool` (verified / not verified) | `PermissionFlag` bitmask (`SWAP_ALLOWED`, `LIQUIDITY_ALLOWED`, `NONE`, `ALL_ALLOWED`) — swap and liquidity can be gated independently |
| Gated actions | swap, flash, add liquidity, pool init | **swap, add liquidity only** — flash loans and pool initialization are never gated anymore |
| Pause mechanism | `setKycPaused(bool)` — one flag, bypasses everything | No dedicated pause. To stop trading: revoke claims / untrust issuer on the checker, or `PERMISSIONED_POOL_MANAGER` clears/swaps the checker on the registry (clearing fully **unpermissions** the token instead of blocking it — opposite direction from a pause) |
| Config location | All on the plugin itself (per-pool contract) | Split across three places: the plugin (routers only), the shared registry (token → checker), and the checker itself (issuers/topic) |

## Function-by-function mapping

### Reading eligibility (the one frontends actually call before showing swap/add-liquidity UI)

```solidity
// OLD
function isTraderEligible(address wallet) external view returns (bool);

// NEW
function isTraderEligible(address account, address token) external view returns (PermissionFlag);
```

- Now takes a **token** parameter — call it once per currency in the pool you care about (typically both `token0` and `token1`).
- Returns a bitmask, not a bool. Compare with the flags:
  ```solidity
  type PermissionFlag is bytes2;
  PermissionFlag constant NONE = PermissionFlag.wrap(0x0000);
  PermissionFlag constant SWAP_ALLOWED = PermissionFlag.wrap(0x0001);
  PermissionFlag constant LIQUIDITY_ALLOWED = PermissionFlag.wrap(0x0002);
  PermissionFlag constant ALL_ALLOWED = PermissionFlag.wrap(0xFFFF);
  ```
  In ethers/frontend terms: the returned value is a `bytes2` (e.g. `0x0000`, `0x0001`, `0x0002`, `0x0003` for both). Check `(flags & 0x0001) !== 0` for "can swap", `(flags & 0x0002) !== 0` for "can add liquidity". `0xFFFF` (or reading `ALL_ALLOWED` from an unpermissioned token, i.e. no checker assigned / registry unset) means unrestricted.
- Returns `ALL_ALLOWED` (not an error) when the token has no checker assigned, or the registry itself is unset — same "gracefully open" default behavior as before.

### Config that moved off the plugin entirely

These no longer exist on the plugin/connector at all:

```solidity
// REMOVED from the plugin — now on OnchainIdAllowlistChecker (a separate deployed contract per checker instance)
setKycIdentityFactory(address) / kycIdentityFactory()   →  set at OnchainIdAllowlistChecker construction (immutable)
setKycRequiredTopic(uint256) / kycRequiredTopic()       →  OnchainIdAllowlistChecker.setRequiredTopic(uint256) / requiredTopic()
setKycTrustedIssuer(address, bool) / isKycTrustedIssuer →  OnchainIdAllowlistChecker.setTrustedIssuer(address, bool) / isTrustedIssuer(address)
setKycTrustedIssuersBatch(...)                          →  OnchainIdAllowlistChecker.setTrustedIssuersBatch(...)
setKycPaused(bool) / isKycPaused()                      →  no equivalent — see "Pause mechanism" above
```

If the frontend has an admin panel calling any of these on the pool's plugin contract, it now needs to call them on the **`OnchainIdAllowlistChecker` contract instance** instead (a separate deployment, looked up via `AllowlistCheckerRegistry.getChecker(token)`), and there's no direct pause replacement to wire up.

### New things that didn't exist before

```solidity
// On AllowlistCheckerRegistry (shared, one per default-plugin deployment)
function getChecker(address token) external view returns (address);
function setChecker(address token, address checker) external; // PERMISSIONED_POOL_MANAGER only

// On the plugin itself (per-pool)
function allowedRouters(address router) external view returns (bool);
function setRouterAllowed(address router, bool allowed) external; // ALGEBRA_BASE_PLUGIN_MANAGER only
function getAllowlistCheckerRegistry() external view returns (address);
function setAllowlistCheckerRegistry(address registry) external; // ALGEBRA_BASE_PLUGIN_MANAGER only
```

If the frontend wants to determine "is this token permissioned at all" before calling `isTraderEligible`, it can check `AllowlistCheckerRegistry.getChecker(token) != address(0)`.

## Events

```solidity
// OLD (on the plugin)                          // NEW (location changed)
KycIdentityFactoryUpdated(address)               → n/a (immutable on OnchainIdAllowlistChecker)
KycRequiredTopicUpdated(uint256)                 → OnchainIdAllowlistChecker.RequiredTopicUpdated(uint256)
KycTrustedIssuerUpdated(address indexed, bool)   → OnchainIdAllowlistChecker.TrustedIssuerUpdated(address indexed, bool)
KycPausedUpdated(bool)                           → n/a (no pause)
                                                  → NEW: AllowlistCheckerRegistry.CheckerUpdated(address indexed token, address indexed checker)
                                                  → NEW: (plugin) RouterAllowedUpdated(address indexed router, bool)
                                                  → NEW: (plugin) AllowlistCheckerRegistryUpdated(address)
```

If the frontend indexes events to build UI state, the subscription target for issuer/topic changes moves from the pool's plugin address to the relevant `OnchainIdAllowlistChecker` address (looked up via the registry, not a fixed address).

## Real-user resolution: `tx.origin` → router self-report

The old module trusted `tx.origin` directly — no router integration needed, but broken for smart-contract wallets/account abstraction/relayers.

The new module never reads `tx.origin`, and there is no fallback path: **every caller must be a registered router, full stop.** A raw EOA can't call `swap`/`mint` on a real pool directly anyway (Algebra's callback requirement), so in practice the immediate caller is always some periphery/router contract - and if that contract's address was never approved via `setRouterAllowed` on **that specific pool's** plugin instance, the transaction reverts immediately with `RouterNotAllowed(router)`, before any eligibility check even runs. Only once a router is registered does the plugin call `IMsgSender(router).msgSender()` and trust the reported address as the real end user.

This is a **per-pool** trust list, not a global one. If frontend integration currently assumes any router "just works" against a permissioned pool, it won't - every router used to reach a given permissioned pool must be individually registered on that pool's plugin instance, with no exceptions, including for smart-contract wallets acting as their own principal.

## Errors

```solidity
// OLD
error KycNotVerified();

// NEW
error NotAllowed(address token, address account);          // resolved real sender failed the checker's allowlist for this token
error RouterNotAllowed(address router);                     // raw hook sender is not a registered router - reverts before any eligibility check runs
error RouterMsgSenderCallFailed();                          // registered router's msgSender() reverted or misbehaved
```

`NotAllowed` now carries the specific `token` that failed the check, useful for surfacing a more precise error in the UI when a swap reverts (a two-token pool can fail on either side independently). `RouterNotAllowed` is a distinct, earlier failure mode - it means the periphery contract itself was never approved for this pool, regardless of whether the actual end user would have passed the allowlist.

## Checklist for the frontend cutover

1. Replace `isTraderEligible(wallet)` calls with `isTraderEligible(account, token)`, called per-currency, and switch bool handling to bitmask flag checks.
2. Remove any direct calls to `setKyc*`/`isKyc*` on the pool's plugin contract; if an admin UI exists for these, repoint it at the relevant `OnchainIdAllowlistChecker` instance (resolved via `AllowlistCheckerRegistry.getChecker(token)`), and drop the pause toggle (no replacement).
3. Update event subscriptions per the table above — issuer/topic events now come from the checker contract, not the pool's plugin.
4. Every router used to reach a permissioned pool must implement `IMsgSender` and be registered via `setRouterAllowed` on that specific pool - there's no fallback for unregistered callers anymore, they revert outright. This didn't exist in the old module at all.
5. Update error handling: `KycNotVerified` → `NotAllowed(token, account)` / `RouterNotAllowed(router)` / `RouterMsgSenderCallFailed`. `RouterNotAllowed` specifically means the router itself isn't approved for this pool - distinguish it in the UI from `NotAllowed` (the user themselves isn't eligible).
6. Note the flash-loan and pool-init behavior change if the frontend has any UX around those being KYC-gated — they no longer are.
