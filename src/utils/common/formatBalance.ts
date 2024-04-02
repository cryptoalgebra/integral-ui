import { formatCurrency } from './formatCurrency';

export function formatBalance(formattedBalance: string) {
    const balanceNum = Number(formattedBalance);

    if (formattedBalance === '0') return '0';

    if (balanceNum < 0.001) return '<0.001';

    const formattedBalanceNum = Math.floor(balanceNum * 1000) / 1000;

    return formatCurrency.format(formattedBalanceNum);
}
