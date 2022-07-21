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
  iTwin,
  iTwinsAccess,
  iTwinsAPIResponse,
  iTwinsQueryArg,
  iTwinSubClass,
} from "./iTwinsAccessProps";

/** Client API to access the itwin service.
 * @beta
 */
export class ITwinsAccessClient implements iTwinsAccess {
  private _baseUrl: string = "https://api.bentley.com/itwins";

  public constructor() {
    const urlPrefix = process.env.IMJS_URL_PREFIX;
    if (urlPrefix) {
      const baseUrl = new URL(this._baseUrl);
      baseUrl.hostname = urlPrefix + baseUrl.hostname;
      this._baseUrl = baseUrl.href;
    }
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Required parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryAsync(
    accessToken: AccessToken,
    subClass: iTwinSubClass,
    arg?: iTwinsQueryArg
  ): Promise<iTwinsAPIResponse<iTwin[]>> {
    let url = `${this._baseUrl}?subClass=${subClass}`;
    if (arg) url += this.getQueryString(arg);
    return this.sendGETManyAPIRequest(accessToken, url);
  }

  /** Get itwin accessible to the user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns Array of projects, may be empty
   */
  public async getAsync(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<iTwinsAPIResponse<iTwin>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Required parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryFavoritesAsync(
    accessToken: AccessToken,
    subClass: iTwinSubClass,
    arg?: iTwinsQueryArg
  ): Promise<iTwinsAPIResponse<iTwin[]>> {
    let url = `${this._baseUrl}/favorites?subClass=${subClass}`;
    if (arg) url += this.getQueryString(arg);
    return this.sendGETManyAPIRequest(accessToken, url);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Required parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryRecentsAsync(
    accessToken: AccessToken,
    subClass: iTwinSubClass,
    arg?: iTwinsQueryArg
  ): Promise<iTwinsAPIResponse<iTwin[]>> {
    let url = `${this._baseUrl}/recents?subClass=${subClass}`;
    if (arg) url += this.getQueryString(arg);
    return this.sendGETManyAPIRequest(accessToken, url);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Required parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async getPrimaryAccountAsync(
    accessToken: AccessToken
  ): Promise<iTwinsAPIResponse<iTwin>> {
    const url = `${this._baseUrl}/myprimaryaccount`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  // /** Gets projects using the given query options
  //  * @param accessToken The client access token string
  //  * @param arg Optional object containing queryable properties
  //  * @returns Projects and links meeting the query's requirements
  //  */
  // public async getByQuery(accessToken: AccessToken, subClass: iTwinSubClass, arg?: iTwinsQueryArg): Promise<iTwinsQueryResult> {
  // }

  private async sendGETManyAPIRequest(
    accessToken: AccessToken,
    url: string
  ): Promise<iTwinsAPIResponse<iTwin[]>> {
    const requestOptions = this.getRequestOptions(accessToken);

    try {
      const response = await axios.get(url, requestOptions);

      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data.iTwins,
        error: response.data.error,
      };
    } catch (err) {
      return {
        status: 500,
        statusText: "Internal Server Error",
        error: {
          code: "InternalServerError",
          message:
            "An internal exception happened while calling iTwins Service",
        },
      };
    }
  }

  private async sendGenericAPIRequest(
    accessToken: AccessToken,
    method: Method,
    url: string
  ): Promise<iTwinsAPIResponse<iTwin>> {
    const requestOptions = this.getRequestOptions(accessToken);
    requestOptions.method = method;
    requestOptions.url = url;

    try {
      const response = await axios(requestOptions);

      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data.iTwin,
        error: response.data.error,
      };
    } catch (err) {
      return {
        status: 500,
        statusText: "Internal Server Error",
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
   */
  private getRequestOptions(accessTokenString: string): AxiosRequestConfig {
    return {
      method: "GET",
      headers: {
        "authorization": accessTokenString,
        "content-type": "application/json",
      },
      validateStatus(status) {
        return status < 500; // Resolve only if the status code is less than 500
      },
    };
  }

  /**
   * Build a query to be appended to a URL
   * @param queryArg Object container queryable properties
   * @returns query string with iTwinQueryArgs applied, which should be appended to a url
   */
  private getQueryString(queryArg: iTwinsQueryArg): string {
    let queryString = "";

    if (queryArg.search) {
      queryString += `&$search=${queryArg.search}`;
    }

    if (queryArg.top) {
      queryString += `&$top=${queryArg.top}`;
    }

    if (queryArg.skip) {
      queryString += `&$skip=${queryArg.skip}`;
    }

    if (queryArg.displayName) {
      queryString += `&displayName=${queryArg.displayName}`;
    }

    if (queryArg.number) {
      queryString += `&number=${queryArg.number}`;
    }

    if (queryArg.type) {
      queryString += `&type=${queryArg.type}`;
    }

    // trim & from start of string
    queryString.replace(/^&+/, "");

    return queryString;
  }
}
