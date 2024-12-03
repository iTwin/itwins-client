/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import type { Method } from "axios";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type {
  ITwinsAPIResponse,
  ITwinsQueryArg,
  ITwinsQueryArgBase,
  ITwinSubClass,
  RepositoriesQueryArg,
} from "./iTwinsAccessProps";

export class BaseClient {
  protected _baseUrl: string = "https://api.bentley.com/itwins";

  public constructor(url?: string) {
    if (url !== undefined) {
      this._baseUrl = url;
    } else {
      const urlPrefix = process.env.IMJS_URL_PREFIX;
      if (urlPrefix) {
        const baseUrl = new URL(this._baseUrl);
        baseUrl.hostname = urlPrefix + baseUrl.hostname;
        this._baseUrl = baseUrl.href;
      }
    }
  }

  /**
   * Sends a basic API request
   * @param accessToken The client access token string
   * @param method The method type of the request (ex. GET, POST, DELETE, etc.)
   * @param url The url of the request
   * @param data (Optional) The payload of the request
   * @param property (Optional) The target property (ex. iTwins, repositories, etc.)
   * @param headers (Optional) Extra request headers.
   */
  protected async sendGenericAPIRequest(
    accessToken: AccessToken,
    method: Method,
    url: string,
    data?: any,
    property?: string,
    headers?: Record<string, string | number | boolean>
  ): Promise<ITwinsAPIResponse<any>> {
    // TODO: Change any response
    const requestOptions = this.getRequestOptions(
      accessToken,
      method,
      url,
      data,
      headers
    );

    try {
      const response = await axios(requestOptions);

      return {
        status: response.status,
        data:
          response.data.error || response.data === ""
            ? undefined
            : property
              ? response.data[property]
              : response.data,
        error: response.data.error,
      };
    } catch (err) {
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
   * Build the request methods, headers, and other options
   * @param accessTokenString The client access token string
   * @param method The method type of the request (ex. GET, POST, DELETE, etc.)
   * @param url The url of the request
   * @param data (Optional) The payload of the request
   * @param headers (Optional) Extra request headers.
   */
  protected getRequestOptions(
    accessTokenString: string,
    method: Method,
    url: string,
    data?: any,
    headers: Record<string, string | number | boolean> = {}
  ): AxiosRequestConfig {
    return {
      method,
      url,
      data,
      headers: {
        ...headers,
        "authorization": accessTokenString,
        "content-type": "application/json",
      },
      validateStatus(status: number) {
        return status < 500; // Resolve only if the status code is less than 500
      },
    };
  }

  /**
   * Build a query to be appended to a URL
   * @param queryArg Object container queryable properties
   * @returns query string with AccessControlQueryArg applied, which should be appended to a url
   */
  protected getQueryString(queryArg?: ITwinsQueryArg, subClass?: ITwinSubClass): string {
    let queryString = "";

    if(subClass || (queryArg && queryArg.subClass)) {
      let resolvedSubClass = subClass;
      if(queryArg && queryArg.subClass) {
        resolvedSubClass = queryArg?.subClass;
      }

      queryString += `&subClass=${resolvedSubClass}`;
    }

    if(!queryArg) {
      return queryString;
    }

    if (queryArg.includeInactive) {
      queryString += `&includeInactive=${queryArg.includeInactive}`;
    }

    if (queryArg.top) {
      queryString += `&$top=${queryArg.top}`;
    }

    if (queryArg.skip) {
      queryString += `&$skip=${queryArg.skip}`;
    }

    if (queryArg.status) {
      queryString += `&status=${queryArg.status}`;
    }

    if (queryArg.type) {
      queryString += `&type=${queryArg.type}`;
    }

    if (queryArg.search) {
      queryString += `&$search=${queryArg.search}`;
    }

    if (queryArg.displayName) {
      queryString += `&displayName=${queryArg.displayName}`;
    }

    if (queryArg.number) {
      queryString += `&number=${queryArg.number}`;
    }

    if (queryArg.parentId) {
      queryString += `&parentId=${queryArg.parentId}`;
    }

    if (queryArg.iTwinAccountId) {
      queryString += `&iTwinAccountId=${queryArg.iTwinAccountId}`;
    }

    // trim & from start of string
    queryString.replace(/^&+/, "");

    return queryString;
  }

  /**
    * Build a query to be appended to a URL
    * @param queryArg Object container queryable properties
    * @returns query string with AccessControlQueryArg applied, which should be appended to a url
    */
  protected getQueryStringArgBase(queryArg?: ITwinsQueryArgBase, subClass?: ITwinSubClass): string {
    let queryString = "";

    if(subClass || (queryArg && queryArg.subClass)) {
      let resolvedSubClass = subClass;
      if(queryArg && queryArg.subClass) {
        resolvedSubClass = queryArg?.subClass;
      }

      queryString += `&subClass=${resolvedSubClass}`;
    }

    if(!queryArg) {
      return queryString;
    }

    if (queryArg.includeInactive) {
      queryString += `&includeInactive=${queryArg.includeInactive}`;
    }

    if (queryArg.top) {
      queryString += `&$top=${queryArg.top}`;
    }

    if (queryArg.skip) {
      queryString += `&$skip=${queryArg.skip}`;
    }

    if (queryArg.status) {
      queryString += `&status=${queryArg.status}`;
    }

    if (queryArg.type) {
      queryString += `&type=${queryArg.type}`;
    }

    // trim & from start of string
    queryString.replace(/^&+/, "");

    return queryString;
  }

  /**
   * Build a query to be appended to the URL for iTwin Repositories
   * @param queryArg Object container queryable properties
   * @returns query string with RepositoriesQueryArg applied, which should be appended to a url
   */
  protected getRepositoryQueryString(queryArg: RepositoriesQueryArg): string {
    let queryString = "";

    if (queryArg.class) {
      queryString += `?class=${queryArg.class}`;
    }

    if (queryArg.subClass) {
      queryString += `&subClass=${queryArg.subClass}`;
    }

    // trim & from start of string
    queryString.replace(/^&+/, "");

    return queryString;
  }
}
