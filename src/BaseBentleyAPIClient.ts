/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import type { ApimError, BentleyAPIResponse, Method, RequestConfig } from "./types/CommonApiTypes";
import { ParameterMapping } from "./types/typeUtils";

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
 * Handles authentication, request configuration, and query string building, and error validation.
 */
export abstract class BaseBentleyAPIClient {


  /**
   * The max redirects for iTwins API endpoints.
   * The max redirects can be customized via the constructor parameter or automatically
   * modified based on the IMJS_MAX_REDIRECTS environment variable.
   *
   * @readonly
   */
  protected readonly _maxRedirects: number = 5;

  /**
   * Creates a new BaseClient instance for API operations
   * @param maxRedirects - Optional custom max redirects, defaults to 5
   *
   * @example
   * ```typescript
   * // Use default max redirects
   * const client = new BaseClient();
   *
   * // Use custom max redirects
   * const client = new BaseClient(10);
   * ```
   */
  public constructor(maxRedirects?: number) {
    if (maxRedirects !== undefined) {
      this._maxRedirects = maxRedirects;
    } else {
      this._maxRedirects = globalThis.IMJS_MAX_REDIRECTS ?? 5;
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
   * @param headers - Optional additional request headers
   * @returns Promise that resolves to the parsed API response with type safety
   */
  protected async sendGenericAPIRequest<TResponse = unknown, TData = unknown>(
    accessToken: AccessToken,
    method: Method,
    url: string,
    data?: TData,
    headers?: Record<string, string>,
    allowRedirects: boolean = false
  ): Promise<BentleyAPIResponse<TResponse>> {
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
        redirect: 'manual',
      });

      // Browser fetch returns an opaque redirect when redirect is set to manual
      if (response.type === "opaqueredirect") {
        if (!allowRedirects) {
          return {
            status: 403,
            error: {
              code: "RedirectsNotAllowed",
              message: "Redirects are not allowed for this request.",
            },
          };
        }

        return await this.followRedirectWithFetchFollow<TResponse>(
          requestOptions
        );
      }

      // Handle 302 redirects with auth header forwarding
      if (response.status === 302) {
        if (!allowRedirects) {
          return {
            status: 403,
            error: {
              code: "RedirectsNotAllowed",
              message: "Redirects are not allowed for this request.",
            },
          };
        }
        return await this.followRedirect<TResponse, TData>(
          response,
          accessToken,
          method,
          data,
          headers
        );
      }

      // Process non-redirect response
      return await this.processResponse<TResponse>(response);
    } catch {
      return this.createInternalServerError();
    }
  }

  /**
   * Follows redirects using the fetch default 'follow' behavior.
   * Used for environments where manual redirect returns opaque responses.
   *
   * @param requestOptions - The original request options
   * @returns Promise that resolves to the final API response
   */
  private async followRedirectWithFetchFollow<TResponse = unknown>(
    requestOptions: RequestConfig
  ): Promise<BentleyAPIResponse<TResponse>> {
    try {
      const response = await fetch(requestOptions.url, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body,
        redirect: "follow",
      });

      if (response.redirected) {
        try {
          this.validateRedirectUrlSecurity(response.url);
        } catch (error) {
          return {
            status: 502,
            error: {
              code: "InvalidRedirectUrl",
              message:
                error instanceof Error ? error.message : "Invalid redirect URL",
            },
          };
        }
      }

      return await this.processResponse<TResponse>(response);
    } catch {
      return this.createInternalServerError();
    }
  }

  /**
   * Handles 302 redirect responses by validating and following the redirect.
   *
   * @param response - The 302 redirect response
   * @param accessToken - The client access token
   * @param method - The HTTP method
   * @param data - Optional request payload
   * @param headers - Optional request headers (will be forwarded to redirect)
   * @param redirectCount - Current redirect depth
   * @returns Promise that resolves to the final API response
   */
  private async followRedirect<TResponse = unknown, TData = unknown>(
    response: Response,
    accessToken: AccessToken,
    method: Method,
    data: TData | undefined,
    headers: Record<string, string> | undefined,
    redirectCount: number = 0
  ): Promise<BentleyAPIResponse<TResponse>> {

    // Verify redirect is valid and safe to follow
    const verificationResult = this.checkRedirectValidity(response, redirectCount);
    if (verificationResult.error) {
      return verificationResult.error;
    }
    const redirectUrl = verificationResult.redirectUrl;

    try {
      const requestOptions = this.createRequestOptions(
        accessToken,
        method,
        redirectUrl,
        data,
        headers
      );

      const redirectResponse = await fetch(requestOptions.url, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body,
        redirect: 'manual',
      });

      // Handle subsequent 302 redirects
      if (redirectResponse.status === 302) {
        return await this.followRedirect<TResponse, TData>(
          redirectResponse,
          accessToken,
          method,
          data,
          headers,
          redirectCount + 1
        );
      }

      // Process final response
      return await this.processResponse<TResponse>(redirectResponse);
    } catch {
      return this.createInternalServerError();
    }
  }

  /**
   * Processes a non-redirect HTTP response.
   *
   * @param response - The HTTP response to process
   * @returns Promise that resolves to a typed API response
   */
  private async processResponse<TResponse>(
    response: Response
  ): Promise<BentleyAPIResponse<TResponse>> {
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
          : (responseData as TResponse),
    };
  }

  /**
   * Creates a generic internal server error response.
   *
   * @returns A 500 error response for internal exceptions
   */
  private createInternalServerError(): BentleyAPIResponse<never> {
    return {
      status: 500,
      error: {
        code: "InternalServerError",
        message:
          "An internal exception happened while calling iTwins Service",
      },
    };
  }


  /**
   * Verifies that a redirect response is valid and safe to follow.
   * Performs three critical validations:
   * 1. Checks redirect count to prevent infinite loops
   * 2. Ensures Location header is present
   * 3. Validates redirect URL for security
   *
   * @param response - The 302 redirect response to verify
   * @param redirectCount - Current redirect depth
   * @returns Verification result with either error or validated redirect URL
   */
  private checkRedirectValidity(
    response: Response,
    redirectCount: number
  ): { error?: BentleyAPIResponse<never>; redirectUrl: string } {
    // Check redirect limit to prevent infinite loops
    if (redirectCount >= this._maxRedirects) {
      return {
        error: {
          status: 508,
          error: {
            code: "TooManyRedirects",
            message: `Maximum redirect limit (${this._maxRedirects}) exceeded. Possible redirect loop detected.`,
          },
        },
        redirectUrl: "",
      };
    }

    // Extract and validate redirect URL
    const redirectUrl = response.headers.get('location');
    if (!redirectUrl) {
      return {
        error: {
          status: 502,
          error: {
            code: "InvalidRedirect",
            message: "302 redirect response missing Location header",
          },
        },
        redirectUrl: "",
      };
    }

    // Validate redirect URL for security
    try {
      this.validateRedirectUrlSecurity(redirectUrl);
    } catch (error) {
      return {
        error: {
          status: 502,
          error: {
            code: "InvalidRedirectUrl",
            message: error instanceof Error ? error.message : "Invalid redirect URL",
          },
        },
        redirectUrl: "",
      };
    }

    // All validations passed
    return { redirectUrl };
  }

  /**
   * Validates that a redirect URL is secure and targets a trusted APIM Bentley domain.
   *
   * This method enforces security requirements for following HTTP redirects:
   * - URL must use HTTPS protocol (not HTTP)
   * - Domain must be a Bentley-owned domain (*api.bentley.com)
   *
   * @param url - The redirect URL to validate
   * @returns True if the URL is valid and safe to follow
   * @throws Error if the URL is invalid, uses HTTP, or targets an untrusted domain
   *
   * @remarks
   * This validation is critical for security when following 302 redirects in federated
   * architecture scenarios. It prevents redirect attacks that could leak authentication
   * credentials to malicious domains.
   *
   * @example
   * ```typescript
   * // Valid URLs
   * this.validateRedirectUrl("https://api.bentley.com/resource");
   * // Invalid URLs (will throw)
   * this.validateRedirectUrl("https://evil-tuna.com/phishing/"); // Non-Bentley domain
   * this.validateRedirectUrl("https://bentley.com.evil.com/fake"); // Domain spoofing attempt
   * ```
   */
  private validateRedirectUrlSecurity(url: string): boolean {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error(`Invalid redirect URL: malformed URL "${url}"`);
    }

    // Require HTTPS protocol for security
    if (parsedUrl.protocol !== "https:") {
      throw new Error(
        `Invalid redirect URL: HTTPS required, but URL uses "${parsedUrl.protocol}" protocol. URL: ${url}`
      );
    }

    // Validate domain is a Bentley-owned domain (specific whitelist)
    const hostname = parsedUrl.hostname.toLowerCase();
    const allowedDomains = [
      "api.bentley.com",
    ];

    const isBentleyDomain = allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`-${domain}`)
    );

    if (!isBentleyDomain) {
      throw new Error(
        `Invalid redirect URL: domain "${hostname}" is not a trusted Bentley domain. Only api.bentley.com and its subdomains are allowed.`
      );
    }

    return true;
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
   * @param parameterMapping - Parameter mapping configuration that maps object properties to query parameter names
   * @param queryArg - Object containing queryable properties for filtering
   * @returns Query string with parameters applied, ready to append to a URL
   *
   * @example
   * ```typescript
   * const queryString = this.getQueryStringArg(
   *   ITwinsAccess.ITWINS_QUERY_PARAM_MAPPING,
   *   {
   *     search: "Building A",
   *     top: 10,
   *     subClass: "Asset"
   *   }
   * );
   * // Returns: "$search=Building%20A&$top=10&subClass=Asset"
   * ```
   */
  protected getQueryStringArg<T>(
    parameterMapping: ParameterMapping<NonNullable<T>>,
    queryArg?: T
  ): string {
    if (!queryArg) return "";

    const params = this.buildQueryParams(queryArg, parameterMapping);
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
