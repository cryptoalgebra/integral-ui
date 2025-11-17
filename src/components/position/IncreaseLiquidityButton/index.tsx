import { AddLiquidityButton } from "@/components/create-position/AddLiquidityButton";
import { IDerivedMintInfo } from "@/state/mintStore";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";

interface IncreaseLiquidityButtonProps {
    baseCurrency: Currency | undefined | null;
    quoteCurrency: Currency | undefined | null;
    mintInfo: IDerivedMintInfo;
    tokenId?: number;
    handleCloseModal?: () => void;
}

export const IncreaseLiquidityButton = ({
    mintInfo,
    tokenId,
    baseCurrency,
    quoteCurrency,
    handleCloseModal,
}: IncreaseLiquidityButtonProps) => {
    return (
        <AddLiquidityButton
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            mintInfo={mintInfo}
            tokenId={tokenId}
            handleCloseModal={handleCloseModal}
        />
    );
};

export default IncreaseLiquidityButton;
