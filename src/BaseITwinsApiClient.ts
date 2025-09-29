/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */

import type { AccessToken } from "@itwin/core-bentley";
import { BaseBentleyAPIClient } from "./BaseBentleyAPIClient";
import type {
  APIResponse,
  ODataQueryParams,
  ResultMode,
} from "./types/CommonApiTypes";
import type { ITwin, ITwinRecentsResponse } from "./types/ITwin";
import type {
  ITwinExportMultiResponse,
  ITwinExportRequestInfo,
  ITwinExportSingleResponse,
} from "./types/ITwinExport";
import type { ITwinImageResponse } from "./types/ITwinImage";
import type { ITwinsQueryArg } from "./types/ITwinsQueryArgs";
import type {
  MultiRepositoriesResponse,
  Repository,
  PostRepositoryResourceResponse,
  SingleRepositoryResponse,
  getRepositoryResourceRepresentationResponse,
  getRepositoryResourceMinimalResponse,
  getMultiRepositoryResourceMinimalResponse,
  getMultiRepositoryResourceRepresentationResponse,
} from "./types/Repository";
import type { ParameterMapping } from "./types/typeUtils";

/** Methods for accessing itwins
 * @beta
 */
export abstract class BaseITwinsApiClient extends BaseBentleyAPIClient {
  /**
   * Maps the properties of {@link ITwinsQueryArg} to their corresponding query parameter names.
   *
   * @remarks
   * This mapping is used to translate internal property names to the expected parameter names
   * when constructing iTwins queries. Properties mapped to empty strings are excluded from
   * the query string as they should be sent as headers instead.
   *
   * The mapping includes both OData query parameters (prefixed with $) and iTwins-specific
   * parameters for filtering and pagination.
   *
   * @readonly
   */
  protected static readonly iTwinsQueryParamMapping: ParameterMapping<
    Omit<ITwinsQueryArg, "resultMode" | "queryScope">
  > = {
    subClass: "subClass",
    type: "type",
    status: "status",
    search: "$search",
    displayName: "displayName",
    // eslint-disable-next-line id-denylist
    number: "number",
    top: "$top",
    skip: "$skip",
    parentId: "parentId",
    iTwinAccountId: "iTwinAccountId",
    includeInactive: "includeInactive",
  } as const;

  /**
   * Maps the properties of {@link ITwinsQueryArg} to their corresponding query parameter names.
   *
   * @remarks
   * This mapping is used to translate internal property names to the expected parameter names
   * when constructing iTwins queries. Properties mapped to empty strings are excluded from
   * the query string as they should be sent as headers instead.
   *
   * The mapping includes both OData query parameters (prefixed with $) and iTwins-specific
   * parameters for filtering and pagination.
   *
   * @readonly
   */
  protected static readonly ODataParamMapping: ParameterMapping<
    Pick<ODataQueryParams, "search" | "skip" | "top">
  > = {
    top: "$top",
    skip: "$skip",
    search: "$search",
  } as const;

  /**
   * Maps the properties of class and subclass to their corresponding query parameter names.
   *
   * @remarks
   * This mapping is used to translate internal property names to the expected parameter names
   * when constructing repository queries.
   *
   * @readonly
   */
  protected static readonly repositoryParamMapping: ParameterMapping<{
    class: Repository["class"];
    subClass: Repository["subClass"];
  }> = {
    class: "class",
    subClass: "subClass",
  } as const;

  /**
   * The base URL for iTwins API endpoints.
   * The URL can be customized via the constructor parameter or automatically
   * modified based on the IMJS_URL_PREFIX environment variable for different
   * deployment environments.
   *
   * @readonly
   */
  protected readonly _baseUrl: string = "https://api.bentley.com/itwins";

  /**
   * Creates a new BaseClient instance for iTwins API operations
   * @param url - Optional custom base URL, defaults to production iTwins API URL
   *
   * @example
   * ```typescript
   * // Use default production URL
   * const client = new BaseClient();
   *
   * // Use custom URL for development/testing
   * const client = new ITwinsAccessClient("https://dev-api.bentley.com/itwins");
   * ```
   */
  public constructor(url?: string) {
    super();
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

  /** Create a new iTwin export */
  public abstract createExport(
    accessToken: AccessToken,
    args: ITwinExportRequestInfo
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Create a new iTwin export */
  public abstract getExport(
    accessToken: AccessToken,
    id: string
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Get a list of iTwin exports for user */
  public abstract getExports(
    accessToken: AccessToken
  ): Promise<APIResponse<ITwinExportMultiResponse>>;

  /** Get favorites iTwins accessible to the user */
  public abstract getFavoritesITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Add iTwin to favorites */
  public abstract addITwinToFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>>;

  /** Remove iTwin from favorites */
  public abstract removeITwinFromFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>>;

  /** Adds image to iTwin  */
  public abstract uploadITwinImage(
    accessToken: AccessToken,
    iTwinId: string,
    imageBlob: Blob,
    contentType: "image/png" | "image/jpeg"
  ): Promise<APIResponse<ITwinImageResponse>>;

  /** Add the specified iTwin to the user's recently used list */
  public abstract addITwinToMyRecents(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>>;

  /** Get recently used iTwins for the current user, maximum 25 items ordered by most recent first */
  public abstract getMyRecentUsedITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwinRecentsResponse>>;

  /** Create a new repository for the specified iTwin */
  public abstract createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: Omit<Repository, "id">
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** Delete the specified repository from an iTwin */
  public abstract deleteRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<APIResponse<undefined>>;

  /** Get all repositories for an iTwin with optional filtering by class and subClass. If subClass is specified, class is also required. */
  public abstract getRepositories(
    accessToken: AccessToken,
    iTwinId: string,
    arg?:
      | { class: Repository["class"] }
      | { class: Repository["class"]; subClass: Repository["subClass"] }
  ): Promise<APIResponse<MultiRepositoriesResponse>>;

  /** Get a specific repository by ID from an iTwin */
  public abstract getRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** update a specific repository by ID from an iTwin */
  public abstract updateRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repository: Omit<Repository, "id" | "class" | "subClass">
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** Create a repository resource for a repository of class GeographicInformationSystem */
  public abstract createRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repositoryResource: Pick<Repository, "id" | "displayName">
  ): Promise<APIResponse<PostRepositoryResourceResponse>>;

  /** get a repository resource for a repository */
  public abstract getRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string,
    resultMode?: ResultMode
  ): Promise<
    APIResponse<
      | getRepositoryResourceRepresentationResponse
      | getRepositoryResourceMinimalResponse
    >
  >;

  /** get repository resources for a repository */
  public abstract getRepositoryResources(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: ResultMode
  ): Promise<
    APIResponse<
      | getMultiRepositoryResourceMinimalResponse
      | getMultiRepositoryResourceRepresentationResponse
    >
  >;

  /** Adds image for iTwin  */
  public abstract getITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<ITwinImageResponse>>;

  /** Deletes image from iTwin  */
  public abstract deleteITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>>;

  /** Get iTwins */
  public abstract queryAsync(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Get an ITwin */
  public abstract getAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwin>>;

  /** Get recent iTwins */
  public abstract queryRecentsAsync(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Get the primary account ITwin */
  public abstract getPrimaryAccountAsync(
    accessToken: AccessToken
  ): Promise<APIResponse<ITwin>>;

  /* Get the account for an iTwin */
  public abstract getAccountAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwin>>;
}
