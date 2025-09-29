/**
 * Standard response structure for all iTwins API operations
 * @template T The type of data returned in the response
 */
export interface APIResponse<T> {
  data?: T;
  status: number;
  error?: ApimError;
}

/**
 * Error response structure from iTwins API
 */
export interface ApimError {
  code: string;
  message: string;
  details?: ErrorDetail[];
  target?: string;
}

/**
 * Detailed error information from iTwins API responses
 */
export interface ErrorDetail {
  code: string;
  message: string;
  target?: string;
}

/**
 * prefer header result mode
 */
export type ResultMode = "minimal" | "representation";

export interface ODataQueryParams {
  /** Maximum number of results to return (for pagination) */
  top?: number;
  /** Number of results to skip (for pagination) */
  skip?: number;
  /** Search string to filter results by keyword */
  search?: string;
  /** Filter expression to apply to the query */
  filter?: string;
  /** Comma-separated list of properties to include in the response */
  select?: string;
  /** Comma-separated list of properties to expand with related data */
  expand?: string;
  /** Comma-separated list of properties to order results by (append ' desc' for descending) */
  orderby?: string;
  /** Include total count of matching records in response metadata */
  count?: boolean;
  /** Apply aggregation transformations to the data */
  apply?: string;
  /** Specify response format (json, xml, etc.) */
  format?: string;
}