/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { test, expect } from "@playwright/test";
import { createTestServer } from "./test-server";

test.describe("Browser redirect handling", () => {
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

  test("follows opaque redirect when allowed", async ({ page }) => {
    await page.goto(`${serverUrl}/`);

    const result = await page.evaluate(async (baseUrl) => {
      const moduleUrl = new URL("/lib/esm/BaseBentleyAPIClient.js", baseUrl).toString();
      const { BaseBentleyAPIClient } = await import(moduleUrl);

      const originalFetch = globalThis.fetch;
      const fetchCalls: Array<{ input: string | URL; init?: RequestInit }> = [];
      globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
        fetchCalls.push({ input, init });
        if (fetchCalls.length === 1) {
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

      class TestClient extends BaseBentleyAPIClient {
        public async request(url: string, allowRedirects: boolean) {
          return this.sendGenericAPIRequest(
            "test-token",
            "GET",
            url,
            undefined,
            undefined,
            allowRedirects
          );
        }
      }

      const client = new TestClient();
      const response = await client.request(`${baseUrl}/redirect`, true);
      globalThis.fetch = originalFetch;
      return { response, fetchCalls };
    }, serverUrl);

    expect(result.response.status).toBe(200);
    expect(result.response.data).toEqual({ ok: true });
    expect(result.response.error).toBeUndefined();
    expect(result.fetchCalls.length).toBe(2);
    expect(result.fetchCalls[1].init?.redirect).toBe("follow");
  });

  test("returns 403 when opaque redirect not allowed", async ({ page }) => {
    await page.goto(`${serverUrl}/`);

    const result = await page.evaluate(async (baseUrl) => {
      const moduleUrl = new URL("/lib/esm/BaseBentleyAPIClient.js", baseUrl).toString();
      const { BaseBentleyAPIClient } = await import(moduleUrl);

      const originalFetch = globalThis.fetch;
      const fetchCalls: Array<{ input: string | URL; init?: RequestInit }> = [];
      globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
        fetchCalls.push({ input, init });
        return {
          type: "opaqueredirect",
          status: 0,
          ok: false,
          headers: new Headers(),
          json: async () => {
            throw new Error("opaque redirect");
          },
        } as unknown as Response;
      }) as typeof fetch;

      class TestClient extends BaseBentleyAPIClient {
        public async request(url: string, allowRedirects: boolean) {
          return this.sendGenericAPIRequest(
            "test-token",
            "GET",
            url,
            undefined,
            undefined,
            allowRedirects
          );
        }
      }

      const client = new TestClient();
      const response = await client.request(`${baseUrl}/redirect`, false);
      globalThis.fetch = originalFetch;
      return { response, fetchCalls };
    }, serverUrl);

    expect(result.response.status).toBe(403);
    expect(result.response.error?.code).toBe("RedirectsNotAllowed");
    expect(result.fetchCalls.length).toBe(1);
  });
});
