/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module iTwinsClient
 */

import type { AccessToken } from "@itwin/core-bentley";

/** The a simplified iTwin object
 * @beta
 */
export interface iTwin {
  id: string;
  class: string;
  subClass: string;
  type: string;
  displayName: string;
  number: string;
}

export enum iTwinSubClass {
  Account = "Account",
  Asset = "Asset",
  Project = "Project",
}

export enum iTwinClass {
  Account = "Account",
  Thing = "Thing",
  Endeavor = "Endeavor",
}

/** Methods for accessing itwins
 * @beta
 */
export interface iTwinsAccess {
  /** Get iTwins associated with the requester */
  queryAsync(
    accessToken: AccessToken,
    subClass: iTwinSubClass,
    arg?: iTwinsQueryArg
  ): Promise<iTwin[]>;
  /** Get an iTwin associated with the requester */
  // getAsync(
  //   accessToken: AccessToken,
  //   iTwinId: string,
  //   arg?: iTwinsQueryArg
  // ): Promise<iTwin>;
}

/** Set of optional arguments used for querying the iTwins API
 * @beta
 */
export interface iTwinsQueryArg {
  top?: number;
  skip?: number;
  search?: string;
  displayName?: string;
  number?: string;
  type?: string;
}
