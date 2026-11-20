/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "dotenv/config";

// Load environment variables from .env file
// Global test configuration
global.console = {
  ...console,
};
// TEMP DEBUG: log slow or failed API calls to diagnose CI-only timeouts. Revert before merge.
/* eslint-disable no-console */
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...[input, init]: Parameters<typeof fetch>) => {
  const start = Date.now();
  const response = await originalFetch(input, init);
  const ms = Date.now() - start;
  if (ms > 5000 || response.status >= 500 || response.status === 429) {
    const body = await response.clone().text().catch(() => "");
    console.log(`[FETCH-DEBUG] ${init?.method ?? "GET"} ${input instanceof Request ? input.url : input.toString()} -> ${response.status} in ${ms}ms headers=${JSON.stringify(Object.fromEntries(response.headers))} body=${body.slice(0, 500)}`);
  }
  return response;
};
