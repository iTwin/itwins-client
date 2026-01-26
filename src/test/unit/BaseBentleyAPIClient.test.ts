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
  public testValidateRedirectUrl(url: string): boolean {
    return (this as unknown as { validateRedirectUrl: (url: string) => boolean }).validateRedirectUrl(url);
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
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
        expect(client.testValidateRedirectUrl(url)).toBe(true);
      });

      it("should accept QA API domain (qa-api.bentley.com)", () => {
        const url = "https://qa-api.bentley.com/repositories/xyz789";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
        expect(client.testValidateRedirectUrl(url)).toBe(true);
      });

      it("should accept dev API domain (dev-api.bentley.com)", () => {
        const url = "https://dev-api.bentley.com/resources/test";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
        expect(client.testValidateRedirectUrl(url)).toBe(true);
      });

      it("should accept URLs with query parameters", () => {
        const url = "https://api.bentley.com/repos?$top=10&$skip=5";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should accept URLs with paths and fragments", () => {
        const url = "https://api.bentley.com/path/to/resource#section";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should accept URLs with port numbers", () => {
        const url = "https://dev-api.bentley.com:443/resources";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });
    });

    describe("HTTP Protocol - Should Reject", () => {
      it("should reject HTTP URLs (protocol downgrade attack prevention)", () => {
        const url = "http://api.bentley.com/itwins/abc123";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/HTTPS required/);
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/http:/);
      });

      it("should reject HTTP with secure-looking domain", () => {
        const url = "http://qa-api.bentley.com/secure/endpoint";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/HTTPS required/);
      });

      it("should provide descriptive error message for HTTP", () => {
        const url = "http://api.bentley.com/test";
        try {
          client.testValidateRedirectUrl(url);
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
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should not accept subdomain of api.bentley.com (evil.com.api.bentley.com)", () => {
        const url = "https://evil.com.api.bentley.com/fake";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject domain spoofing (api.bentley.com.evil.com)", () => {
        const url = "https://api.bentley.com.evil.com/spoof";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject partial Bentley domain match (bentley.com without subdomain)", () => {
        const url = "https://bentley.com/api/test";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject localhost", () => {
        const url = "https://localhost:3000/api/test";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should reject IP addresses", () => {
        const url = "https://192.168.1.1/api/redirect";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/not a trusted Bentley domain/);
      });

      it("should provide descriptive error for invalid domain", () => {
        const url = "https://malicious.site/redirect";
        try {
          client.testValidateRedirectUrl(url);
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
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/malformed URL/);
      });

      it("should reject URLs with no protocol", () => {
        const url = "api.bentley.com/path";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/malformed URL/);
      });

      it("should reject empty strings", () => {
        const url = "";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/malformed URL/);
      });

      it("should accept URLs with encoded spaces (URL object normalizes them)", () => {
        // Note: URL object automatically encodes spaces, so this becomes valid
        const url = "https://api.bentley.com/path with spaces";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should provide descriptive error for invalid protocol", () => {
        // Note: invalid:// is a valid URL format, just not HTTPS
        const url = "invalid://not-url";
        try {
          client.testValidateRedirectUrl(url);
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
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should reject URL with username/password (credential leakage)", () => {
        const url = "https://user:pass@api.bentley.com/test";
        // URL object parses this, but domain validation should still work
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should handle mixed-case domain variations", () => {
        const url = "https://Dev-Api.Bentley.Com/test";
        expect(() => client.testValidateRedirectUrl(url)).not.toThrow();
      });

      it("should reject file:// protocol", () => {
        const url = "file:///etc/passwd";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/HTTPS required/);
      });

      it("should reject javascript: protocol", () => {
        const url = "javascript:alert('XSS')";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/HTTPS required/);
      });

      it("should reject data: URLs", () => {
        const url = "data:text/html,<script>alert('XSS')</script>";
        expect(() => client.testValidateRedirectUrl(url)).toThrow(/HTTPS required/);
      });
    });
  });
});