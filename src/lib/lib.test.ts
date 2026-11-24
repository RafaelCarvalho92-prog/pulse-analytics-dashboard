import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';
import { formatDelta, percentChange } from './format';
import { createRng } from './random';

describe('lib utilities', () => {
  it('escapes CSV cells containing commas, quotes and newlines', () => {
    const csv = toCsv(
      [{ name: 'Acme, Inc.', note: 'says "hi"\nthere' }],
      [
        { header: 'Name', value: (r) => r.name },
        { header: 'Note', value: (r) => r.note },
      ],
    );
    expect(csv).toBe('Name,Note\r\n"Acme, Inc.","says ""hi""\nthere"');
  });

  it('computes and formats percentage deltas safely', () => {
    expect(percentChange(110, 100)).toBeCloseTo(10);
    expect(percentChange(5, 0)).toBe(0);
    expect(formatDelta(12.345)).toBe('+12.3%');
    expect(formatDelta(-3)).toBe('-3.0%');
  });

  it('seeded RNG is reproducible and stays in range', () => {
    const a = createRng(1);
    const b = createRng(1);
    const seqA = Array.from({ length: 50 }, () => a.int(1, 6));
    const seqB = Array.from({ length: 50 }, () => b.int(1, 6));
    expect(seqA).toEqual(seqB);
    expect(seqA.every((n) => n >= 1 && n <= 6)).toBe(true);
  });
});
