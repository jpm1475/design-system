import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
expect.extend(matchers);
// Vitest globals are off, so Testing Library can't register its own auto-cleanup.
afterEach(cleanup);
