/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type {
  iTwin,
  iTwinsAccess,
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
  ): Promise<iTwin[]> {
    let url = `${this._baseUrl}?subClass=${subClass}`;
    if (arg) url += this.getQueryString(arg);
    return this.sendGet(accessToken, url);
  }

  /** Get itwin accessible to the user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  // public async getAsync(
  //   accessToken: AccessToken,
  //   iTwinId: string,
  //   arg?: iTwinsQueryArg
  // ): Promise<iTwin> {
  //   let url = `${this._baseUrl}/${iTwinId}`;
  //   if (arg) url += `?${this.getQueryString(arg)}`;
  //   return (await this.sendGet(accessToken, url))[0];
  // }

  // /** Gets projects using the given query options
  //  * @param accessToken The client access token string
  //  * @param arg Optional object containing queryable properties
  //  * @returns Projects and links meeting the query's requirements
  //  */
  // public async getByQuery(accessToken: AccessToken, subClass: iTwinSubClass, arg?: iTwinsQueryArg): Promise<iTwinsQueryResult> {
  // }

  private async sendGet(
    accessToken: AccessToken,
    url: string
  ): Promise<iTwin[]> {
    const requestOptions = this.getRequestOptions(accessToken);
    const iTwins: iTwin[] = [];
    // const links: ProjectsLinks = {};

    try {
      const response = await axios.get(url, requestOptions);

      if (!response.data.iTwins) {
        new Error("Expected array of iTwins not found in API response.");
      }

      response.data.iTwins.forEach((_iTwin: any) => {
        iTwins.push(_iTwin);
      });

      /*
  id: string;
  class: string;
  subClass: string;
  type: string;
  displayName: string;
  number: string;
      */

      // const linkData = response.data._links;
      // if (linkData) {
      //   if (linkData.self && linkData.self.href)
      //     links.self = async (token: AccessToken) =>
      //       this.getByUrl(token, linkData.self.href);
      //   if (linkData.next && linkData.next.href)
      //     links.next = async (token: AccessToken) =>
      //       this.getByUrl(token, linkData.next.href);
      //   if (linkData.prev && linkData.prev.href)
      //     links.previous = async (token: AccessToken) =>
      //       this.getByUrl(token, linkData.prev.href);
      // }
    } catch (errorResponse: any) {
      throw Error(`API request error: ${JSON.stringify(errorResponse)}`);
    }

    return iTwins;
  }

  /**
   * Build the request methods, headers, and other options
   * @param accessTokenString The client access token string
   */
  private getRequestOptions(accessTokenString: string): AxiosRequestConfig {
    return {
      method: "GET",
      headers: {
        authorization: accessTokenString,
        "content-type": "application/json",
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
