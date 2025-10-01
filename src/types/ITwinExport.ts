/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
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
 * Arguments for creating an iTwin export
 */
export interface ITwinExportRequestInfo {
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
 * Represents an iTwin export data with its current state and metadata
 */
export interface ITwinExport {
  /** Unique identifier for the export operation */
  id: string;
  /** Original request parameters used to create the export */
  request: ITwinExportRequestInfo;
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