/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import { BaseClient } from "./BaseClient";
import type {
  ITwin,
  ITwinQueryScope,
  ITwinResultMode,
  ITwinsAccess,
  ITwinsAPIResponse,
  ITwinsQueryArg,
  ITwinSubClass,
  RepositoriesQueryArg,
  Repository,
} from "./iTwinsAccessProps";

/** Client API to access the itwins service.
 * @beta
 */
export class ITwinsAccessClient extends BaseClient implements ITwinsAccess {
  public constructor(url?: string) {
    super(url);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Optional parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryAsync(
    accessToken: AccessToken,
    /**
     * @deprecated in 2.0 This property is deprecated, and will be removed in the next major release. Please use `arg` to provide subClass instead.
     */
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
    const headers = this.getHeaders(arg);
    let url = this._baseUrl;
    let query = "";
    // eslint-disable-next-line deprecation/deprecation
    if (subClass || arg?.subClass)
      // eslint-disable-next-line deprecation/deprecation
      query += `subClass=${subClass ?? arg?.subClass}`;
    if (arg)
      query += this.getQueryString(arg);
    if (query !== "")
      url += `?${query}`;

    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins", headers);
  }

  /** Create a new iTwin
   * @param accessToken The client access token string
   * @param iTwin The iTwin to be created
   * @returns ITwin
   */
  public async createiTwin(
    accessToken: AccessToken,
    iTwin: ITwin
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const url = `${this._baseUrl}/`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, iTwin, "iTwin");
  }

  /** Update the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param iTwin The iTwin to be created
   * @returns ITwin
   */
  public async updateiTwin(
    accessToken: AccessToken,
    iTwinId: string,
    iTwin: ITwin
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "PATCH", url, iTwin, "iTwin");
  }

  /** Delete the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns No Content
   */
  public async deleteiTwin(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<ITwinsAPIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Create a new iTwin Repository
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repository The Repository to be created
   * @return Repository
   */
  public async createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: Repository
  ): Promise<ITwinsAPIResponse<Repository>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, repository, "repository");
  }

  /** Delete the specified iTwin Repository
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository
   * @return No Content
   */
  public async deleteRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<ITwinsAPIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Get Repositories accessible to user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param arg Optional query arguments, for class and subclass
   * @returns Array of Repositories, may be empty
   */
  public async queryRepositoriesAsync(
    accessToken: AccessToken,
    iTwinId: string,
    arg?: RepositoriesQueryArg
  ): Promise<ITwinsAPIResponse<Repository[]>> {
    let url = `${this._baseUrl}/${iTwinId}/repositories`;
    if (arg)
      url += this.getRepositoryQueryString(arg);
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "repositories");
  }

  /** Get itwin accessible to the user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param resultMode (Optional) iTwin result mode: minimal or representation
   * @returns Array of projects, may be empty
   */
  public async getAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ITwinResultMode
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwin", headers);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Optional parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryFavoritesAsync(
    accessToken: AccessToken,
    /**
     * @deprecated in 2.0 This property is deprecated, and will be removed in the next major release. Please use `arg` to provide subClass instead.
     */
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
    const headers = this.getHeaders(arg);
    let url = `${this._baseUrl}/favorites`;
    let query = "";
    // eslint-disable-next-line deprecation/deprecation
    if (subClass || arg?.subClass)
      // eslint-disable-next-line deprecation/deprecation
      query += `subClass=${subClass ?? arg?.subClass}`;
    if (arg)
      query += this.getQueryString(arg);
    if (query !== "")
      url += `?${query}`;

    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins", headers);
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param subClass Optional parameter to search a specific iTwin subClass
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async queryRecentsAsync(
    accessToken: AccessToken,
    /**
     * @deprecated in 2.0 This property is deprecated, and will be removed in the next major release. Please use `arg` to provide subClass instead.
     */
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>> {
    const headers = this.getHeaders(arg);
    let url = `${this._baseUrl}/recents`;
    let query = "";
    // eslint-disable-next-line deprecation/deprecation
    if (subClass || arg?.subClass)
      // eslint-disable-next-line deprecation/deprecation
      query += `subClass=${subClass ?? arg?.subClass}`;
    if (arg)
      query += this.getQueryString(arg);
    if (query !== "")
      url += `?${query}`;

    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins", headers);
  }

  /** Get primary account accessible to the user
   * @returns Primary account
   */
  public async getPrimaryAccountAsync(
    accessToken: AccessToken
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const url = `${this._baseUrl}/myprimaryaccount`;
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwin");
  }

  /**
   * Gets the Account for the specified iTwin.
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns Account
   */
  public async getAccountAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ITwinResultMode
  ): Promise<ITwinsAPIResponse<ITwin>> {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}/account`;
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwin", headers);
  }

  /**
   * Format headers from query arguments
   * @param arg (Optional) iTwin query arguments
   * @protected
   */
  protected getHeaders(arg?: ITwinsQueryArg): Record<string, string> {
    return {...this.getQueryScopeHeaders(arg && arg.queryScope), ...this.getResultModeHeaders(arg && arg.resultMode)};
  }

  /**
   * Format result mode parameter into a headers entry
   * @param resultMode (Optional) iTwin result mode
   * @protected
   */
  protected getResultModeHeaders(resultMode: ITwinResultMode = "minimal"): Record<string, string> {
    return {
      prefer: `return=${resultMode}`,
    };
  }

  /**
   * Format query scope parameter into a headers entry
   * @param queryScope (Optional) iTwin query scope
   * @protected
   */
  protected getQueryScopeHeaders(queryScope: ITwinQueryScope = "memberOfItwin"): Record<string, string> {
    return {
      "x-itwin-query-scope": queryScope,
    };
  }
}
