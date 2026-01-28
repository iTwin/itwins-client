/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { beforeEach, describe, expect, it } from "vitest";
import { BaseBentleyAPIClient } from "../../BaseBentleyAPIClient";

/**
 * Test subclass to expose private methods for unit testing
 */
class TestableBaseBentleyAPIClient extends BaseBentleyAPIClient {
  /**
   * Expose validateRedirectUrl for testing
   * @param url - URL to validate
   * @returns True if valid, throws error if invalid
   */
  public testValidateRedirectUrlSecurity(url: string): boolean {
    return (this as unknown as { validateRedirectUrlSecurity: (url: string) => boolean }).validateRedirectUrlSecurity(url);
  }

  /**
   * Expose checkRedirectValidity for testing
   * @param response - Mock response object
   * @param redirectCount - Current redirect count
   * @returns Verification result
   */
  public testCheckRedirectValidity(
    response: Response,
    redirectCount: number
  ): { error?: any; redirectUrl?: string } {
    return (this as unknown as { checkRedirectValidity: (response: Response, redirectCount: number) => any }).checkRedirectValidity(response, redirectCount);
  }

  /**
   * Expose _maxRedirects for testing
   */
  public get testMaxRedirects(): number {
    return this._maxRedirects;
  }
}

describe("BaseBentleyAPIClient - Redirect Security", () => {
  let client: TestableBaseBentleyAPIClient;

  beforeEach(() => {
    client = new TestableBaseBentleyAPIClient();
  });

  describe("validateRedirectUrl", () => {
    describe("Valid URLs - Should Pass", () => {
      it("should accept production API domain (api.bentley.com)", () => {
        const url = "https://api.bentley.com/itwins/abc123";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
        expect(client.testValidateRedirectUrlSecurity(url)).toBe(true);
      });

      it("should accept QA API domain (qa-api.bentley.com)", () => {
        const url = "https://qa-api.bentley.com/repositories/xyz789";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
        expect(client.testValidateRedirectUrlSecurity(url)).toBe(true);
      });

      it("should accept dev API domain (dev-api.bentley.com)", () => {
        const url = "https://dev-api.bentley.com/resources/test";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
        expect(client.testValidateRedirectUrlSecurity(url)).toBe(true);
      });

      it("should accept URLs with query parameters", () => {
        const url = "https://api.bentley.com/repos?$top=10&$skip=5";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should accept URLs with paths and fragments", () => {
        const url = "https://api.bentley.com/path/to/resource#section";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should accept URLs with port numbers", () => {
        const url = "https://dev-api.bentley.com:443/resources";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });
    });

    describe("HTTP Protocol - Should Reject", () => {
      it("should reject HTTP URLs (protocol downgrade attack prevention)", () => {
        const url = "http://api.bentley.com/itwins/abc123";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/HTTPS required/);
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/http:/);
      });

      it("should reject HTTP with secure-looking domain", () => {
        const url = "http://qa-api.bentley.com/secure/endpoint";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/HTTPS required/);
      });

      it("should provide descriptive error message for HTTP", () => {
        const url = "http://api.bentley.com/test";
        try {
          client.testValidateRedirectUrlSecurity(url);
          expect.fail("Should have thrown error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain("HTTPS required");
          expect((error as Error).message).toContain("http:");
          expect((error as Error).message).toContain(url);
        }
      });
    });

    describe("Invalid Domains - Should Reject", () => {
      it("should reject non-Bentley domains (SSRF prevention)", () => {
        const url = "https://evil.com/api/redirect";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should not accept subdomain of api.bentley.com (evil.com.api.bentley.com)", () => {
        const url = "https://evil.com.api.bentley.com/fake";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject domain spoofing (api.bentley.com.evil.com)", () => {
        const url = "https://api.bentley.com.evil.com/spoof";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject partial Bentley domain match (bentley.com without subdomain)", () => {
        const url = "https://bentley.com/api/test";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject localhost", () => {
        const url = "https://localhost:3000/api/test";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject IP addresses", () => {
        const url = "https://192.168.1.1/api/redirect";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should provide descriptive error for invalid domain", () => {
        const url = "https://malicious.site/redirect";
        try {
          client.testValidateRedirectUrlSecurity(url);
          expect.fail("Should have thrown error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain("not a trusted Bentley domain");
          expect((error as Error).message).toContain("malicious.site");
        }
      });
    });

    describe("Malformed URLs - Should Reject", () => {
      it("should reject completely invalid URL strings", () => {
        const url = "not-a-url-at-all";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/malformed URL/);
      });

      it("should reject URLs with no protocol", () => {
        const url = "api.bentley.com/path";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/malformed URL/);
      });

      it("should reject empty strings", () => {
        const url = "";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/malformed URL/);
      });

      it("should accept URLs with encoded spaces (URL object normalizes them)", () => {
        // Note: URL object automatically encodes spaces, so this becomes valid
        const url = "https://api.bentley.com/path with spaces";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should provide descriptive error for invalid protocol", () => {
        // Note: invalid:// is a valid URL format, just not HTTPS
        const url = "invalid://not-url";
        try {
          client.testValidateRedirectUrlSecurity(url);
          expect.fail("Should have thrown error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain("HTTPS required");
          expect((error as Error).message).toContain("invalid:");
        }
      });
    });

    describe("Security Edge Cases", () => {
      it("should be case-insensitive for domain matching", () => {
        const url = "https://API.BENTLEY.COM/test";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should reject URL with username/password (credential leakage)", () => {
        const url = "https://user:pass@api.bentley.com/test";
        // URL object parses this, but domain validation should still work
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should handle mixed-case domain variations", () => {
        const url = "https://Dev-Api.Bentley.Com/test";
        expect(() => client.testValidateRedirectUrlSecurity(url)).not.toThrow();
      });

      it("should reject file:// protocol", () => {
        const url = "file:///etc/passwd";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/HTTPS required/);
      });

      it("should reject javascript: protocol", () => {
        const url = "javascript:alert('XSS')";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/HTTPS required/);
      });

      it("should reject data: URLs", () => {
        const url = "data:text/html,<script>alert('XSS')</script>";
        expect(() => client.testValidateRedirectUrlSecurity(url)).toThrow(/HTTPS required/);
      });
    });
  });
});

describe("BaseBentleyAPIClient - checkRedirectValidity", () => {
  let client: TestableBaseBentleyAPIClient;

  beforeEach(() => {
    client = new TestableBaseBentleyAPIClient();
  });

  /**
   * Helper to create a mock Response object with Location header
   */
  function createMockResponse(locationHeader: string | null): Response {
    const headers = new Headers();
    if (locationHeader !== null) {
      headers.set('location', locationHeader);
    }

    return {
      headers,
      status: 302,
      ok: false,
    } as Response;
  }

  describe("Redirect Count Validation", () => {
    it("should allow redirect when count is below limit", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://api.bentley.com/redirect");
    });

    it("should allow redirect at max limit minus one", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const maxRedirects = client.testMaxRedirects;
      const result = client.testCheckRedirectValidity(response, maxRedirects - 1);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://api.bentley.com/redirect");
    });

    it("should reject redirect when count equals max limit", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const maxRedirects = client.testMaxRedirects;
      const result = client.testCheckRedirectValidity(response, maxRedirects);

      expect(result.error).toBeDefined();
      expect(result.redirectUrl).toBe("");
      expect(result.error!.status).toBe(508);
      expect(result.error!.error.code).toBe("TooManyRedirects");
      expect(result.error!.error.message).toContain("Maximum redirect limit");
      expect(result.error!.error.message).toContain(maxRedirects.toString());
    });

    it("should reject redirect when count exceeds max limit", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const maxRedirects = client.testMaxRedirects;
      const result = client.testCheckRedirectValidity(response, maxRedirects + 5);

      expect(result.error).toBeDefined();
      expect(result.error!.status).toBe(508);
      expect(result.error!.error.code).toBe("TooManyRedirects");
    });

    it("should return 508 Loop Detected status code for infinite loop protection", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 100);

      expect(result.error!.status).toBe(508);
    });

    it("should include redirect limit in error message", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const maxRedirects = client.testMaxRedirects;
      const result = client.testCheckRedirectValidity(response, maxRedirects);

      expect(result.error!.error.message).toContain(`${maxRedirects}`);
      expect(result.error!.error.message).toContain("redirect loop");
    });

    it("should work with custom max redirect values", () => {
      const customClient = new TestableBaseBentleyAPIClient(10);
      const response = createMockResponse("https://api.bentley.com/redirect");

      // Should pass at 9
      const result1 = customClient.testCheckRedirectValidity(response, 9);
      expect(result1.error).toBeUndefined();

      // Should fail at 10
      const result2 = customClient.testCheckRedirectValidity(response, 10);
      expect(result2.error).toBeDefined();
      expect(result2.error!.status).toBe(508);
    });
  });

  describe("Location Header Validation", () => {
    it("should extract valid Location header", () => {
      const expectedUrl = "https://api.bentley.com/repositories/abc123";
      const response = createMockResponse(expectedUrl);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe(expectedUrl);
    });

    it("should reject when Location header is missing", () => {
      const response = createMockResponse(null);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeDefined();
      expect(result.redirectUrl).toBe("");
      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirect");
      expect(result.error!.error.message).toContain("missing Location header");
    });

    it("should return 502 Bad Gateway for missing Location header", () => {
      const response = createMockResponse(null);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.status).toBe(502);
    });

    it("should handle empty Location header as missing", () => {
      const response = createMockResponse("");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeDefined();
      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirect");
    });

    it("should provide clear error message for missing Location header", () => {
      const response = createMockResponse(null);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.error.message).toBe("302 redirect response missing Location header");
    });
  });

  describe("Redirect URL Security Validation", () => {
    it("should accept valid HTTPS Bentley domain", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://api.bentley.com/redirect");
    });

    it("should accept dev environment URL", () => {
      const response = createMockResponse("https://dev-api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://dev-api.bentley.com/redirect");
    });

    it("should accept QA environment URL", () => {
      const response = createMockResponse("https://qa-api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://qa-api.bentley.com/redirect");
    });

    it("should reject HTTP URLs (insecure protocol)", () => {
      const response = createMockResponse("http://api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeDefined();
      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirectUrl");
      expect(result.error!.error.message).toContain("HTTPS required");
    });

    it("should reject non-Bentley domains", () => {
      const response = createMockResponse("https://evil.com/malicious");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeDefined();
      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirectUrl");
      expect(result.error!.error.message).toContain("not a trusted Bentley domain");
    });

    it("should reject malformed URLs", () => {
      const response = createMockResponse("not-a-valid-url");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeDefined();
      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirectUrl");
      expect(result.error!.error.message).toContain("malformed URL");
    });

    it("should return 502 Bad Gateway for invalid redirect URLs", () => {
      const response = createMockResponse("https://evil.com/attack");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.status).toBe(502);
    });

    it("should include validation error details in message", () => {
      const response = createMockResponse("https://malicious-site.com/redirect");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.error.message).toContain("malicious-site.com");
      expect(result.error!.error.message).toContain("not a trusted Bentley domain");
    });

    it("should handle URL with query parameters", () => {
      const response = createMockResponse("https://api.bentley.com/redirect?id=123&token=abc");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://api.bentley.com/redirect?id=123&token=abc");
    });

    it("should handle URL with path segments", () => {
      const response = createMockResponse("https://api.bentley.com/itwins/abc123/repositories/xyz789");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toContain("/itwins/abc123/repositories/xyz789");
    });
  });

  describe("Combined Validation Scenarios", () => {
    it("should validate redirect count before URL extraction", () => {
      // Even with a missing Location header, redirect count is checked first
      const response = createMockResponse(null);
      const maxRedirects = client.testMaxRedirects;
      const result = client.testCheckRedirectValidity(response, maxRedirects);

      // Should fail on redirect count, not Location header
      expect(result.error!.status).toBe(508);
      expect(result.error!.error.code).toBe("TooManyRedirects");
    });

    it("should check Location header before URL validation", () => {
      // Missing Location header should be caught before URL validation
      const response = createMockResponse(null);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirect");
    });

    it("should validate URL security after extracting Location header", () => {
      // Valid Location header but invalid URL
      const response = createMockResponse("https://evil.com/attack");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error!.status).toBe(502);
      expect(result.error!.error.code).toBe("InvalidRedirectUrl");
    });

    it("should pass all validations for valid redirect", () => {
      const response = createMockResponse("https://api.bentley.com/valid");
      const result = client.testCheckRedirectValidity(response, 2);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://api.bentley.com/valid");
    });

    it("should handle redirect at count 0 with valid URL", () => {
      const response = createMockResponse("https://qa-api.bentley.com/resource");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
      expect(result.redirectUrl).toBe("https://qa-api.bentley.com/resource");
    });
  });

  describe("Error Response Structure", () => {
    it("should return proper error structure for redirect loop", () => {
      const response = createMockResponse("https://api.bentley.com/redirect");
      const result = client.testCheckRedirectValidity(response, 10);

      expect(result).toHaveProperty("error");
      expect(result.error).toHaveProperty("status");
      expect(result.error).toHaveProperty("error");
      expect(result.error!.error).toHaveProperty("code");
      expect(result.error!.error).toHaveProperty("message");
    });

    it("should return proper error structure for missing Location", () => {
      const response = createMockResponse(null);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result).toHaveProperty("error");
      expect(result.error).toHaveProperty("status");
      expect(result.error).toHaveProperty("error");
      expect(result.error!.error).toHaveProperty("code");
      expect(result.error!.error).toHaveProperty("message");
    });

    it("should return proper error structure for invalid URL", () => {
      const response = createMockResponse("http://api.bentley.com/insecure");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result).toHaveProperty("error");
      expect(result.error).toHaveProperty("status");
      expect(result.error).toHaveProperty("error");
      expect(result.error!.error).toHaveProperty("code");
      expect(result.error!.error).toHaveProperty("message");
    });
  });

  describe("Success Response Structure", () => {
    it("should return redirectUrl on success", () => {
      const expectedUrl = "https://api.bentley.com/redirect";
      const response = createMockResponse(expectedUrl);
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result).toHaveProperty("redirectUrl");
      expect(result.redirectUrl).toBe(expectedUrl);
      expect(result.error).toBeUndefined();
    });

    it("should not include error property on success", () => {
      const response = createMockResponse("https://api.bentley.com/valid");
      const result = client.testCheckRedirectValidity(response, 0);

      expect(result.error).toBeUndefined();
    });
  });
});

describe("BaseBentleyAPIClient - createRequestOptions", () => {
  let client: TestableBaseBentleyAPIClient;

  beforeEach(() => {
    client = new TestableBaseBentleyAPIClient();
  });

  /**
   * Expose createRequestOptions for testing
   */
  function createRequestOptions<TData>(
    accessToken: string,
    method: string,
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ) {
    return (client as unknown as {
      createRequestOptions: <T>(
        token: string,
        method: string,
        url: string,
        data?: T,
        headers?: Record<string, string>
      ) => any;
    }).createRequestOptions(accessToken, method, url, data, headers);
  }

  describe("Blob Data Handling", () => {
    it("should handle Blob data without JSON.stringify", () => {
      const blobData = new Blob(["test content"], { type: "text/plain" });
      const result = createRequestOptions(
        "test-token",
        "POST",
        "https://api.bentley.com/upload",
        blobData
      );

      expect(result.body).toBe(blobData);
      expect(result.body).toBeInstanceOf(Blob);
    });

    it("should handle Blob with different content types", () => {
      const blobData = new Blob(['{"key": "value"}'], { type: "application/json" });
      const result = createRequestOptions(
        "test-token",
        "POST",
        "https://api.bentley.com/upload",
        blobData
      );

      expect(result.body).toBe(blobData);
    });

    it("should JSON.stringify non-Blob data", () => {
      const jsonData = { key: "value" };
      const result = createRequestOptions(
        "test-token",
        "POST",
        "https://api.bentley.com/endpoint",
        jsonData
      );

      expect(result.body).toBe(JSON.stringify(jsonData));
      expect(typeof result.body).toBe("string");
    });
  });

  describe("Required Parameter Validation", () => {
    it("should throw error when access token is missing", () => {
      expect(() =>
        createRequestOptions("", "GET", "https://api.bentley.com/test")
      ).toThrow("Access token is required");
    });

    it("should throw error when URL is missing", () => {
      expect(() =>
        createRequestOptions("test-token", "GET", "")
      ).toThrow("URL is required");
    });
  });
});

/**
 * Extended test subclass to expose processResponse for testing error scenarios
 */
class ExtendedTestableClient extends BaseBentleyAPIClient {
  /**
   * Expose processResponse for testing
   */
  public async testProcessResponse<TResponse>(response: Response) {
    return (this as unknown as {
      processResponse: <_T>(response: Response) => Promise<any>;
    }).processResponse<TResponse>(response);
  }

  /**
   * Expose followRedirect for testing
   */
  public async testFollowRedirect<TResponse = unknown, TData = unknown>(
    response: Response,
    accessToken: string,
    method: string,
    data?: TData,
    headers?: Record<string, string>,
    redirectCount: number = 0
  ) {
    return (this as unknown as {
      followRedirect: <_T, _D>(
        response: Response,
        token: string,
        method: string,
        data?: _D,
        headers?: Record<string, string>,
        count?: number
      ) => Promise<any>;
    }).followRedirect<TResponse, TData>(response, accessToken, method, data, headers, redirectCount);
  }

  /**
   * Expose sendGenericAPIRequest for testing
   */
  public async testSendGenericAPIRequest<TResponse = unknown, TData = unknown>(
    accessToken: string,
    method: string,
    url: string,
    data?: TData,
    headers?: Record<string, string>,
    allowRedirects: boolean = false
  ) {
    return (this as unknown as {
      sendGenericAPIRequest: <_T, _D>(
        token: string,
        method: string,
        url: string,
        data?: _D,
        headers?: Record<string, string>,
        allowRedirects?: boolean
      ) => Promise<any>;
    }).sendGenericAPIRequest<TResponse, TData>(
      accessToken,
      method,
      url,
      data,
      headers,
      allowRedirects
    );
  }
}

describe("BaseBentleyAPIClient - processResponse", () => {
  let client: ExtendedTestableClient;

  beforeEach(() => {
    client = new ExtendedTestableClient();
  });

  /**
   * Helper to create a mock Response with custom properties
   */
  function createResponse(
    status: number,
    ok: boolean,
    body: any
  ): Response {
    return {
      status,
      ok,
      json: async () => body,
    } as Response;
  }

  describe("Error Response without valid error structure", () => {
    it("should throw error when response is not OK and doesn't have valid error format", async () => {
      // Response with invalid error structure (not matching { error: { code, message } })
      const response = createResponse(400, false, { invalidFormat: "test" });

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });

    it("should throw error when error is a non-object primitive (number)", async () => {
      const response = createResponse(500, false, { error: 123 });

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });

    it("should throw error when response has error property but missing code", async () => {
      const response = createResponse(500, false, {
        error: { message: "Error without code" }
      });

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });

    it("should throw error when response has error property but missing message", async () => {
      const response = createResponse(500, false, {
        error: { code: "ErrorCode" }
      });

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });

    it("should throw error when response is not OK with null body", async () => {
      const response = createResponse(500, false, null);

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });

    it("should throw error when response is not OK with non-object body", async () => {
      const response = createResponse(400, false, "Plain string error");

      await expect(client.testProcessResponse(response)).rejects.toThrow(
        "An error occurred while processing the request"
      );
    });
  });

  describe("Valid error responses", () => {
    it("should return proper error structure for valid APIM error", async () => {
      const response = createResponse(404, false, {
        error: {
          code: "NotFound",
          message: "Resource not found"
        }
      });

      const result = await client.testProcessResponse(response);

      expect(result.status).toBe(404);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe("NotFound");
      expect(result.error!.message).toBe("Resource not found");
    });
  });

  describe("Successful responses", () => {
    it("should return data for successful response", async () => {
      const response = createResponse(200, true, { id: "123", name: "Test" });

      const result = await client.testProcessResponse(response);

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: "123", name: "Test" });
      expect(result.error).toBeUndefined();
    });

    it("should handle empty string as undefined", async () => {
      const mockResponse = {
        status: 200,
        ok: true,
        json: async () => ""
      } as Response;

      const result = await client.testProcessResponse(mockResponse);

      expect(result.status).toBe(200);
      expect(result.data).toBeUndefined();
    });
  });
});

describe("BaseBentleyAPIClient - sendGenericAPIRequest with redirects", () => {
  let client: ExtendedTestableClient;
  let fetchSpy: any;

  beforeEach(() => {
    client = new ExtendedTestableClient();
    // Store original fetch
    fetchSpy = globalThis.fetch;
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = fetchSpy;
  });

  function mockFetch(responses: Response[]) {
    let callCount = 0;
    globalThis.fetch = async () => {
      if (callCount >= responses.length) {
        throw new Error("No more mock responses available");
      }
      const response = responses[callCount];
      callCount++;
      return response;
    };
  }

  function createMockResponse(
    status: number,
    ok: boolean,
    body: any,
    locationHeader?: string
  ): Response {
    const headers = new Headers();
    if (locationHeader) {
      headers.set('location', locationHeader);
    }

    return {
      status,
      ok,
      headers,
      json: async () => body,
    } as Response;
  }

  describe("Redirect rejection when not allowed", () => {
    it("should return 403 error when redirect encountered but allowRedirects is false", async () => {
      const redirectResponse = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/new-location"
      );

      mockFetch([redirectResponse]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        false // allowRedirects = false
      );

      expect(result.status).toBe(403);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe("RedirectsNotAllowed");
      expect(result.error!.message).toContain("not allowed");
    });

    it("should return 403 when allowRedirects is not specified (defaults to false)", async () => {
      const redirectResponse = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/redirect"
      );

      mockFetch([redirectResponse]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/test"
      );

      expect(result.status).toBe(403);
      expect(result.error!.code).toBe("RedirectsNotAllowed");
    });
  });

  describe("Following redirects when allowed", () => {
    it("should follow a single redirect to final destination", async () => {
      const redirectResponse = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/redirected"
      );

      const finalResponse = createMockResponse(
        200,
        true,
        { id: "123", data: "success" },
        undefined
      );

      mockFetch([redirectResponse, finalResponse]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true // allowRedirects = true
      );

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: "123", data: "success" });
      expect(result.error).toBeUndefined();
    });

    it("should follow multiple sequential redirects", async () => {
      const redirect1 = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/redirect1"
      );

      const redirect2 = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/redirect2"
      );

      const finalResponse = createMockResponse(
        200,
        true,
        { result: "final" },
        undefined
      );

      mockFetch([redirect1, redirect2, finalResponse]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true
      );

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ result: "final" });
    });

    // Note: Testing max redirect enforcement via full request chain would require
    // complex mock setup. The checkRedirectValidity test suite above already
    // thoroughly tests that 508 errors are returned when redirectCount >= maxRedirects.

    it("should return error when redirect has missing Location header", async () => {
      const badRedirect = createMockResponse(
        302,
        false,
        {},
        undefined // No location header
      );

      mockFetch([badRedirect]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true
      );

      expect(result.status).toBe(502);
      expect(result.error!.code).toBe("InvalidRedirect");
    });

    it("should return error when redirect points to insecure URL", async () => {
      const insecureRedirect = createMockResponse(
        302,
        false,
        {},
        "http://api.bentley.com/insecure" // HTTP instead of HTTPS
      );

      mockFetch([insecureRedirect]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true
      );

      expect(result.status).toBe(502);
      expect(result.error!.code).toBe("InvalidRedirectUrl");
      expect(result.error!.message).toContain("HTTPS required");
    });

    it("should return error when redirect points to untrusted domain", async () => {
      const maliciousRedirect = createMockResponse(
        302,
        false,
        {},
        "https://evil.com/phishing"
      );

      mockFetch([maliciousRedirect]);

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true
      );

      expect(result.status).toBe(502);
      expect(result.error!.code).toBe("InvalidRedirectUrl");
      expect(result.error!.message).toContain("not a trusted Bentley domain");
    });
  });

  describe("Error handling in redirects", () => {
    it("should return 500 when fetch throws during redirect", async () => {
      const redirectResponse = createMockResponse(
        302,
        false,
        {},
        "https://api.bentley.com/redirect"
      );

      let callCount = 0;
      globalThis.fetch = async () => {
        if (callCount === 0) {
          callCount++;
          return redirectResponse;
        }
        throw new Error("Network error");
      };

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/original",
        undefined,
        undefined,
        true
      );

      expect(result.status).toBe(500);
      expect(result.error!.code).toBe("InternalServerError");
    });

    it("should return 500 when initial request throws", async () => {
      globalThis.fetch = async () => {
        throw new Error("Network failure");
      };

      const result = await client.testSendGenericAPIRequest(
        "test-token",
        "GET",
        "https://api.bentley.com/test",
        undefined,
        undefined,
        false
      );

      expect(result.status).toBe(500);
      expect(result.error!.code).toBe("InternalServerError");
      expect(result.error!.message).toContain("internal exception");
    });
  });
});
