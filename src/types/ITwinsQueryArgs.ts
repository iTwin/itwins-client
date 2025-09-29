import { ResultMode } from "./CommonApiTypes.js";
import { ITwinSubClass } from "./ITwin.js";

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
 * Optional query scope. MemberOfITwin is the default. This is used to expand the scope of the query to all iTwins you have access to, not just ones that you are a member of, which only applies to organization administrators.
 */
export type ITwinQueryScope = "memberOfItwin" | "all" | "OrganizationAdmin";