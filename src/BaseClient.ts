/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import type { ITwinsQueryArg } from "./iTwinsAccessProps";
import { hasProperty, ParameterMapping } from "./types/typeUtils";
import { ApimError, APIResponse } from "./types/CommonApiTypes.ts";
import { Repository } from "./types/Repository";

/**
 * Common HTTP methods used in API requests
 */
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Configuration object for HTTP requests
 */
interface RequestConfig {
  method: Method;
  url: string;
  body?: string | Blob;
  headers: Record<string, string>;
}

/**
 * Type guard to validate if an object is a valid Error structure
 * @param error - Unknown object to validate
 * @returns True if the object is a valid Error type
 */
function isValidError(error: unknown): error is ApimError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const obj = error as Record<string, unknown>;
  return typeof obj.code === "string" && typeof obj.message === "string";
}

/**
 * Type guard to validate if response data contains an error
 * @param data - Unknown response data to validate
 * @returns True if the data contains a valid Error object
 */
function isErrorResponse(data: unknown): data is { error: ApimError } {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return "error" in obj && isValidError(obj.error);
}

/**
 * Base client class providing common functionality for iTwins API requests.
 * Handles authentication, request configuration, and query string building.
 */
export class BaseClient {
  protected _baseUrl: string = "https://api.bentley.com/itwins";

  /**
   * Maps the properties of {@link ITwinsQueryArg} to their corresponding query parameter names.
   *
   * @remarks
   * This mapping is used to translate internal property names to the expected parameter names
   * when constructing iTwins queries. Properties mapped to empty strings are excluded from
   * the query string as they should be sent as headers instead.
   *
   * The mapping includes both OData query parameters (prefixed with $) and iTwins-specific
   * parameters for filtering and pagination.
   *
   * @readonly
   */
  private static readonly QUERY_PARAM_MAPPING: ParameterMapping<ITwinsQueryArg> =
    {
      subClass: "subClass",
      type: "type",
      status: "status",
      search: "$search",
      displayName: "displayName",
      // eslint-disable-next-line id-denylist
      number: "number",
      top: "$top",
      skip: "$skip",
      parentId: "parentId",
      iTwinAccountId: "iTwinAccountId",
      includeInactive: "includeInactive",
      resultMode: "",
      queryScope: "",
    };

  /**
   * Maps the properties of class and subclass to their corresponding query parameter names.
   *
   * @remarks
   * This mapping is used to translate internal property names to the expected parameter names
   * when constructing repository queries.
   *
   * @readonly
   */
  private static readonly REPOSITORY_PARAM_MAPPING: ParameterMapping<{
    class: Repository["class"];
    subClass: Repository["subClass"];
  }> = {
    class: "class",
    subClass: "subClass",
  } as const;

  /**
   * Creates a new BaseClient instance for iTwins API operations
   * @param url - Optional custom base URL, defaults to production iTwins API URL
   *
   * @example
   * ```typescript
   * // Use default production URL
   * const client = new BaseClient();
   *
   * // Use custom URL for development/testing
   * const client = new BaseClient("https://dev-api.bentley.com/itwins");
   * ```
   */
  public constructor(url?: string) {
    if (url !== undefined) {
      this._baseUrl = url;
    } else {
      const urlPrefix = process.env.IMJS_URL_PREFIX;
      if (urlPrefix) {
        const baseUrl = new URL(this._baseUrl);
        baseUrl.hostname = `${urlPrefix}${baseUrl.hostname}`;
        this._baseUrl = baseUrl.href;
      }
    }
  }

  /**
   * Sends a generic API request with type safety and response validation.
   * Handles authentication, error responses, and data extraction automatically.
   * Error responses follow APIM standards for consistent error handling.
   *
   * @param accessToken - The client access token for authentication
   * @param method - The HTTP method type (GET, POST, DELETE, etc.)
   * @param url - The complete URL of the request endpoint
   * @param data - Optional payload data for the request body
   * @param property - Optional target property for response parsing (ex. iTwins, repositories, etc.)
   * @param headers - Optional additional request headers
   * @returns Promise that resolves to the parsed API response with type safety
   * @example
   * ```typescript
   * // Create new iTwin with POST request
   * const newTwin = { displayName: "My Project", type: "Asset" };
   * const response = await this.sendGenericAPIRequest<iTwin, CreateTwinRequest>(
   *   accessToken,
   *   "POST",
   *   "/itwins",
   *   newTwin,
   *   "iTwin"
   * );
   * ```
   */
  protected async sendGenericAPIRequest<TResponse = unknown, TData = unknown>(
    accessToken: AccessToken,
    method: Method,
    url: string,
    data?: TData,
    property?: string,
    headers?: Record<string, string>
  ): Promise<APIResponse<TResponse>> {
    try {
      const requestOptions = this.createRequestOptions(
        accessToken,
        method,
        url,
        data,
        headers
      );

      const response = await fetch(requestOptions.url, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body,
      });
      const responseData =
        response.status !== 204 ? await response.json() : undefined;

      if (!response.ok) {
        if (isErrorResponse(responseData)) {
          return {
            status: response.status,
            error: responseData.error,
          };
        }
        throw new Error("An error occurred while processing the request");
      }
      return {
        status: response.status,
        data:
          responseData === undefined || responseData === ""
            ? undefined
            : property && hasProperty(responseData, property)
            ? (responseData[property] as TResponse)
            : (responseData as TResponse),
      };
    } catch {
      // Return generic error for security - don't expose internal exception details
      return {
        status: 500,
        error: {
          code: "InternalServerError",
          message:
            "An internal exception happened while calling iTwins Service",
        },
      };
    }
  }

  /**
   * Creates request configuration options with authentication headers.
   * Validates required parameters and sets up proper content type for JSON requests.
   *
   * @param accessTokenString - The client access token string for authorization
   * @param method - The HTTP method type (GET, POST, DELETE, etc.)
   * @param url - The complete URL of the request endpoint
   * @param data - Optional payload data to be JSON stringified for the request body
   * @param headers - Optional additional request headers to include
   * @returns RequestConfig object with method, URL, body, and headers configured
   * @throws Will throw an error if access token or URL are missing/invalid
   *
   * @example
   * ```typescript
   * const config = this.createRequestOptions(
   *   "Bearer abc123...",
   *   "POST",
   *   "https://api.bentley.com/itwins",
   *   { displayName: "My iTwin" },
   *   { "Accept": "application/vnd.bentley.itwin-platform.v1+json" }
   * );
   * ```
   */
  protected createRequestOptions<TData>(
    accessTokenString: string,
    method: Method,
    url: string,
    data?: TData,
    headers: Record<string, string> = {}
  ): RequestConfig {
    if (!accessTokenString) {
      throw new Error("Access token is required");
    }

    if (!url) {
      throw new Error("URL is required");
    }
    let body: string | Blob | undefined;
    if (!(data instanceof Blob)) {
      body = JSON.stringify(data);
    } else {
      body = data;
    }
    return {
      method,
      url,
      body,
      headers: {
        ...headers,
        authorization: accessTokenString,
        "content-type":
          headers.contentType || headers["content-type"]
            ? headers.contentType || headers["content-type"]
            : "application/json",
      },
    };
  }

  /**
   * Builds a query string to be appended to a URL from query arguments
   * @param queryArg - Object containing queryable properties for filtering
   * @returns Query string with parameters applied, ready to append to a URL
   *
   * @example
   * ```typescript
   * const queryString = this.getQueryStringArg({
   *   search: "Building A",
   *   top: 10,
   *   subClass: "Asset"
   * });
   * // Returns: "$search=Building%20A&$top=10&subClass=Asset"
   * ```
   */
  protected getQueryStringArg(queryArg?: ITwinsQueryArg): string {
    if (!queryArg) return "";

    const params = this.buildQueryParams(
      queryArg,
      BaseClient.QUERY_PARAM_MAPPING
    );
    return params.join("&");
  }

  /**
   * Builds a query string for repository-specific API requests
   * @param queryArg - Object containing repository queryable properties like class and subClass
   * @returns Query string with repository parameters applied, ready to append to a URL
   *
   * @example
   * ```typescript
   * const queryString = this.getRepositoryQueryString({
   *   class: "iModel",
   *   subClass: "Design"
   * });
   * // Returns: "class=iModel&subClass=Design"
   * ```
   */
  protected getRepositoryQueryString(queryArg?: RepositoriesQueryArg): string {
    if (!queryArg) return "";

    const params = this.buildQueryParams(
      queryArg,
      BaseClient.REPOSITORY_PARAM_MAPPING
    );
    return params.join("&");
  }

  /**
   * Helper method to build query parameter array from mapping.
   * Uses exhaustive parameter mapping to ensure type safety and prevent missing parameters.
   * Automatically handles URL encoding and filters out excluded parameters.
   *
   * @param queryArg - Object containing queryable properties
   * @param mapping - Parameter mapping configuration that maps object properties to query parameter names
   * @returns Array of formatted query parameter strings ready for URL construction
   *
   * @example
   * ```typescript
   * const params = this.buildQueryParams(
   *   { search: "Building A", top: 10 },
   *   { search: "$search", top: "$top" }
   * );
   * // Returns: ["$search=Building%20A", "$top=10"]
   * ```
   */
  private buildQueryParams<T>(
    queryArg: T,
    mapping: ParameterMapping<T>
  ): string[] {
    const params: string[] = [];
    // Type assertion constrains paramKey to actual property names and mappedValue to the specific strings from the mapping
    // Narrows from set of all strings to only valid keys/values
    for (const [paramKey, mappedValue] of Object.entries(mapping) as [
      keyof T,
      ParameterMapping<T>[keyof T]
    ][]) {
      if (mappedValue === "") continue;
      const queryArgValue = queryArg[paramKey];
      if (queryArgValue !== undefined && queryArgValue !== null) {
        const stringValue = String(queryArgValue);
        params.push(`${mappedValue}=${encodeURIComponent(stringValue)}`);
      }
    }
    return params;
  }
}
