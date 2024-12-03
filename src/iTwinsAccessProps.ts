/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */

import type { AccessToken } from "@itwin/core-bentley";

/** Methods for accessing itwins
 * @beta
 */
export interface ITwinsAccess {
  /** Get iTwins */
  queryAsync(
    accessToken: AccessToken,
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get iTwins */
  queryRepositoriesAsync(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<ITwinsAPIResponse<Repository[]>>;

  /** Get an ITwin */
  getAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ITwinResultMode
  ): Promise<ITwinsAPIResponse<ITwin>>;

  /** Get favorited iTwins */
  queryFavoritesAsync(
    accessToken: AccessToken,
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get recent iTwins */
  queryRecentsAsync(
    accessToken: AccessToken,
    subClass?: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get the primary account ITwin */
  getPrimaryAccountAsync(
    accessToken: AccessToken
  ): Promise<ITwinsAPIResponse<ITwin>>;

  /* Get the account for an iTwin */
  getAccountAsync(
    accessToken: AccessToken,
    iTwinId: string,
    resultMode?: ITwinResultMode
  ): Promise<ITwinsAPIResponse<ITwin>>;
}

export interface ITwinsAPIResponse<T> {
  data?: T;
  status: number;
  error?: Error;
}

/** The ITwin object. Contains extra properties with "representation" result mode.
 * @beta
 */
export interface ITwin {
  id?: string;
  class?: ITwinClass;
  subClass?: ITwinSubClass;
  type?: string;
  displayName?: string;
  // eslint-disable-next-line id-blacklist
  number?: string;
  dataCenterLocation?: string;
  status?: string;

  // extra properties available with "representation" result mode:
  parentId?: string;
  iTwinAccountId?: string;
  ianaTimeZone?: string | null;
  imageName?: string | null;
  image?: string | null;
  createdDateTime?: string;
  createdBy?: string;
}

/** The simplified Repository object
 * @beta
 */
export interface Repository {
  id?: string;
  class: RepositoryClass;
  subClass: RepositorySubClass;
  uri: string;
}

export enum ITwinSubClass {
  Account = "Account",
  Asset = "Asset",
  Project = "Project",
  Portfolio = "Portfolio",
  Program = "Program",
  WorkPackage = "WorkPackage",
}

export enum ITwinClass {
  Account = "Account",
  Thing = "Thing",
  Endeavor = "Endeavor",
}

export enum RepositoryClass {
  iModels = "iModels",
  Storage = "Storage",
  Forms = "Forms",
  Issues = "Issues",
  RealityData = "RealityData",
  GeographicInformationSystem = "GeographicInformationSystem"
}

export enum RepositorySubClass {
  WebMapService = "WebMapService",
  WebMapTileService = "WebMapTileService",
  MapServer = "MapServer"
}

/**
 * Optional result mode. Minimal is the default, representation returns extra properties
 */
export type ITwinResultMode = "minimal" | "representation";

/**
 * Optional query scope. MemberOfITwin is the default. This is used to expand the scope of the query to all iTwins you have access to, not just ones that you are a member of, which only applies to organization administrators.
 */
export type ITwinQueryScope = "memberOfItwin" | "all";

/** Set of optional arguments used for querying the iTwins API
 * @beta
 */
export interface ITwinsQueryArg {
  top?: number;
  skip?: number;
  search?: string;
  displayName?: string;
  // eslint-disable-next-line id-blacklist
  number?: string;
  type?: string;
  resultMode?: ITwinResultMode;
  queryScope?: ITwinQueryScope;
  subClass?: ITwinSubClass;
}

/** Set of optional arguments used for querying Respositories API
 *
 */
export interface RepositoriesQueryArg {
  class?: string;
  subClass?: string;
}

export interface Error {
  code: string;
  message: string;
  details?: ErrorDetail[];
  target?: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
  target?: string;
}
