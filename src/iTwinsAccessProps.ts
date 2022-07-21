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
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get an ITwin */
  getAsync(
    accessToken: AccessToken,
    iTwinId: string
  ): Promise<ITwinsAPIResponse<ITwin>>;

  /** Get favorited iTwins */
  queryFavoritesAsync(
    accessToken: AccessToken,
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get recent iTwins */
  queryRecentsAsync(
    accessToken: AccessToken,
    subClass: ITwinSubClass,
    arg?: ITwinsQueryArg
  ): Promise<ITwinsAPIResponse<ITwin[]>>;

  /** Get the primary account ITwin */
  getPrimaryAccountAsync(
    accessToken: AccessToken
  ): Promise<ITwinsAPIResponse<ITwin>>;
}

export interface ITwinsAPIResponse<T> {
  data?: T;
  status: number;
  statusText: string;
  error?: Error;
}

/** The a simplified ITwin object
 * @beta
 */
export interface ITwin {
  id: string;
  class: ITwinSubClass;
  subClass: ITwinClass;
  type: string;
  displayName: string;
  // eslint-disable-next-line id-blacklist
  number: string;
}

export enum ITwinSubClass {
  Account = "Account",
  Asset = "Asset",
  Project = "Project",
}

export enum ITwinClass {
  Account = "Account",
  Thing = "Thing",
  Endeavor = "Endeavor",
}

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
