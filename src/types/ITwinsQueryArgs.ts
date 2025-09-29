import { ODataQueryParams, ResultMode } from "./CommonApiTypes.js";
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
export interface ITwinsQueryArgsApi
  extends Pick<ODataQueryParams, "search" | "skip" | "top"> {
  /** Controls the level of detail in the response (minimal or representation) */
  resultMode?: ResultMode;
  /** Limits the scope of the query (memberOfItwin, all, OrganizationAdmin) */
  queryScope?: ITwinQueryScope;
}

/**
 * Optional query scope. MemberOfITwin is the default. This is used to expand the scope of the query to all iTwins you have access to, not just ones that you are a member of, which only applies to organization administrators.
 */
export type ITwinQueryScope = "memberOfItwin" | "all" | "OrganizationAdmin";
