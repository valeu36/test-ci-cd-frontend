/**
 * The suite's entry point. Every spec imports `test` and `expect` from here and
 * never from `@playwright/test` directly.
 *
 * There is nothing to extend right now — every test runs against the REAL
 * backend the webServer booted, with no interception at all. The seam stays so
 * a future fixture lands in one file instead of five.
 */
export { expect, test } from "@playwright/test";
