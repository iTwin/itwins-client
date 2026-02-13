/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { createTestServer } from "./test-server.js";

/** Result shape returned by {@link executeRedirectScenario}. */
interface RedirectScenarioResult {
  response: { status: number; data?: unknown; error?: { code: string } };
  fetchCalls: Array<{ input: string | URL; init?: RequestInit }>;
}

/** Navigates the page to the test server root. */
const loadTestPage = async (page: Page, serverUrl: string): Promise<void> => {
  await page.goto(`${serverUrl}/`);
};

/**
 * Executes a redirect test scenario in the browser context.
 *
 * Sets up a fetch mock, creates a TestClient that extends
 * BaseBentleyAPIClient, and makes a single request.
 *
 * @param mockAlwaysOpaque - When `true` every fetch returns an opaque
 *   redirect. When `false` only the first fetch is opaque and subsequent
 *   calls return a 200 success response.
 */
const executeRedirectScenario = async (
  page: Page,
  serverUrl: string,
  options: { allowRedirects: boolean; mockAlwaysOpaque: boolean },
): Promise<RedirectScenarioResult> =>
  page.evaluate(
    async ({ baseUrl, allowRedirects, mockAlwaysOpaque }) => {
      const moduleUrl = new URL(
        "/lib/esm/BaseBentleyAPIClient.js",
        baseUrl,
      ).toString();
      const { BaseBentleyAPIClient } = await import(moduleUrl);
      const baseBentleyApiClient =
        BaseBentleyAPIClient as typeof BaseBentleyAPIClient;

      const originalFetch = globalThis.fetch;
      const fetchCalls: Array<{ input: string | URL; init?: RequestInit }> = [];

      globalThis.fetch = (async (
        input: string | URL,
        init?: RequestInit,
      ) => {
        fetchCalls.push({ input, init });

        if (mockAlwaysOpaque || fetchCalls.length === 1) {
          return {
            type: "opaqueredirect",
            status: 0,
            ok: false,
            headers: new Headers(),
            json: async () => {
              throw new Error("opaque redirect");
            },
          } as unknown as Response;
        }

        return {
          type: "basic",
          status: 200,
          ok: true,
          redirected: true,
          url: "https://api.bentley.com/final",
          headers: new Headers(),
          json: async () => ({ ok: true }),
        } as unknown as Response;
      }) as typeof fetch;

      class TestClient extends baseBentleyApiClient {
        public async request(url: string, allowRedir: boolean) {
          return this.sendGenericAPIRequest(
            "test-token",
            "GET",
            url,
            undefined,
            undefined,
            allowRedir,
          );
        }
      }

      const client = new TestClient();
      const response = await client.request(
        `${baseUrl}/redirect`,
        allowRedirects,
      );
      globalThis.fetch = originalFetch;
      return { response, fetchCalls };
    },
    {
      baseUrl: serverUrl,
      allowRedirects: options.allowRedirects,
      mockAlwaysOpaque: options.mockAlwaysOpaque,
    },
  );

test.describe("Feature: Browser redirect handling", () => {
  let serverUrl: string;
  let closeServer: () => Promise<void>;

  test.beforeAll(async () => {
    const server = await createTestServer();
    serverUrl = server.baseUrl;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer();
  });

  test.describe(
    "Scenario: Client follows opaque redirect when redirects are allowed",
    () => {
      test("should retry with redirect: follow and return success", async ({
        page,
      }) => {
        let result!: RedirectScenarioResult;

        await test.step(
          "Given a page loaded from the test server",
          async () => {
            await loadTestPage(page, serverUrl);
          },
        );

        await test.step(
          "When the client makes a request with allowRedirects=true and receives an opaque redirect",
          async () => {
            result = await executeRedirectScenario(page, serverUrl, {
              allowRedirects: true,
              mockAlwaysOpaque: false,
            });
          },
        );

        await test.step(
          "Then the response should be 200 with the expected data",
          async () => {
            expect(result.response.status).toBe(200);
            expect(result.response.data).toEqual({ ok: true });
            expect(result.response.error).toBeUndefined();
          },
        );

        await test.step(
          "And the client should have made 2 fetch calls, retrying with redirect: follow",
          async () => {
            expect(result.fetchCalls.length).toBe(2);
            expect(result.fetchCalls[1].init?.redirect).toBe("follow");
          },
        );
      });
    },
  );

  test.describe(
    "Scenario: Client returns 403 when redirects are not allowed",
    () => {
      test("should return RedirectsNotAllowed error", async ({ page }) => {
        let result!: RedirectScenarioResult;

        await test.step(
          "Given a page loaded from the test server",
          async () => {
            await loadTestPage(page, serverUrl);
          },
        );

        await test.step(
          "When the client makes a request with allowRedirects=false and receives an opaque redirect",
          async () => {
            result = await executeRedirectScenario(page, serverUrl, {
              allowRedirects: false,
              mockAlwaysOpaque: true,
            });
          },
        );

        await test.step(
          "Then the response should be 403 with RedirectsNotAllowed error code",
          async () => {
            expect(result.response.status).toBe(403);
            expect(result.response.error?.code).toBe("RedirectsNotAllowed");
          },
        );

        await test.step(
          "And the client should have made only 1 fetch call",
          async () => {
            expect(result.fetchCalls.length).toBe(1);
          },
        );
      });
    },
  );
});
