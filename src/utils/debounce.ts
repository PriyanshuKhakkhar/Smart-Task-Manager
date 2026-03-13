export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;

    return function(this: unknown, ...args: Parameters<T>) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}
