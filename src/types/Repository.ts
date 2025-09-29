import { Links } from "./links";

/**
 * Repository object representing a service or data source that contains data for an iTwin.
 * A repository can be any external service like imagery providers, map services, or other data sources.
 * @beta
 */
export interface Repository {
  /** Unique identifier for the repository */
  id?: string;
  /** Main classification of the repository */
  class: RepositoryClass;
  /** Sub-classification providing more specific categorization */
  subClass: RepositorySubClass;
  /** Human-readable name for the repository */
  displayName?: string;
  /** The URI or endpoint URL for accessing the repository data */
  uri: string;
  /** Authentication configuration for accessing the repository */
  authentication?: RepositoryAuthentication;
  /** Repository-specific options and configuration parameters */
  options?: RepositoryOptions;
}

/**
 * Authentication configuration for repository access
 * @beta
 */
export interface RepositoryAuthentication {
  /** Type of authentication method to use */
  type: "Header" | "QueryParameter";
  /** The key/name for the authentication parameter */
  key: string;
  /** The value for the authentication parameter */
  value: string;
}

/**
 * Repository-specific options and configuration parameters.
 * The structure varies based on the repository class and subclass.
 * @beta
 */
export interface RepositoryOptions {
  /** Query parameters to be added to requests */
  queryParameters?: Record<string, string>;
  /** Additional subclass-specific properties */
  [key: string]: unknown;
}

/**
 * Repository classification types for different data sources
 * @beta
 */
export type RepositoryClass =
  | "iModels"
  | "Storage"
  | "Forms"
  | "Issues"
  | "RealityData"
  | "GeographicInformationSystem"
  | "Construction"
  | "Performance"
  | "Subsurface";

/**
 * Repository sub-classification types for specific data source implementations.
 * Each subclass corresponds to specific imagery providers or data source types.
 * @beta
 */
export type RepositorySubClass =
  | "WebMapService"
  | "WebMapTileService"
  | "ArcGIS"
  | "UrlTemplate"
  | "EvoWorkspace";

/**
 * Response interface for single repository operations (create, get, update)
 */
export interface SingleRepositoryResponse {
  /** The repository object returned by the API */
  repository: Repository;
}

/**
 * Response interface for multiple repository operations get repositories
 */
export interface MultiRepositoriesResponse {
  /** Array of repository objects returned by the API */
  repositories: Repository[];
}

export interface PostRepositoryResourceResponse {
  resource: Pick<Repository, "id" | "subClass" | "displayName"> & {
    class: "GeographicInformationSystem";
  };
}

export interface getRepositoryResourceMinimalResponse {
  resource: Pick<Repository, "id" | "subClass" | "displayName"> & {
    type?: string;
    class:
      | "GeographicInformationSystem"
      | "CesiumCuratedContent"
      | "GeospatialFeatures"
      | "RealityData"
      | "iModels";
    capabilities?: {
      graphics: {
        uri: string;
      };
    };
  };
}

export interface getRepositoryResourceRepresentationResponse extends getRepositoryResourceMinimalResponse {
  properties?: {
    [key: string]: unknown;
  };
}

export interface getMultiRepositoryResourceMinimalResponse {
  resources: getRepositoryResourceMinimalResponse['resource'][];
  _links: Links;
}

export interface getMultiRepositoryResourceRepresentationResponse {
  resources: getRepositoryResourceRepresentationResponse['resource'][];
  _links: Links;
}