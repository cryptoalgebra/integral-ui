export function formatPrice(price: string | number, decimals: number) {
    const priceNum = Number(price);

    if (priceNum === 0) return '0';

    if (priceNum < 0.001) return '<0.001';

    const formattedPriceNum = Math.floor(priceNum * 10 ** decimals) / 10 ** decimals;

    return formattedPriceNum.toString();
}
