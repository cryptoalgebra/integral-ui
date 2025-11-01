import { useEffect, useState } from "react";

/**
 * Hook для debounce значений
 * Откладывает обновление значения на указанное время
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Устанавливаем таймер для обновления debounced значения
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Очищаем таймер при изменении value или delay
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
