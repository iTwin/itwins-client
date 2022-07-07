/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module ProjectsClient
 */

import type { AccessToken } from "@itwin/core-bentley";

/** The a simplified project object
 * @beta
 */
export interface Project {
  name?: string;
  id: string;
  code?: string;
}

/** Argument for methods that may take pagination
 * @beta
*/
export interface ProjectsPaginationArg {
  top?: number;
  skip?: number;
}

/** Set of properties that can be searched
 * @beta
*/
export enum ProjectsSearchableProperty {
  Name = "displayName",
}

/** Argument for methods that may take searching
 * @beta
*/
export interface ProjectsSearchArg {
  searchString: string;
  propertyName: ProjectsSearchableProperty;
  exactMatch: boolean;
}

/** Possible Project sources.
 * @beta
 */
export enum ProjectsSource {
  All = "",
  Favorites = "favorites",
  Recents = "recents"
}

/** Set of optional arguments used for methods that allow advanced queries.
 * The source and search properties are mutually exclusive.
 * @beta
 */
export type ProjectsQueryArg =
  { pagination?: ProjectsPaginationArg, search?: never, source?: ProjectsSource } |
  { pagination?: ProjectsPaginationArg, search?: ProjectsSearchArg, source?: never };

/** Methods for accessing projects
 * @beta
*/
export interface ProjectsAccess {
  /** Get projects associated with the requester */
  getAll(accessToken: AccessToken, arg?: ProjectsQueryArg): Promise<Project[]>;
}

/** An async function that returns a [[ProjectsQueryResult]]
 * @beta
 */
export type ProjectsQueryFunction = (accessToken: AccessToken) => Promise<ProjectsQueryResult>;

/** Links returned from a query.
 * @beta
 */
export interface ProjectsLinks {
  self?: ProjectsQueryFunction;
  next?: ProjectsQueryFunction;
  previous?: ProjectsQueryFunction;
}

/** Query results.
 * @beta
 */
export interface ProjectsQueryResult {
  projects: Project[];
  links: ProjectsLinks;
}
