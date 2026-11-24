import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { configureApi } from '../data/api';

// jsdom does not implement matchMedia / ResizeObserver.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// jsdom has no layout, so Recharts' ResponsiveContainer measures 0x0 and warns. That is a
// test-environment artefact only; drop that one message and keep every other warning.
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].startsWith('The width(0) and height(0) of chart'))
    return;
  originalWarn(...args);
};

beforeEach(() => {
  configureApi({ minLatency: 0, maxLatency: 0, failRequests: false });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
