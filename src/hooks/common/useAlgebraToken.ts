import { useMemo } from "react"
import { Address, useToken } from "wagmi"
import { Token } from "@cryptoalgebra/integral-sdk"
import { ExtendedNative } from "@cryptoalgebra/integral-sdk"
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk"
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id"

export function useAlgebraToken(address: Address | undefined) {

    if (!address) return

    const isETH = address === ADDRESS_ZERO

    const { data: tokenData, isLoading } = useToken({
        address: isETH ? undefined : address,
        chainId: DEFAULT_CHAIN_ID
    })

    return useMemo(() => {

        if (address === ADDRESS_ZERO) return ExtendedNative.onChain(DEFAULT_CHAIN_ID)

        if (isLoading || !tokenData) return undefined

        const { symbol, name, decimals } = tokenData

        return new Token(
            DEFAULT_CHAIN_ID,
            address,
            decimals,
            symbol,
            name
        );


    }, [address, tokenData, isLoading])

}