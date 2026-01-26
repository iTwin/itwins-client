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
  BentleyAPIResponse,
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
  ITwinsGetQueryArg,
  ITwinsQueryArg,
} from "./types/ITwinsQueryArgs.js";
import type {
  GetMultiRepositoryResourceMinimalResponse,
  GetMultiRepositoryResourceRepresentationResponse,
  GetRepositoryResourceMinimalResponse,
  GetRepositoryResourceRepresentationResponse,
  MultiRepositoriesResponse,
  NewRepositoryConfig,
  PostRepositoryResourceResponse,
  Repository,
  ResourceGraphicsResponse,
  SingleRepositoryResponse,
} from "./types/Repository";

/** Client API to access the iTwins service.
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
  ): Promise<BentleyAPIResponse<ITwinExportMultiResponse>> {
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
  ): Promise<BentleyAPIResponse<ITwinExportSingleResponse>> {
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
  ): Promise<BentleyAPIResponse<ITwinExportSingleResponse>> {
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
   * @example
   * ```typescript
   * // Returns MultiITwinMinimalResponse
   * const minimal = await client.getFavoritesITwins(token, { resultMode: "minimal" });
   *
   * // Returns MultiITwinRepresentationResponse
   * const detailed = await client.getFavoritesITwins(token, { resultMode: "representation" });
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getFavoritesITwins(token);
   * ```
   */
  public async getFavoritesITwins<T extends ITwinsQueryArg = ITwinsQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  > {
    const headers = this.getHeaders(arg);
    const url = `${this._baseUrl}/favorites/?${this.getQueryStringArg(
      ITwinsClient.iTwinsQueryParamMapping,
      arg ?? {}
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
  ): Promise<BentleyAPIResponse<undefined>> {
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
  ): Promise<BentleyAPIResponse<undefined>> {
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
  ): Promise<BentleyAPIResponse<ITwinImageResponse>> {
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
  ): Promise<BentleyAPIResponse<ITwinImageResponse>> {
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
  ): Promise<BentleyAPIResponse<undefined>> {
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
  ): Promise<BentleyAPIResponse<undefined>> {
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
   * @example
   * ```typescript
   * // Returns MultiITwinMinimalResponse
   * const minimal = await client.getRecentUsedITwins(token, { resultMode: "minimal" });
   *
   * // Returns MultiITwinRepresentationResponse
   * const detailed = await client.getRecentUsedITwins(token, { resultMode: "representation" });
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getRecentUsedITwins(token);
   * ```
   */
  public async getRecentUsedITwins<T extends ITwinsQueryArg = ITwinsQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  > {
    const headers = this.getHeaders(arg);
    let url = `${this._baseUrl}/recents`;
    const query = this.getQueryStringArg(
      ITwinsClient.iTwinsQueryParamMapping,
      arg ?? {}
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
   * @param repository The Repository data to be created
   * @returns Promise that resolves with the created repository details
   * @beta
   */
  public async createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: NewRepositoryConfig
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, repository);
  }

  /** Delete the specified iTwin Repository
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository to delete
   * @returns Promise that resolves when the repository is successfully deleted
   */
  public async deleteRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<BentleyAPIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Get repositories accessible to user with optional filtering
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param arg Optional query arguments for class and subClass filtering. If subClass is specified, class is also required.
   * @returns Promise that resolves with an array of repositories, may be empty
   */
  public async getRepositories(
    accessToken: AccessToken,
    iTwinId: string,
    arg?:
      | { class: Repository["class"] }
      | { class: Repository["class"]; subClass: Repository["subClass"] }
  ): Promise<BentleyAPIResponse<MultiRepositoriesResponse>> {
    const url = `${
      this._baseUrl
    }/${iTwinId}/repositories/?${this.getQueryStringArg(
      ITwinsClient.repositoryParamMapping,
      arg
    )}`;

    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Get a specific repository by ID
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository
   * @returns Promise that resolves with the repository details
   * @beta
   */
  public async getRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}`;
    return this.sendGenericAPIRequest(accessToken, "GET", url);
  }

  /** Update the specified iTwin Repository
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param repositoryId The id of the Repository
   * @param repository Updated repository data (excluding id, class, and subClass)
   * @returns Promise that resolves with the updated repository
   * @beta
   */
  public async updateRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repository: Partial<Omit<Repository, "id" | "class" | "subClass" | "capabilities">>
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>> {
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
  ): Promise<BentleyAPIResponse<PostRepositoryResourceResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources`;
    return this.sendGenericAPIRequest(
      accessToken,
      "POST",
      url,
      repositoryResource
    );
  }

  /**
   * Delete a repository resource
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the GeographicInformationSystem repository to add the resource to
   * @param resourceId - The id repository resource to delete
   * @returns Promise that resolves when the iTwin is successfully deleted
   *
   * @beta
   */
  public async deleteRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string
  ): Promise<BentleyAPIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources/${resourceId}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "DELETE",
      url
    );
  }

  /**
   * Get a specific repository resource by ID
   *
   * Automatically follows 302 redirects to federated repository endpoints when the repository
   * uses a federated architecture. Authentication headers are forwarded transparently.
   *
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the repository containing the resource
   * @param resourceId - The unique id of the repository resource to retrieve
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with the repository resource details in the requested format
   * @example
   * ```typescript
   * // Returns GetRepositoryResourceMinimalResponse
   * const minimal = await client.getRepositoryResource(token, "iTwinId", "repoId", "resourceId", "minimal");
   *
   * // Returns GetRepositoryResourceRepresentationResponse
   * const detailed = await client.getRepositoryResource(token, "iTwinId", "repoId", "resourceId", "representation");
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getRepositoryResource(token, "iTwinId", "repoId", "resourceId");
   * ```
   * @beta
   */
  public async getRepositoryResource<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetRepositoryResourceRepresentationResponse
      : GetRepositoryResourceMinimalResponse>
  > {
    const headers = this.getResultModeHeaders(resultMode);
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources/${resourceId}`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      headers,
      true
    );
  }

  /**
   * Get multiple repository resources with optional filtering and pagination
   *
   * Automatically follows 302 redirects to federated repository endpoints when the repository
   * uses a federated architecture. Authentication headers are forwarded transparently.
   *
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The id of the iTwin that contains the repository
   * @param repositoryId - The id of the repository containing the resources
   * @param args - Optional query parameters for search, pagination (skip, top)
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with an array of repository resources in the requested format
   * @example
   * ```typescript
   * // Returns GetMultiRepositoryResourceMinimalResponse
   * const minimal = await client.getRepositoryResources(token, "iTwinId", "repoId", undefined, "minimal");
   *
   * // Returns GetMultiRepositoryResourceRepresentationResponse
   * const detailed = await client.getRepositoryResources(token, "iTwinId", "repoId", { search: "test" }, "representation");
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getRepositoryResources(token, "iTwinId", "repoId");
   * ```
   * @beta
   */
  public async getRepositoryResources<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetMultiRepositoryResourceRepresentationResponse
      : GetMultiRepositoryResourceMinimalResponse>
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
      headers,
      true
    );
  }

  /**
   * Get a list of resources from a repository using a capability URI
   *
   * This method enables direct calls to federated repository endpoints using URIs from
   * repository capabilities.
   *
   * @param accessToken - The client access token string for authorization
   * @param uri - The capability URI from repository.capabilities.resources.uri
   * @param args - Optional OData query parameters for filtering and pagination
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with the list of repository resources in the requested format
   * @example
   * ```typescript
   * // Get repository with capabilities
   * const repo = await client.getRepository(token, iTwinId, repositoryId);
   *
   * // Extract capability URI
   * const resourcesUri = repo.data?.repository.capabilities?.resources?.uri;
   *
   * if (resourcesUri) {
   *   // Returns GetMultiRepositoryResourceMinimalResponse
   *   const minimal = await client.getRepositoryResourcesByUri(token, resourcesUri, undefined, "minimal");
   *
   *   // Returns GetMultiRepositoryResourceRepresentationResponse
   *   const detailed = await client.getRepositoryResourcesByUri(token, resourcesUri, undefined, "representation");
   *
   *   // Defaults to minimal when no resultMode specified
   *   const defaultResult = await client.getRepositoryResourcesByUri(token, resourcesUri);
   * }
   * ```
   * @beta
   */
  public async getRepositoryResourcesByUri<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    uri: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetMultiRepositoryResourceRepresentationResponse
      : GetMultiRepositoryResourceMinimalResponse>
  > {
    const headers = this.getResultModeHeaders(resultMode);
    const urlWithQuery = args
      ? `${uri}?${this.getQueryStringArg(ITwinsClient.ODataParamMapping, args)}`
      : uri;

    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      urlWithQuery,
      undefined,
      headers
    );
  }

  /**
   * Get a specific resource from a repository using a capability URI
   *
   * This method enables direct calls to federated repository endpoints using URIs from
   * repository capabilities.
   *
   * @param accessToken - The client access token string for authorization
   * @param uri - The capability URI from repository.capabilities.resources.uri for a specific resource
   * @param resultMode - Optional result mode controlling the level of detail returned (minimal or representation)
   * @returns Promise that resolves with the repository resource details in the requested format
   * @example
   * ```typescript
   * // Get repository with capabilities
   * const repo = await client.getRepository(token, iTwinId, repositoryId);
   *
   * // Construct resource URI (typically from a previous query or known resource ID)
   * const baseUri = repo.data?.repository.capabilities?.resources?.uri;
   * const resourceUri = `${baseUri}/resourceId`;
   *
   * if (resourceUri) {
   *   // Returns GetRepositoryResourceMinimalResponse
   *   const minimal = await client.getRepositoryResourceByUri(token, resourceUri, "minimal");
   *
   *   // Returns GetRepositoryResourceRepresentationResponse
   *   const detailed = await client.getRepositoryResourceByUri(token, resourceUri, "representation");
   *
   *   // Defaults to minimal when no resultMode specified
   *   const defaultResult = await client.getRepositoryResourceByUri(token, resourceUri);
   * }
   * ```
   * @beta
   */
  public async getRepositoryResourceByUri<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    uri: string,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetRepositoryResourceRepresentationResponse
      : GetRepositoryResourceMinimalResponse>
  > {
    const headers = this.getResultModeHeaders(resultMode);
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      uri,
      undefined,
      headers
    );
  }


  /**
   * Retrieves graphics metadata for a specific repository resource using ID-based parameters.
   *
   *
   * Returns graphics content URIs and authentication information needed to access visualization data
   * for a resource. The response includes content type, access URI, optional authentication credentials,
   * and CesiumJS provider configuration when applicable. This method supports redirect-based routing to
   * federated graphics services.
   *
   * For federated architecture support, consider using {@link getResourceGraphicsByUri} with the URI
   * from resource.capabilities.graphics.uri instead.
   *
   * @param accessToken - The client access token string for authorization
   * @param iTwinId - The iTwin identifier
   * @param repositoryId - The repository identifier
   * @param resourceId - The resource identifier
   * @returns Promise that resolves with graphics metadata including content type, URI, and authentication
   * @example
   * ```typescript
   * // Get graphics for a specific resource
   * const graphics = await client.getResourceGraphics(
   *   token,
   *   'itwin-id',
   *   'imodels',
   *   'imodel-resource-id'
   * );
   *
   * if (graphics.data) {
   *   graphics.data.graphics.forEach(graphic => {
   *     console.log('Content type:', graphic.type);
   *     console.log('Graphics URI:', graphic.uri);
   *
   *     // Handle authentication if present
   *     if (graphic.authentication) {
   *       switch (graphic.authentication.type) {
   *         case 'Header':
   *         case 'QueryParameter':
   *           console.log('Auth key:', graphic.authentication.key);
   *           break;
   *         case 'Basic':
   *           console.log('Username:', graphic.authentication.username);
   *           break;
   *         case 'OAuth2AuthorizationCodePKCE':
   *           console.log('Client ID:', graphic.authentication.clientId);
   *           break;
   *       }
   *     }
   *   });
   * }
   * ```
   * @beta
   */
  public async getResourceGraphics(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string
  ): Promise<BentleyAPIResponse<ResourceGraphicsResponse>> {
    const url = `${this._baseUrl}/${iTwinId}/repositories/${repositoryId}/resources/${resourceId}/graphics`;
    return this.sendGenericAPIRequest(
      accessToken,
      "GET",
      url,
      undefined,
      undefined,
      true
    );
  }

  /**
   * Get graphics metadata for a repository resource using a capability URI
   *
   * This method enables direct calls to federated graphics endpoints using URIs from
   * resource capabilities. Instead of constructing URLs from iTwinId, repositoryId, and
   * resourceId, it accepts the URI directly from capabilities.graphics.uri.
   *
   * Note: This method requires that the resource supports graphics capabilities and that
   * the access token has appropriate permissions for the target graphics service.
   *
   * @param accessToken - The client access token string for authorization
   * @param uri - The capability URI from resource.capabilities.graphics.uri
   * @returns Promise that resolves with the graphics metadata including authentication and provider information
   * @example
   * ```typescript
   * // Get resource with graphics capability
   * const resource = await client.getRepositoryResource(token, iTwinId, repositoryId, resourceId);
   *
   * // Extract graphics capability URI
   * const graphicsUri = resource.data?.resource.capabilities?.graphics?.uri;
   *
   * if (graphicsUri) {
   *   const graphics = await client.getResourceGraphicsByUri(token, graphicsUri);
   *
   *   if (graphics.data) {
   *     console.log('Graphics content type:', graphics.data.graphics.contentType);
   *     console.log('Graphics URI:', graphics.data.graphics.uri);
   *   }
   * }
   * ```
   * @beta
   */
  public async getResourceGraphicsByUri(
    accessToken: AccessToken,
    uri: string
  ): Promise<BentleyAPIResponse<ResourceGraphicsResponse>> {
    return this.sendGenericAPIRequest(accessToken, "GET", uri);
  }

  /** Get a specific iTwin by ID
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param resultMode (Optional) iTwin result mode: minimal or representation
   * @returns Promise that resolves with the iTwin details
   * @example
   * ```typescript
   * // Returns ITwinMinimalResponse
   * const minimal = await client.getITwin(token, "id", "minimal");
   *
   * // Returns ITwinRepresentationResponse
   * const detailed = await client.getITwin(token, "id", "representation");
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getITwin(token, "id");
   * ```
   */
  public async getITwin<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: T
  ): Promise<BentleyAPIResponse<T extends "representation"
    ? ITwinRepresentationResponse
    : ITwinMinimalResponse>> {
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

  /** Get iTwins accessible to the user with optional filtering and pagination
   * @param accessToken The client access token string
   * @param arg Optional query arguments for paging, searching, filtering, ordering, and field selection
   * @returns Promise that resolves with an array of iTwins, may be empty
   * @example
   * ```typescript
   * // Returns MultiITwinMinimalResponse
   * const minimal = await client.getITwins(token, { resultMode: "minimal", search: "test" });
   *
   * // Returns MultiITwinRepresentationResponse
   * const detailed = await client.getITwins(token, { resultMode: "representation", filter: "type eq 'Project'" });
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getITwins(token);
   * ```
   */
  public async getITwins<T extends ITwinsGetQueryArg = ITwinsGetQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  > {
    const headers = this.getHeaders(arg);
    const url = `${this._baseUrl}/?${this.getQueryStringArg(
      ITwinsClient.ITwinsGetQueryParamMapping,
      arg ?? {}
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
   * @param iTwin The iTwin data to be created
   * @returns Promise that resolves with the created iTwin details
   */
  public async createITwin(
    accessToken: AccessToken,
    iTwin: ItwinCreate
  ): Promise<BentleyAPIResponse<ITwinRepresentationResponse>> {
    const url = `${this._baseUrl}/`;
    return this.sendGenericAPIRequest(accessToken, "POST", url, iTwin);
  }

  /** Update the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to update
   * @param iTwin The iTwin data to be updated (partial update supported)
   * @returns Promise that resolves with the updated iTwin details
   */
  public async updateItwin(
    accessToken: AccessToken,
    iTwinId: string,
    iTwin: ItwinUpdate
  ): Promise<BentleyAPIResponse<ITwinRepresentationResponse>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "PATCH", url, iTwin);
  }

  /** Delete the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin to delete
   * @returns Promise that resolves when the iTwin is successfully deleted
   */
  public async deleteItwin(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<BentleyAPIResponse<undefined>> {
    const url = `${this._baseUrl}/${iTwinId}`;
    return this.sendGenericAPIRequest(accessToken, "DELETE", url);
  }

  /** Get the primary account accessible to the user
   * @param accessToken The client access token string
   * @returns Promise that resolves with the primary account details
   */
  public async getPrimaryAccount(
    accessToken: AccessToken
  ): Promise<BentleyAPIResponse<ITwinMinimalResponse>> {
    const url = `${this._baseUrl}/myprimaryaccount`;
    return this.sendGenericAPIRequest(accessToken, "GET", url, undefined);
  }

  /**
   * Get the account for the specified iTwin
   * @param accessToken The client access token string
   * @param iTwinId The id of the iTwin
   * @param resultMode (Optional) Result mode: minimal or representation
   * @returns Promise that resolves with the account details
   * @example
   * ```typescript
   * // Returns ITwinMinimalResponse
   * const minimal = await client.getITwinAccount(token, "id", "minimal");
   *
   * // Returns ITwinRepresentationResponse
   * const detailed = await client.getITwinAccount(token, "id", "representation");
   *
   * // Defaults to minimal when no resultMode specified
   * const defaultResult = await client.getITwinAccount(token, "id");
   * ```
   */
  public async getITwinAccount<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: T
  ): Promise<BentleyAPIResponse<T extends "representation"
    ? ITwinRepresentationResponse
    : ITwinMinimalResponse>> {
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
   * Format headers from query arguments including query scope and result mode
   * @param arg (Optional) iTwin query arguments
   * @returns Headers object with formatted query scope and result mode headers
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
   * @param resultMode (Optional) iTwin result mode, defaults to "minimal"
   * @returns Headers object with prefer header for result mode
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
   * @param queryScope (Optional) iTwin query scope, defaults to "memberOfItwin"
   * @returns Headers object with x-itwin-query-scope header
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
