/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */

import type { AccessToken } from "@itwin/core-bentley";
import { ITwin, ITwinSubClass } from "./types/ITwin";
import { APIResponse, ResultMode } from "./types/CommonApiTypes.ts";
import { Repository } from "./types/Repository";
import { ITwinExport, ITwinExportRequestInfo } from "./types/ITwinExport";
import { ITwinImage } from "./types/ITwinImage";
import { Links } from "./types/links";

/**
 * Optional query scope. MemberOfITwin is the default. This is used to expand the scope of the query to all iTwins you have access to, not just ones that you are a member of, which only applies to organization administrators.
 */
export type ITwinQueryScope = "memberOfItwin" | "all" | "OrganizationAdmin";

/**
 * Response interface for iTwin export operations
 */
export interface ITwinExportSingleResponse {
  export: ITwinExport;
}

/**
 * Response interface for multiple iTwin export operations
 */
export interface ITwinExportMultiResponse {
  exports: ITwinExport[];
}

/**
 * Response interface for iTwin image operations
 */
export interface ITwinImageResponse {
  image: ITwinImage;
}

/**
 * Response interface for single repository operations (create, get, update)
 */
export interface SingleRepositoryResponse {
  /** The repository object returned by the API */
  repository: Repository;
}

/**
 * Response interface for multiple repository operations get repositories
 */
export interface MultiRepositoriesResponse {
  /** Array of repository objects returned by the API */
  repositories: Repository[];
}

/**
 * Response interface for recently used iTwins operations
 */
export interface ITwinRecentsResponse {
  /** Array of recently used iTwin objects */
  iTwins: ITwin[];
  /** Navigation links for pagination and related resources */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: Links;
}

/**
 * Base set of query arguments for iTwins API operations
 */
export interface ITwinsQueryArg extends ITwinsQueryArgsApi {
  subClass?: ITwinSubClass;
  status?: string;
  type?: string;
  includeInactive?: boolean;
  displayName?: string;
  // eslint-disable-next-line id-denylist
  number?: string;
  parentId?: string;
  iTwinAccountId?: string;
}

/**
 * API-level query arguments for iTwins operations.
 *
 * These parameters control result formatting, paging, and search for API requests.
 * They are typically sent as query parameters or headers depending on the parameter type.
 *
 * @public
 */
export interface ITwinsQueryArgsApi {
  /** Controls the level of detail in the response (minimal or representation) */
  resultMode?: ResultMode;
  /** Limits the scope of the query (memberOfItwin, all, OrganizationAdmin) */
  queryScope?: ITwinQueryScope;
  /** Maximum number of results to return (for pagination) */
  top?: number;
  /** Number of results to skip (for pagination) */
  skip?: number;
  /** Search string to filter results by keyword */
  search?: string;
}

/** Methods for accessing itwins
 * @beta
 */
export interface ITwinsAccess {
  /** Create a new iTwin export */
  createExport(
    accessToken: AccessToken,
    args: ITwinExportRequestInfo
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Create a new iTwin export */
  getExport(
    accessToken: AccessToken,
    id: string
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Get a list of iTwin exports for user */
  getExports(
    accessToken: AccessToken
  ): Promise<APIResponse<ITwinExportMultiResponse>>;

  /** Get favorites iTwins accessible to the user */
  getFavoritesITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Add iTwin to favorites */
  addITwinToFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>>;

  /** Remove iTwin from favorites */
  removeITwinFromFavorites(
    accessToken: AccessToken,
    iTwinId?: string
  ): Promise<APIResponse<undefined>>;

  /** Adds image to iTwin  */
  uploadITwinImage(
    accessToken: AccessToken,
    iTwinId: string,
    imageBlob: Blob,
    contentType: "image/png" | "image/jpeg"
  ): Promise<APIResponse<ITwinImageResponse>>;

  /** Add the specified iTwin to the user's recently used list */
  addITwinToMyRecents(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>>;

  /** Get recently used iTwins for the current user, maximum 25 items ordered by most recent first */
  getMyRecentUsedITwins(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwinRecentsResponse>>;

  /** Create a new repository for the specified iTwin */
  createRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repository: Omit<Repository, "id">
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** Delete the specified repository from an iTwin */
  deleteRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<APIResponse<undefined>>;

  /** Get all repositories for an iTwin with optional filtering by class and subClass. If subClass is specified, class is also required. */
  getRepositories(
    accessToken: AccessToken,
    iTwinId: string,
    arg?:
      | { class: Repository["class"] }
      | { class: Repository["class"]; subClass: Repository["subClass"] }
  ): Promise<APIResponse<MultiRepositoriesResponse>>;

  /** Get a specific repository by ID from an iTwin */
  getRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** update a specific repository by ID from an iTwin */
  updateRepository(
    accessToken: AccessToken,
    iTwinId: string,
    repositoryId: string,
    repository: Omit<Repository, "id" | "class" | "subClass">
  ): Promise<APIResponse<SingleRepositoryResponse>>;

  /** Adds image for iTwin  */
  getITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<ITwinImageResponse>>;

  /** Deletes image from iTwin  */
  deleteITwinImage(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<undefined>>;

  /** Get iTwins */
  queryAsync(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Get an ITwin */
  getAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwin>>;

  /** Get recent iTwins */
  queryRecentsAsync(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

  /** Get the primary account ITwin */
  getPrimaryAccountAsync(accessToken: AccessToken): Promise<APIResponse<ITwin>>;

  /* Get the account for an iTwin */
  getAccountAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ResultMode
  ): Promise<APIResponse<ITwin>>;
}
