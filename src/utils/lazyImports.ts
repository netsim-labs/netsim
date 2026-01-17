import { lazy, ComponentType } from 'react';

// Wrapper for lazy loading with minimum load time (to avoid flashes)
export function lazyImport<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    minLoadTimeMs = 300
): any {
    return lazy(() =>
        Promise.all([
            factory(),
            new Promise(resolve => setTimeout(resolve, minLoadTimeMs)),
        ]).then(([moduleExports]) => moduleExports as { default: T })
    );
}
