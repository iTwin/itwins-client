/**
 * Common HTTP methods used in API requests
 */
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Configuration object for HTTP requests
 */
export interface RequestConfig {
  method: Method;
  url: string;
  body?: string | Blob;
  headers: Record<string, string>;
}

/**
 * Standard response structure for all Bentley public API operations
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
 * Result mode preference for API responses.
 * - minimal: Returns only essential data fields
 * - representation: Returns complete data with all available properties
 */
export type ResultMode = "minimal" | "representation";

/**
 * OData query parameters interface for filtering, pagination, and data manipulation.
 * Supports standard OData v4 query options for flexible API data retrieval.
 * @see {@link https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html} OData URL Conventions
 */
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