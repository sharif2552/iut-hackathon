import { describe, expect, it } from 'vitest';
import { timeAgo, severityColor } from '../src/lib/format';

describe('format helpers', () => {
  it('formats recent times as seconds/minutes ago', () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 5_000).toISOString())).toMatch(/s ago$/);
    expect(timeAgo(new Date(now - 120_000).toISOString())).toBe('2m ago');
    expect(timeAgo(new Date(now - 2 * 3_600_000).toISOString())).toBe('2h ago');
  });

  it('maps severities to color classes', () => {
    expect(severityColor.CRITICAL).toContain('crit');
    expect(severityColor.WARNING).toContain('warn');
  });
});
