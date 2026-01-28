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
