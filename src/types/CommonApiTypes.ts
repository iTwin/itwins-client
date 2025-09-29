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
 * Optional result mode. Minimal is the default, representation returns extra properties
 */
export type ResultMode = "minimal" | "representation";