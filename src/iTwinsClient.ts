/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */

import type { AccessToken } from "@itwin/core-bentley";
import { BaseITwinsApiClient } from "./BaseITwinsApiClient.js";
import type {
  APIResponse,
  ODataQueryParams,
  ResultMode,
} from "./types/CommonApiTypes";
import type {
  ItwinCreate,
  ITwinMinimalResponse,
  ITwinRepresentationResponse,
  ItwinUpdate,
  MultiITwinMinimalResponse,
  MultiITwinRepresentationResponse,
} from "./types/ITwin";
import type {
  ITwinExportMultiResponse,
  ITwinExportRequestInfo,
  ITwinExportSingleResponse,
} from "./types/ITwinExport";
import type { ITwinImageResponse } from "./types/ITwinImage.js";
import type {
  ITwinQueryScope,
  ITwinsQueryArg,
} from "./types/ITwinsQueryArgs.js";
import type {
  GetMultiRepositoryResourceMinimalResponse,
  GetMultiRepositoryResourceRepresentationResponse,
  GetRepositoryResourceMinimalResponse,
  GetRepositoryResourceRepresentationResponse,
  MultiRepositoriesResponse,
  PostRepositoryResourceResponse,
  Repository,
  SingleRepositoryResponse,
} from "./types/Repository";

/** Client API to access the itwins service.
 * @beta
 */
export class ITwinsClient extends BaseITwinsApiClient {
  constructor(url?: string) {
    super(url);
  }

  /** Get a list of iTwin exports for the current user
   * @param accessToken The client access token string
   * @returns Promise that resolves with an array of export operations
   */
  public async getExports(
    accessToken: AccessToken
  ): Promise<APIResponse<ITwinExportMultiResponse>> {
    const url = `${this._baseUrl}/exports`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Get details of a specific iTwin export operation
   * @param accessToken The client access token string
   * @param id The id of the export operation to retrieve
   * @returns Promise that resolves with the export operation details
   */
  public async getExport(
    accessToken: AccessToken,
    id: string
  ): Promise<APIResponse<ITwinExportSingleResponse>> {
    const url = `${this._baseUrl}/exports/${id}`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /**
   * Create a new iTwin export
   * @param accessToken The client access token string
   * @param args Export query arguments including scope, filters, and output format
   * @returns Export response with operation details
   */
  public async createExport(
    accessToken: AccessToken,
    args: ITwinExportRequestInfo
  ): Promise<APIResponse<ITwinExportSingleResponse>> {
    const url = `${this._baseUrl}/exports`;
    return this.sendGenericAPIRequest(
      accessToken,
      "POST",
      url,
      args,
      undefined
    );
  }

  /** Get favorites iTwins accessible to the user
   * @param accessToken The client access token string
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of iTwins, may be empty, if no favorites
   */
  public async getFavoritesITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<
    APIResponse<MultiITwinMinimalResponse | MultiITwinRepresentationResponse>
  > {
    const headers = this.getHeaders(arg);
    const url = `${this._baseUrl}/favorites/?${this.getQueryStringArg(
      ITwinsClient.iTwinsQueryParamMapping,
      arg
    )}`;

    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /** Add the specified iTwin to the user's favorites list
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to add to favorites
   * @returns Promise that resolves when the iTwin is successfully added to favorites
   */
  public async addITwinToFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/favorites/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "POST", url);
  }

  /** Remove the specified iTwin from the user's favorites list
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to remove from favorites
   * @returns Promise that resolves when the iTwin is successfully removed from favorites
   */
  public async removeITwinFromFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/favorites/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Upload an image to the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to upload the image to
   * @param imageBlob The image file as a Blob (must be PNG or JPEG)
   * @param contentType The content type of the image ("image/png" | "image/jpeg")
   * @returns Promise that resolves with the uploaded image details including URLs for small and large versions
   */
  public async uploadITwinImage(
    accessToken: AccessToken,
    iTwinId: string,
    imageBlob: Blob,
    contentType: "image/png" | "image/jpeg"
  ): Promise<APIResponse<ITwinImageResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/image`;
    return this.sendGenericAPIRequest(accessToken, "PUT", url, imageBlob, {
      contentType,
    });
  }

  /** Get the image associated with the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to retrieve the image from
   * @returns Promise that resolves with the image details including URLs for small and large versions
   */
  public async getITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<ITwinImageResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/image`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Delete the image associated with the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to delete the image from
   * @returns Promise that resolves when the image is successfully deleted
   */
  public async deleteITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}/image`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Add the specified iTwin to the user's recently used list
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to add to the recently used list
   * @returns Promise that resolves when the iTwin is successfully added to the recently used list
   */
  public async addITwinToMyRecents(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/recents/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "POST", url);
  }

  /** Get recently used iTwins for the current user
   *
   * Retrieves a list of recently used iTwins for the calling user. A user can only have 25 recently used iTwins.
   * They are returned in order with the most recently used iTwin first in the list.
   *
   * iTwins with status=Inactive are not returned by default. This improves query performance and reduces clutter
   * in user interfaces by filtering out unused iTwins. You should still provide a way for users to see their
   * Inactive iTwins if they request them. In the API, you can do this by setting the status parameter or by
   * using the includeInactive parameter.
   *
   * @param accessToken The client access token string
   * @param arg Optional query arguments, for paging, searching, and filtering (including status and includeInactive)
   * @returns Promise that resolves with an array of recently used iTwins (maximum 25), ordered by most recent first
   */
  public async getRecentUsedITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<
    APIResponse<MultiITwinMinimalResponse | MultiITwinRepresentationResponse>
  > {
    const headers = this.getHeaders(arg);
    let url = `${this._baseUrl}/recents`;
    const query = this.getQueryStringArg(
      ITwinsClient.iTwinsQueryParamMapping,
      arg
    );
    if (query !== "") url += `?${query}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /** Create a new iTwin Repository
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repository The Repository to be created
   * @beta
   * @return Repository
   */
  public async createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: Omit<Repository, "id">
  ): Promise<APIResponse<SingleRepositoryResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, repository);
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
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Get Repositories accessible to user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param arg Optional query arguments, for class and subclass. If subClass is specified, class is also required.
   * @returns Array of Repositories, may be empty
   */
  public async getRepositories(
    accessToken: AccessToken,
    iTwinId: string,
    arg?:
      | { class: Repository["class"] }
      | { class: Repository["class"]; subClass: Repository["subClass"] }
  ): Promise<APIResponse<MultiRepositoriesResponse>> {
    const url = `${
      this._baseUrl
    }/${iTwinId}/repositories/?${this.getQueryStringArg(
      ITwinsClient.repositoryParamMapping,
      arg
    )}`;

    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Get Repositories accessible to user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository
   * @returns Repository
   * @beta
   */
  public async getRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<APIResponse<SingleRepositoryResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Get Repositories accessible to user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository
   * @param repository updated repository
   * @returns Updated repository
   * @beta
   */
  public async updateRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repository: Omit<Repository, "id" | "class" | "subClass">
  ): Promise<APIResponse<SingleRepositoryResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "PATCH", url, repository);
  }

  /**
   * Create a repository resource for a repository of class GeographicInformationSystem
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the GeographicInformationSystem repository to add the resource to
   * @param repositoryResource - The repository resource to create with required id and displayName properties
   * @returns Promise that resolves with the created repository resource details
   *
   * @beta
   */
  public async createRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repositoryResource: Pick<Repository, "id" | "displayName">
  ): Promise<APIResponse<PostRepositoryResourceResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources`;
    return this.sendGenericAPIRequest(
      accessToken,
      "POST",
      url,
      repositoryResource
    );
  }

  /**
   * Get a specific repository resource by ID
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the repository containing the resource
   * @param resourceId - The unique id of the repository resource to retrieve
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with the repository resource details in the requested format
   * @beta
   */
  public async getRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string,
    resultMode?: ResultMode
  ): Promise<
    APIResponse<
      | GetRepositoryResourceRepresentationResponse
      | GetRepositoryResourceMinimalResponse
    >
  > {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources/${resourceId}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /**
   * Get a specific repository resource by ID
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the repository containing the resource
   * @param args query params for get query
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with the repository resource details in the requested format
   * @beta
   */
  public async getRepositoryResources(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: ResultMode
  ): Promise<
    APIResponse<
      | GetMultiRepositoryResourceMinimalResponse
      | GetMultiRepositoryResourceRepresentationResponse
    >
  > {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${
      this._baseUrl
    }/${iTwinId}/repositories/${repositoryId}/resources?${this.getQueryStringArg(
      ITwinsClient.ODataParamMapping,
      args
    )}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /** Get itwin accessible to the user
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param resultMode (Optional) iTwin result mode: minimal or representation
   * @returns Array of projects, may be empty
   */
  public async getITwin(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwinMinimalResponse | ITwinRepresentationResponse>> {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /** Get itwins accessible to the user
   * @param accessToken The client access token string
   * @param arg Optional query arguments, for paging, searching, and filtering
   * @returns Array of projects, may be empty
   */
  public async getITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg &
      Pick<ODataQueryParams, "filter" | "orderby" | "select">
  ): Promise<
    APIResponse<MultiITwinMinimalResponse | MultiITwinRepresentationResponse>
  > {
    const headers = this.getHeaders(arg);
    const url = `${this._baseUrl}/?${this.getQueryStringArg(
      ITwinsClient.ITwinsGetQueryParamMapping,
      arg
    )}`;

    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /** Create a new iTwin
   * @param accessToken The client access token string
   * @param iTwin The iTwin to be created
   * @returns ITwin
   */
  public async createITwin(
    accessToken: AccessToken,
    iTwin: ItwinCreate
  ): Promise<APIResponse<ITwinRepresentationResponse>> {
    const url = `${this._baseUrl}/`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, iTwin);
  }

  /** Update the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param iTwin The iTwin to be created
   * @returns ITwin
   */
  public async updateItwin(
    accessToken: AccessToken,
    iTwinId: string,
    iTwin: ItwinUpdate
  ): Promise<APIResponse<ITwinRepresentationResponse>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "PATCH", url, iTwin);
  }

  /** Delete the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns No Content
   */
  public async deleteItwin(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Get primary account accessible to the user
   * @returns Primary account
   */
  public async getPrimaryAccount(
    accessToken: AccessToken
  ): Promise<APIResponse<ITwinMinimalResponse>> {
    const url = `${this._baseUrl}/myprimaryaccount`;
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined);
  }

  /**
   * Gets the Account for the specified iTwin.
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @returns Account
   */
  public async getITwinAccount(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwinMinimalResponse>> {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}/account`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers
    );
  }

  /**
   * Format headers from query arguments
   * @param arg (Optional) iTwin query arguments
   * @protected
   */
  protected getHeaders(arg?: ITwinsQueryArg): Record<string, string> {
    return {
      ...this.getQueryScopeHeaders(arg && arg.queryScope),
      ...this.getResultModeHeaders(arg && arg.resultMode),
    };
  }

  /**
   * Format result mode parameter into a headers entry
   * @param resultMode (Optional) iTwin result mode
   * @protected
   */
  protected getResultModeHeaders(
    resultMode: ResultMode = "minimal"
  ): Record<string, string> {
    return {
      prefer: `return=${resultMode}`,
    };
  }

  /**
   * Format query scope parameter into a headers entry
   * @param queryScope (Optional) iTwin query scope
   * @protected
   */
  protected getQueryScopeHeaders(
    queryScope: ITwinQueryScope = "memberOfItwin"
  ): Record<string, string> {
    return {
      "x-itwin-query-scope": queryScope,
    };
  }
}
