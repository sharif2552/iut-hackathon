import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'resolve-js-to-ts',
      enforce: 'pre',
      async resolveId(source, importer) {
        if (importer && source.startsWith('.') && source.endsWith('.js')) {
          const asTs = source.slice(0, -3) + '.ts';
          const resolved = await this.resolve(asTs, importer, { skipSelf: true });
          if (resolved) return resolved.id;
        }
        return null;
      },
    },
  ],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
