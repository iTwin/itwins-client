/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { beforeEach, describe, expect, it } from "vitest";
import { BaseITwinsApiClient } from "../../BaseITwinsApiClient";
import { ITwinsClient } from "../../iTwinsClient";

/**
 * Test subclass to expose protected methods for unit testing
 */
class TestableBaseITwinsApiClient extends ITwinsClient {
  public testGetQueryStringArg<T>(mapping: any, queryArg?: T): string {
    return (this as any).getQueryStringArg(mapping, queryArg);
  }
}

describe("BaseITwinsApiClient - Query Parameter Building", () => {
  let client: TestableBaseITwinsApiClient;

  beforeEach(() => {
    client = new TestableBaseITwinsApiClient();
  });

  describe("getQueryStringArg - Query String Building", () => {
    it("should return empty string for undefined args", () => {
      const mapping = { search: "$search", top: "$top" };
      const result = client.testGetQueryStringArg(mapping, undefined);
      expect(result).toBe("");
    });

    it("should return empty string for null args", () => {
      const mapping = { search: "$search" };
      const result = client.testGetQueryStringArg(mapping, null);
      expect(result).toBe("");
    });

    it("should build query string with single parameter", () => {
      const mapping = { search: "$search" };
      const args = { search: "test" };
      const result = client.testGetQueryStringArg(mapping, args);
      expect(result).toBe("$search=test");
    });

    it("should build query string with multiple parameters", () => {
      const mapping = { search: "$search", top: "$top", skip: "$skip" };
      const args = { search: "project", top: 10, skip: 5 };
      const result = client.testGetQueryStringArg(mapping, args);

      // Should contain all parameters joined with &
      expect(result).toContain("$search=project");
      expect(result).toContain("$top=10");
      expect(result).toContain("$skip=5");
      expect(result.split("&")).toHaveLength(3);
    });

    it("should skip undefined values", () => {
      const mapping = { search: "$search", top: "$top" };
      const args = { search: "test", top: undefined };
      const result = client.testGetQueryStringArg(mapping, args);
      expect(result).toBe("$search=test");
      expect(result).not.toContain("$top");
    });

    it("should skip null values", () => {
      const mapping = { search: "$search", top: "$top" };
      const args = { search: "test", top: null };
      const result = client.testGetQueryStringArg(mapping, args);
      expect(result).toBe("$search=test");
      expect(result).not.toContain("$top");
    });

    it("should URL encode special characters", () => {
      const mapping = { search: "$search" };
      const args = { search: "test & special/chars?value=123" };
      const result = client.testGetQueryStringArg(mapping, args);

      expect(result).toContain("$search=");
      expect(result).toContain(encodeURIComponent("test & special/chars?value=123"));
      expect(result).not.toContain("&special"); // Should be encoded
    });

    it("should handle boolean values", () => {
      const mapping = { flag: "includeInactive" };
      const args = { flag: true };
      const result = client.testGetQueryStringArg(mapping, args);
      expect(result).toBe("includeInactive=true");
    });

    it("should handle number values", () => {
      const mapping = { count: "$top", offset: "$skip" };
      const args = { count: 25, offset: 0 };
      const result = client.testGetQueryStringArg(mapping, args);

      expect(result).toContain("$top=25");
      expect(result).toContain("$skip=0");
    });

    it("should handle empty string values", () => {
      const mapping = { search: "$search" };
      const args = { search: "" };
      const result = client.testGetQueryStringArg(mapping, args);
      expect(result).toBe("$search=");
    });

    it("should skip parameters with empty string mapping", () => {
      const mapping = { search: "$search", internal: "" };
      const args = { search: "test", internal: "value" };
      const result = client.testGetQueryStringArg(mapping, args);

      expect(result).toBe("$search=test");
      expect(result).not.toContain("internal");
    });

    it("should handle complex real-world iTwins query", () => {
      const mapping = {
        search: "$search",
        top: "$top",
        skip: "$skip",
        orderBy: "$orderBy"
      };
      const args = {
        search: "Infrastructure Project",
        top: 50,
        skip: 100,
        orderBy: "displayName"
      };
      const result = client.testGetQueryStringArg(mapping, args);

      expect(result).toContain(`$search=${encodeURIComponent("Infrastructure Project")}`);
      expect(result).toContain("$top=50");
      expect(result).toContain("$skip=100");
      expect(result).toContain("$orderBy=displayName");
    });

    it("should handle OData query parameters", () => {
      const mapping = {
        filter: "$filter",
        select: "$select",
        orderBy: "$orderBy"
      };
      const args = {
        filter: "status eq 'Active'",
        select: "id,displayName",
        orderBy: "createdDateTime desc"
      };
      const result = client.testGetQueryStringArg(mapping, args);

      expect(result).toContain(`$filter=${encodeURIComponent("status eq 'Active'")}`);
      expect(result).toContain("$select=id%2CdisplayName");
      expect(result).toContain("$orderBy=createdDateTime%20desc");
    });
  });

  describe("Base URL Configuration", () => {
    it("should use default production URL when not specified", () => {
      const defaultClient = new ITwinsClient();
      expect((defaultClient as any)._baseUrl).toBe("https://api.bentley.com/itwins");
    });

    it("should use dev environment when IMJS_URL_PREFIX is set", () => {
      globalThis.IMJS_URL_PREFIX = "dev-";
      const devClient = new ITwinsClient();
      expect((devClient as any)._baseUrl).toBe("https://dev-api.bentley.com/itwins");
      globalThis.IMJS_URL_PREFIX = undefined;
    });

    it("should use QA environment when IMJS_URL_PREFIX is set", () => {
      globalThis.IMJS_URL_PREFIX = "qa-";
      const qaClient = new ITwinsClient();
      expect((qaClient as any)._baseUrl).toBe("https://qa-api.bentley.com/itwins");
      globalThis.IMJS_URL_PREFIX = undefined;
    });

    it("should use custom URL when provided in constructor", () => {
      const customClient = new ITwinsClient("https://custom.api.com/itwins");
      expect((customClient as any)._baseUrl).toBe("https://custom.api.com/itwins");
    });

    it("should prefer constructor URL over global prefix", () => {
      globalThis.IMJS_URL_PREFIX = "dev-";
      const customClient = new ITwinsClient("https://custom.api.com/itwins");
      expect((customClient as any)._baseUrl).toBe("https://custom.api.com/itwins");
      globalThis.IMJS_URL_PREFIX = undefined;
    });
  });

  describe("Parameter Mappings", () => {
    it("should have iTwinsQueryParamMapping as static property", () => {
      const mapping = (BaseITwinsApiClient as any).iTwinsQueryParamMapping;
      expect(mapping).toBeDefined();
      expect(mapping).toHaveProperty("search");
      expect(mapping.search).toBe("$search");
    });

    it("should have ITwinsGetQueryParamMapping as static property", () => {
      const mapping = (BaseITwinsApiClient as any).ITwinsGetQueryParamMapping;
      expect(mapping).toBeDefined();
      expect(mapping).toHaveProperty("search");
    });

    it("should have repositoryParamMapping as static property", () => {
      const mapping = (BaseITwinsApiClient as any).repositoryParamMapping;
      expect(mapping).toBeDefined();
      expect(mapping).toHaveProperty("class");
    });

    it("should have ODataParamMapping as static property", () => {
      const mapping = (BaseITwinsApiClient as any).ODataParamMapping;
      expect(mapping).toBeDefined();
      expect(mapping).toHaveProperty("search");
      expect(mapping.search).toBe("$search");
    });
  });
});
