declare global {
    type Account = `0x${string}`;

    type Maybe<T> = T | null | undefined;
    type MaybeArray<T> = T | T[] | null | undefined;
    type MaybePromise<T> = T | Promise<T> | null | undefined;
    type Position = 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left';
}

export { };
