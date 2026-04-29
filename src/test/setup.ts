import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    addBreadcrumb: vi.fn(),
    browserTracingIntegration: vi.fn(() => ({})),
    replayIntegration: vi.fn(() => ({})),
    withScope: vi.fn(),
    setTag: vi.fn(),
    setExtra: vi.fn(),
    setUser: vi.fn(),
    ErrorBoundary: ({ children }: { children: ReactNode }) => children
}));

vi.mock('@utils/sentryConfig', () => ({
    initSentry: vi.fn(),
    captureException: vi.fn(),
    addBreadcrumb: vi.fn()
}));

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn()
});

if (!('getEntriesByType' in performance)) {
    Object.defineProperty(performance, 'getEntriesByType', {
        writable: true,
        value: vi.fn(() => [])
    });
}
