import { useMemo } from "react"
import { Address, useToken } from "wagmi"
import { Token } from "@cryptoalgebra/sdk"
import { ExtendedNative } from "@cryptoalgebra/sdk"
import { ADDRESS_ZERO } from "@cryptoalgebra/sdk"
import { DEFAULT_CHAIN_ID, DEFAULT_NATIVE_NAME, DEFAULT_NATIVE_SYMBOL } from "@/constants/default-chain-id"

export function useAlgebraToken(address: Address | undefined) {

    const isETH = address === ADDRESS_ZERO

    const { data: tokenData, isLoading } = useToken({
        address: isETH ? undefined : address,
        chainId: DEFAULT_CHAIN_ID
    })

    return useMemo(() => {

        if (!address) return

        if (address === ADDRESS_ZERO) return ExtendedNative.onChain(DEFAULT_CHAIN_ID, DEFAULT_NATIVE_SYMBOL, DEFAULT_NATIVE_NAME)

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
