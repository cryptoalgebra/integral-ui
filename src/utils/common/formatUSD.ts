export const formatUSD = new Intl.NumberFormat("en-us", {
    currency: "USD",
    style: "currency",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});
