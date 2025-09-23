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

/**
 * Optional query scope. MemberOfITwin is the default. This is used to expand the scope of the query to all iTwins you have access to, not just ones that you are a member of, which only applies to organization administrators.
 */
export type ITwinQueryScope = "memberOfItwin" | "all" | "OrganizationAdmin";

/**
 * Query scope options for iTwin export operations
 */
export type ExportQueryScope = "MemberOfiTwin" | "OrganizationAdmin";

/**
 * Available output formats for iTwin exports
 */
export type ExportOutputFormat =
  | "JsonGZip"
  | "JsonZipArchive"
  | "CsvGZip"
  | "Csv";

/**
 * Status of an iTwin export operation
 */
export type ExportStatus = "Queued" | "InProgress" | "Completed" | "Failed";

/**
 * Response interface for iTwin export operations
 */
export interface ITwinExportSingleResponse {
  export: ITwinExport;
}

export interface ITwinExportMultiResponse {
  exports: ITwinExport[];
}

export interface ITwinExport {
  /** Unique identifier for the export operation */
  id: string;
  /** Original request parameters used to create the export */
  request: ITwinExportQueryArgs;
  /** Current status of the export operation */
  status: ExportStatus;
  /** URL to download the completed export file (null until completed) */
  outputUrl: string | null;
  /** Identifier of the user who created this export */
  createdBy: string;
  /** ISO 8601 timestamp when the export was created */
  createdDateTime: string;
  /** ISO 8601 timestamp when the export processing started (null if not started) */
  startedDateTime: string | null;
  /** ISO 8601 timestamp when the export was completed (null if not completed) */
  completedDateTime: string | null;
}

/**
 * Arguments for creating an iTwin export
 */
export interface ITwinExportQueryArgs {
  /** Export scope - MemberOfiTwin (default) or OrganizationAdmin */
  queryScope?: ExportQueryScope;
  /** Comma-delimited list of iTwin subClasses to include (e.g., 'Asset,Project') */
  subClass?: string;
  /**
   * Comma-delimited list of iTwin properties to include in export.
   * Keep the list as small as possible to increase speed and limit file size.
   * If not specified, exports minimal representation: id,class,subClass,type,number,displayName
   */
  select?: string;
  /**
   * OData filter to limit exported iTwins. Use subClass property for basic filtering,
   * then use filter for additional criteria. All text values are case insensitive.
   *
   * Examples:
   * - status+in+['Active','Inactive']
   * - status+eq+'Active'+and+contains('test',number)+and+CreatedDateTime+ge+2023-01-01T00:00:00Z
   * - parentId+eq+'78202ffd-272b-4207-a7ad-7d2b1af5dafc'+and+(startswith('ABC',number)+or+startswith('ABC',displayName))
   */
  filter?: string;
  /** Include inactive iTwins in the export */
  includeInactive?: boolean;
  /** Required output format for the export file */
  outputFormat: ExportOutputFormat;
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
    args: ITwinExportQueryArgs
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Create a new iTwin export */
  getExport(
    accessToken: AccessToken,
    id: string
  ): Promise<APIResponse<ITwinExportSingleResponse>>;

  /** Get a list of iTwin exports for user */
  getExports(
    accessToken: AccessToken,
  ): Promise<APIResponse<ITwinExportMultiResponse>>;

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

  /** Get favorited iTwins */
  queryFavoritesAsync(
    accessToken: AccessToken,
    arg?: ITwinsQueryArg
  ): Promise<APIResponse<ITwin[]>>;

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
