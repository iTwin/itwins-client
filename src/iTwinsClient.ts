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
  ITwin,
  ITwinsAccess,
  ITwinsAPIResponse,
  ITwinsQueryArg,
  ITwinSubClass,
  RepositoriesQueryArg,
  Repository,
} from "./iTwinsAccessProps";

/** Client API to access the itwin service.
 * @beta
 */
export class ITwinsAccessClient implements ITwinsAccess {
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
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
    let url = `${this._baseUrl}?subClass=${subClass}`;
    if (arg) url += this.getQueryString(arg);
    return this.sendGETManyAPIRequest(accessToken, url);
  }

  public async queryRepositoriesAsync(
    accessToken: AccessToken,
    iTwinId: string,
    arg?: RepositoriesQueryArg
  ): Promise<ITwinsAPIResponse<Repository[]>> {
    let url = `${this._baseUrl}/${iTwinId}/repositories`;
    if (arg) url += this.getRepositoryQueryString(arg);
    return this.sendGETManyAPIRequestRepositories(accessToken, url);
  }

  /** Get itwin accessible to the user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns Array of projects, may be empty
   */
  public async getAsync(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<ITwinsAPIResponse<ITwin>> {
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
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
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
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
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
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const url = `${this._baseUrl}/myprimaryaccount`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  // /** Gets projects using the given query options
  //  * @param accessToken The client access token string
  //  * @param arg Optional object containing queryable properties
  //  * @returns Projects and links meeting the query's requirements
  //  */
  // public async getByQuery(accessToken: AccessToken, subClass: ITwinSubClass, arg?: ITwinsQueryArg): Promise<iTwinsQueryResult> {
  // }

  private async sendGETManyAPIRequest(
    accessToken: AccessToken,
    url: string
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
    const requestOptions = this.getRequestOptions(accessToken);

    try {
      const response = await axios.get(url, requestOptions);

      return {
        status: response.status,
        data: response.data.iTwins,
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

  private async sendGETManyAPIRequestRepositories(
    accessToken: AccessToken,
    url: string
  ): Promise<ITwinsAPIResponse<Repository[]>> {
    const requestOptions = this.getRequestOptions(accessToken);

    try {
      const response = await axios.get(url, requestOptions);

      return {
        status: response.status,
        data: response.data.repositories,
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

  private async sendGenericAPIRequest(
    accessToken: AccessToken,
    method: Method,
    url: string
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const requestOptions = this.getRequestOptions(accessToken);
    requestOptions.method = method;
    requestOptions.url = url;

    try {
      const response = await axios(requestOptions);

      return {
        status: response.status,
        data: response.data.iTwin,
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
  private getQueryString(queryArg: ITwinsQueryArg): string {
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

  /**
   * Build a query to be appended to the URL for iTwin Repositories
   * @param queryArg Object container queryable properties
   * @returns query string with RepositoriesQueryArg applied, which should be appended to a url
   */
  private getRepositoryQueryString(queryArg: RepositoriesQueryArg): string {
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
