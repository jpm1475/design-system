// vitest-axe ships its matcher types for older Vitest; register them on Vitest's Matchers.
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown> extends AxeMatchers {}
}
