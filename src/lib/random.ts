/**
 * Mulberry32: a tiny, fast, seedable PRNG. Same seed => same sequence,
 * which keeps the mock dataset fully deterministic across reloads and tests.
 */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Integer in [min, max] (inclusive). */
    int(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    /** Float in [min, max). */
    float(min: number, max: number): number {
      return next() * (max - min) + min;
    },
    pick<T>(items: readonly T[]): T {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('pick() called with an empty array');
      return item;
    },
    /** Picks an item using relative weights. */
    weighted<T>(items: readonly (readonly [T, number])[]): T {
      const total = items.reduce((sum, [, w]) => sum + w, 0);
      let r = next() * total;
      for (const [item, w] of items) {
        r -= w;
        if (r <= 0) return item;
      }
      const last = items[items.length - 1];
      if (!last) throw new Error('weighted() called with an empty array');
      return last[0];
    },
    /** Roughly bell-shaped noise in [-1, 1] (Irwin-Hall, n=3). */
    noise(): number {
      return (next() + next() + next()) / 1.5 - 1;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
