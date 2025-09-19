/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import type {
  ITwinsAPIResponse,
  ITwinsQueryArg,
  ITwinsQueryArgBase,
  ITwinSubClass,
  RepositoriesQueryArg,
  Error,
} from "./iTwinsAccessProps";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Configuration object for HTTP requests
 */
type RequestConfig = {
  method: Method;
  url: string;
  body?: string;
  headers: Record<string, string>;
};

/**
 * Type guard to validate if an object is a valid Error structure
 * @param error - Unknown object to validate
 * @returns True if the object is a valid Error type
 */
function isValidError(error: unknown): error is Error {
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
function isErrorResponse(data: unknown): data is { error: Error } {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return "error" in obj && isValidError(obj.error);
}

/**
 * Type guard to check if an object has a specific property
 * @param obj - Object to check for property
 * @param key - Property key to check for
 * @returns True if the object has the specified property
 */
function hasProperty(
  obj: unknown,
  prop: string
): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && prop in obj;
}

/**
 * Base client class providing common functionality for iTwins API requests.
 * Handles authentication, request configuration, and query string building.
 */
export class BaseClient {
  protected _baseUrl: string = "https://api.bentley.com/itwins";

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
   * Sends a generic API request with type safety and response validation
   * @param accessToken - The client access token for authentication
   * @param method - The HTTP method type (GET, POST, DELETE, etc.)
   * @param url - The complete URL of the request endpoint
   * @param data - Optional payload data for the request body
   * @param property - Optional target property for response parsing (ex. iTwins, repositories, etc.)
   * @param headers - Optional additional request headers
   * @returns Promise that resolves to the parsed API response with type safety
   */
  protected async sendGenericAPIRequest<TResponse = unknown, TData = unknown>(
    accessToken: AccessToken,
    method: Method,
    url: string,
    data?: TData,
    property?: string,
    headers?: Record<string, string>
  ): Promise<ITwinsAPIResponse<TResponse>> {
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
      if (!response.ok) {
        const responseData = await response.json();
        if (isErrorResponse(responseData)) {
          const errorData: Error = responseData.error;
          return {
            status: response.status,
            error: errorData,
          };
        }
        throw new Error("Unknown error occurred");
      }
      const responseData =
        response.status !== 204 ? await response.json() : undefined;

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
   * Creates request configuration options with authentication headers
   * @param accessTokenString - The client access token string for authorization
   * @param method - The HTTP method type (GET, POST, DELETE, etc.)
   * @param url - The complete URL of the request endpoint
   * @param data - Optional payload data to be JSON stringified for the request body
   * @param headers - Optional additional request headers to include
   * @returns RequestConfig object with method, URL, body, and headers configured
   */
  protected createRequestOptions<TData extends unknown>(
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

    return {
      method,
      url,
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...headers,
        authorization: accessTokenString,
        "content-type": "application/json",
      },
    };
  }

  /**
   * Builds a query string to be appended to a URL from query arguments
   * @param queryArg - Object containing queryable properties for filtering
   * @param subClass - Optional iTwin subclass filter to apply
   * @returns Query string with parameters applied, ready to append to a URL
   */
  protected getQueryStringArgBase(
    queryArg?: ITwinsQueryArgBase,
    subClass?: ITwinSubClass
  ): string {
    const params: string[] = [];

    if (queryArg && queryArg.subClass) {
      params.push(`subClass=${encodeURIComponent(queryArg.subClass)}`);
    } else if (subClass) {
      params.push(`subClass=${encodeURIComponent(subClass)}`);
    }

    if (!queryArg) {
      return params.join("&");
    }

    if (queryArg.includeInactive) {
      params.push(`includeInactive=${queryArg.includeInactive}`);
    }

    if (queryArg.top) {
      params.push(`$top=${queryArg.top}`);
    }

    if (queryArg.skip) {
      params.push(`$skip=${queryArg.skip}`);
    }

    if (queryArg.status) {
      params.push(`status=${queryArg.status}`);
    }

    if (queryArg.type) {
      params.push(`type=${queryArg.type}`);
    }

    return params.join("&");
  }

  /**
   * Builds a comprehensive query string with iTwins-specific parameters
   * @param queryArg - Object containing queryable properties including search, display name, etc.
   * @param subClass - Optional iTwin subclass filter to apply
   * @returns Query string with all iTwins parameters applied, ready to append to a URL
   */
  protected getQueryStringArg(
    queryArg?: ITwinsQueryArg,
    subClass?: ITwinSubClass
  ): string {
    const baseParams = this.getQueryStringArgBase(queryArg, subClass);
    const additionalParams: string[] = [];

    if (queryArg) {
      if (queryArg.search) {
        additionalParams.push(`$search=${encodeURIComponent(queryArg.search)}`);
      }
      if (queryArg.displayName) {
        additionalParams.push(
          `displayName=${encodeURIComponent(queryArg.displayName)}`
        );
      }
      if (queryArg.number) {
        additionalParams.push(`number=${encodeURIComponent(queryArg.number)}`);
      }
      if (queryArg.parentId) {
        additionalParams.push(
          `parentId=${encodeURIComponent(queryArg.parentId)}`
        );
      }
      if (queryArg.iTwinAccountId) {
        additionalParams.push(
          `iTwinAccountId=${encodeURIComponent(queryArg.iTwinAccountId)}`
        );
      }
    }

    const allParams = [baseParams, ...additionalParams].filter(Boolean); // filter out falsy values
    return allParams.join("&");
  }

  /**
   * Builds a query string for repository-specific API requests
   * @param queryArg - Object containing repository queryable properties like class and subClass
   * @returns Query string with repository parameters applied, ready to append to a URL
   */
  protected getRepositoryQueryString(queryArg?: RepositoriesQueryArg): string {
    if (!queryArg) return "";

    const params: string[] = [];

    if (queryArg.class) {
      params.push(`class=${encodeURIComponent(queryArg.class)}`);
    }

    if (queryArg.subClass) {
      params.push(`subClass=${encodeURIComponent(queryArg.subClass)}`);
    }

    return params.join("&");
  }
}
