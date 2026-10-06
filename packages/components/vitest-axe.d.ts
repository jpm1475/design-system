// vitest-axe ships its matcher types for older Vitest; register them on Vitest's Matchers.
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // The type parameter must match Vitest's declaration for the merge to apply.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<T = unknown> extends AxeMatchers {}
}
