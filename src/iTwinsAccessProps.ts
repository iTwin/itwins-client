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

/**
 * Set of optional arguments used for querying Repositories API
 */
export interface RepositoriesQueryArg {
  class?: string;
  subClass?: string;
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

  /** Get iTwins */
  queryRepositoriesAsync(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<APIResponse<Repository[]>>;

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
