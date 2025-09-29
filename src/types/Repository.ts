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

/**
 * Response interface for creating a repository resource.
 * Contains the created resource with minimal information including ID, subClass, displayName, and class.
 * @beta
 */
export interface PostRepositoryResourceResponse {
  /** The created repository resource with basic information */
  resource: Pick<Repository, "id" | "subClass" | "displayName"> & {
    /** Repository class is always GeographicInformationSystem for resources */
    class: "GeographicInformationSystem";
  };
}

/**
 * Response interface for getting a repository resource in minimal mode.
 * Contains basic resource information without detailed properties.
 * @beta
 */
export interface GetRepositoryResourceMinimalResponse {
  /** The repository resource with minimal information */
  resource: Pick<Repository, "id" | "subClass" | "displayName"> & {
    /** Optional type identifier for the resource */
    type?: string;
    /** Repository class indicating the type of data source */
    class:
      | "GeographicInformationSystem"
      | "CesiumCuratedContent"
      | "GeospatialFeatures"
      | "RealityData"
      | "iModels";
    /** Optional capabilities supported by the resource */
    capabilities?: {
      /** Graphics-related capabilities */
      graphics: {
        /** URI for graphics access */
        uri: string;
      };
    };
  };
}

/**
 * Response interface for getting a repository resource in representation mode.
 * Extends the minimal response with additional detailed properties.
 * @beta
 */
export interface GetRepositoryResourceRepresentationResponse extends GetRepositoryResourceMinimalResponse {
  /** Additional properties providing detailed information about the resource */
  properties?: {
    /** Dynamic properties specific to the resource type */
    [key: string]: unknown;
  };
}

/**
 * Response interface for getting multiple repository resources in minimal mode.
 * Contains an array of resources with basic information and navigation links following HAL specification.
 * @beta
 */
export interface GetMultiRepositoryResourceMinimalResponse {
  /** Array of repository resources with minimal information */
  resources: GetRepositoryResourceMinimalResponse['resource'][];
  /** HAL specification links for navigation and pagination */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: Links;
}

/**
 * Response interface for getting multiple repository resources in representation mode.
 * Contains an array of resources with detailed information and navigation links following HAL specification.
 * @beta
 */
export interface GetMultiRepositoryResourceRepresentationResponse {
  /** Array of repository resources with detailed information */
  resources: GetRepositoryResourceRepresentationResponse['resource'][];
  /** HAL specification links for navigation and pagination */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: Links;
}