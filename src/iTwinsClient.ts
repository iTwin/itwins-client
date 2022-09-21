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
export class ITwinsAccessClient extends BaseClient implements ITwinsAccess {
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
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins");
  }

  /** Get Repositories accessible to user
   * @param accessToken The client access token string
   * @param arg Optional query arguments, for class and subclass
   * @returns Array of Repositories, may be empty
   */
  public async queryRepositoriesAsync(
    accessToken: AccessToken,
    iTwinId: string,
    arg?: RepositoriesQueryArg
  ): Promise<ITwinsAPIResponse<Repository[]>> {
    let url = `${this._baseUrl}/${iTwinId}/repositories`;
    if (arg) url += this.getRepositoryQueryString(arg);
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "repositories");
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
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwin");
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
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins");
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
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined, "iTwins");
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
}
