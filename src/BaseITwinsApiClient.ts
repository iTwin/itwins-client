/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { BaseBentleyAPIClient } from "./BaseBentleyAPIClient";
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
import type { ITwinImageResponse } from "./types/ITwinImage";
import type { ITwinsGetQueryArg, ITwinsQueryArg } from "./types/ITwinsQueryArgs";
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
import type { ParameterMapping } from "./types/typeUtils";

/** Abstract class for accessing working with ITwins Service
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
  protected static readonly iTwinsQueryParamMapping: ParameterMapping<ITwinsQueryArg> =
    {
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
      resultMode: "",
      queryScope: "",
    } as const;

  /**
   * Maps the properties some of the {@link ODataQueryParams} to their corresponding query parameter names.
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected static readonly ODataParamMapping: ParameterMapping<
    Pick<ODataQueryParams, "search" | "skip" | "top">
  > = {
    top: "$top",
    skip: "$skip",
    search: "$search",
  } as const;

  /**
   * Maps the properties some of the {@link ODataQueryParams} and all of the {@link ITwinsQueryArg} to their corresponding query parameter names.
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected static readonly ITwinsGetQueryParamMapping: ParameterMapping<
    ITwinsQueryArg & Pick<ODataQueryParams, "filter" | "orderby" | "select">
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
    resultMode: "",
    queryScope: "",
    filter: "$filter",
    orderby: "$orderby",
    select: "$select",
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
      const urlPrefix = globalThis.IMJS_URL_PREFIX;
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
  ): Promise<BentleyAPIResponse<ITwinExportSingleResponse>>;

  /** Get a iTwin export */
  public abstract getExport(
    accessToken: AccessToken,
    id: string
  ): Promise<BentleyAPIResponse<ITwinExportSingleResponse>>;

  /** Get a list of iTwin exports for user */
  public abstract getExports(
    accessToken: AccessToken
  ): Promise<BentleyAPIResponse<ITwinExportMultiResponse>>;

  /** Get favorites iTwins accessible to the user */
  public abstract getFavoritesITwins<T extends ITwinsQueryArg = ITwinsQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  >;

  /** Add iTwin to favorites */
  public abstract addITwinToFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Remove iTwin from favorites */
  public abstract removeITwinFromFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Adds image to iTwin  */
  public abstract uploadITwinImage(
    accessToken: AccessToken,
    iTwinId: string,
    imageBlob: Blob,
    contentType: "image/png" | "image/jpeg"
  ): Promise<BentleyAPIResponse<ITwinImageResponse>>;

  /** Add the specified iTwin to the user's recently used list */
  public abstract addITwinToMyRecents(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Get recently used iTwins for the current user, maximum 25 items ordered by most recent first */
  public abstract getRecentUsedITwins<T extends ITwinsQueryArg = ITwinsQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  >;

  /** Create a new repository for the specified iTwin */
  public abstract createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: NewRepositoryConfig
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>>;

  /** Delete the specified repository from an iTwin */
  public abstract deleteRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Get all repositories for an iTwin with optional filtering by class and subClass. If subClass is specified, class is also required. */
  public abstract getRepositories(
    accessToken: AccessToken,
    iTwinId: string,
    arg?:
      | { class: Repository["class"] }
      | { class: Repository["class"]; subClass: Repository["subClass"] }
  ): Promise<BentleyAPIResponse<MultiRepositoriesResponse>>;

  /** Get a specific repository by ID from an iTwin */
  public abstract getRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>>;

  /** Update a specific repository by ID from an iTwin */
  public abstract updateRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repository: Partial<Omit<Repository, "id" | "class" | "subClass" | "capabilities">>
  ): Promise<BentleyAPIResponse<SingleRepositoryResponse>>;

  /** Create a repository resource for a repository of class GeographicInformationSystem */
  public abstract createRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repositoryResource: Pick<Repository, "id" | "displayName">
  ): Promise<BentleyAPIResponse<PostRepositoryResourceResponse>>;

  /** Delete a repository resource from a repository */
  public abstract deleteRepositoryResource(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Get a repository resource for a repository */
  public abstract getRepositoryResource<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetRepositoryResourceRepresentationResponse
      : GetRepositoryResourceMinimalResponse>
  >;

  /** Get repository resources for a repository */
  public abstract getRepositoryResources<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetMultiRepositoryResourceRepresentationResponse
      : GetMultiRepositoryResourceMinimalResponse>
  >;

  /** Get a list of resources from a repository using a capability URI */
  public abstract getRepositoryResourcesByUri<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    uri: string,
    args?: Pick<ODataQueryParams, "search" | "skip" | "top">,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetMultiRepositoryResourceRepresentationResponse
      : GetMultiRepositoryResourceMinimalResponse>
  >;

  /** Get a specific resource from a repository using a capability URI */
  public abstract getRepositoryResourceByUri<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    uri: string,
    resultMode?: T
  ): Promise<
    BentleyAPIResponse<T extends "representation"
      ? GetRepositoryResourceRepresentationResponse
      : GetRepositoryResourceMinimalResponse>
  >;

  /** Get graphics metadata for a repository resource using ID-based parameters */
  public abstract getResourceGraphics(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    resourceId: string
  ): Promise<BentleyAPIResponse<ResourceGraphicsResponse>>;

  /** Get graphics metadata for a repository resource using a capability URI */
  public abstract getResourceGraphicsByUri(
    accessToken: AccessToken,
    uri: string
  ): Promise<BentleyAPIResponse<ResourceGraphicsResponse>>;

  /** Get image for iTwin  */
  public abstract getITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<BentleyAPIResponse<ITwinImageResponse>>;

  /** Deletes image from iTwin  */
  public abstract deleteITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Get iTwins */
  public abstract getITwins<T extends ITwinsGetQueryArg = ITwinsGetQueryArg>(
    accessToken: AccessToken,
    arg?: T
  ): Promise<
    BentleyAPIResponse<T["resultMode"] extends "representation"
      ? MultiITwinRepresentationResponse
      : MultiITwinMinimalResponse>
  >;

  /** Delete the specified iTwin */
  public abstract deleteItwin(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<BentleyAPIResponse<undefined>>;

  /** Get an ITwin */
  public abstract getITwin<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: T
  ): Promise<BentleyAPIResponse<T extends "representation"
    ? ITwinRepresentationResponse
    : ITwinMinimalResponse>>;

  /** Get the primary account ITwin */
  public abstract getPrimaryAccount(
    accessToken: AccessToken
  ): Promise<BentleyAPIResponse<ITwinMinimalResponse>>;

  /* Get the account for an iTwin */
  public abstract getITwinAccount<T extends ResultMode = "minimal">(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: T
  ): Promise<BentleyAPIResponse<T extends "representation"
    ? ITwinRepresentationResponse
    : ITwinMinimalResponse>>;

  /** Create a new iTwin */
  public abstract createITwin(
    accessToken: AccessToken,
    iTwin: ItwinCreate
  ): Promise<BentleyAPIResponse<ITwinRepresentationResponse>>;

  /** Update the specified iTwin */
  public abstract updateItwin(
    accessToken: AccessToken,
    iTwinId: string,
    iTwin: ItwinUpdate
  ): Promise<BentleyAPIResponse<ITwinRepresentationResponse>>;
}
