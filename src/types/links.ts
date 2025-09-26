/**
 * Represents a hyperlink reference in API responses
 */
export interface Link {
  /** The URL or URI of the link */
  href: string;
}

/**
 * Collection of navigation links typically used for pagination in API responses.
 * Follows HAL (Hypertext Application Language) specification for hypermedia links.
 */
export interface Links {
  /** Link to the current resource */
  self: Link;
  /** Link to the previous page of results */
  prev: Link;
  /** Link to the next page of results */
  next: Link;
}