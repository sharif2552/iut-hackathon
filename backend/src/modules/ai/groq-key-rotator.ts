/**
 * Round-robin over valid Groq keys. Used ONLY for resilience (retry on
 * 429/5xx/timeout), never to bypass quotas. Empty keys are excluded by config.
 */
export class GroqKeyRotator {
  private index = 0;

  constructor(private readonly keys: string[]) {}

  get count(): number {
    return this.keys.length;
  }

  hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /** Returns keys to attempt in order for a single request, starting where we left off. */
  order(): string[] {
    if (this.keys.length === 0) return [];
    const rotated: string[] = [];
    for (let i = 0; i < this.keys.length; i++) {
      rotated.push(this.keys[(this.index + i) % this.keys.length]!);
    }
    this.index = (this.index + 1) % this.keys.length;
    return rotated;
  }
}
