/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { Links } from "./links";

/**
 * Repository object representing a service or data source that contains data for an iTwin.
 * A repository can be any external service like imagery providers, map services, or other data sources.
 * @beta
 */
export interface Repository {
  /** Unique identifier for the repository */
  id: string;
  /** Main classification of the repository */
  class: RepositoryClass;
  /** Sub-classification providing more specific categorization */
  subClass?: RepositorySubClass;
  /** Human-readable name for the repository */
  displayName: string;
  /** The URI or endpoint URL for accessing the repository data */
  uri: string;
  /** Authentication configuration for accessing the repository */
  authentication?: RepositoryAuthentication;
  /** Repository-specific options and configuration parameters */
  options?: RepositoryOptions;
  /** Optional capabilities supported by the repository */
  capabilities?: RepositoryCapabilities;
}

/**
 * Authentication configuration for repository access.
 * Supports multiple authentication mechanisms via discriminated union.
 * Use the 'type' field to determine which authentication method to use.
 * See GraphicsAuthentication for the same types used in graphics contexts.
 * @beta
 */
export type RepositoryAuthentication = GraphicsAuthentication;

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
 * Repository capabilities defining supported operations and available endpoints.
 * Indicates what additional functionality is available for this repository.
 * @beta
 */
export interface RepositoryCapabilities {
  /** Resource management capabilities, available for certain repository classes */
  resources?: {
    /** A uri containing the endpoint that will return the list of resources in the repository. */
    uri: string;
  };
  /** Graphics capabilities, available for repositories that support visualization content */
  graphics?: {
    /** A uri containing the endpoint that will return graphics metadata for repository resources. */
    uri: string;
  };
}

/**
 * Repository classification types for different data sources.
 * Includes all repository classes including auto generated classes.
 * @beta
 */
export type RepositoryClass =
  | "iModels"
  | "Storage"
  | "Forms"
  | "RealityData"
  | "GeographicInformationSystem"
  | "Construction"
  | "Subsurface"
  | "GeospatialFeatures"
  | "CesiumCuratedContent"
  | "SensorData"
  | "PdfPlansets"
  | "IndexedMedia";

/**
 * Repository sub-classification types for specific data source implementations.
 * Each subclass corresponds to specific imagery providers or data source types.
 * @beta
 */
export type RepositorySubClass =
  | "WebMapService"
  | "WebMapTileService"
  | "WebFeatureService"
  | "ArcGIS"
  | "UrlTemplate"
  | "OgcApiFeatures"
  | "EvoWorkspace"
  | "Performance";

/**
 * Repository classes that support creating new repositories.
 * @beta
 */
export type CreatableRepositoryClass = Extract<
  RepositoryClass,
  "GeographicInformationSystem" | "Construction" | "Subsurface"
>;

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
 * @beta
 */
export interface GetRepositoryResourceRepresentationResponse {
  /** The repository resource with detailed information including properties */
  resource: GetRepositoryResourceMinimalResponse["resource"] & {
    /** Additional properties providing detailed information about the resource */
    properties?: {
      /** Dynamic properties specific to the resource type */
      [key: string]: unknown;
    };
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

/**
 * Configuration interface for creating new repositories.
 * Extends the base Repository interface while restricting class and subClass to supported combinations
 * and omitting the id and classes that are auto-generated during creation.
 * @beta
 */
export interface NewRepositoryConfig
  extends Omit<Repository, "class" | "id" | "displayName" | "capabilities"> {
    displayName?: string;
    class: CreatableRepositoryClass;
  }

/**
 * Graphics content type specifying the format of visualization data.
 * @beta
 */
export type GraphicsContentType =
  | "3DTILES"
  | "GLTF"
  | "IMAGERY"
  | "TERRAIN"
  | "KML"
  | "CZML"
  | "GEOJSON"
  | "OAPIF+GEOJSON"
  | "POINT_CLOUD"
  | "MESH"
  | "VECTOR_TILES"
  | "WMS";

/**
 * This value determines how to process the authentication information returned from the API.
 * @beta
 */
export type ITwinRepositoryAuthenticationType =
  | "Header"
  | "QueryParameter"
  | "Basic";

/**
 * Contains the information needed to authenticate to the specified API using an api key.
 * @beta
 */
export interface ApiKeyAuthentication {
  /** Type of authentication mechanism */
  type: "Header" | "QueryParameter";
  /** The key to use for Header or QueryParameter auth types */
  key: string;
  /** The value to use for Header or QueryParameter auth types */
  value: string;
}

/**
 * Contains the information needed to authenticate to the specified API using Basic authentication.
 * @beta
 */
export interface BasicAuthentication {
  /** Type of authentication mechanism */
  type: "Basic";
  /** The username to use for Basic auth type */
  username: string;
  /** The password to use for Basic auth type */
  password: string;
}

/**
 * Authentication configuration for graphics resource access.
 * Discriminated union based on the authentication type.
 * @beta
 */
export type GraphicsAuthentication =
  | ApiKeyAuthentication
  | BasicAuthentication;

/**
 * Configuration options for CesiumJS provider integration.
 * @beta
 */
export interface GraphicsProviderOptions {
  /** The tiling scheme used (e.g., 'WebMercatorTilingScheme'). */
  tilingScheme: string;
  /** Geographic bounds as [west, south, east, north] in degrees */
  bounds: [number, number, number, number];
  /** Attribution or credit for the imagery provider */
  credit: string;
}

/**
 * Graphics provider configuration combining content type and options.
 * @beta
 */
export interface GraphicsProvider {
  /** The name of the provider. Currently only UrlTemplateImageryProvider is supported. More will be added as needed. */
  name: string;
  /** Additional options for the provider */
  options: GraphicsProviderOptions;
}

/**
 * Graphics resource metadata including URIs and authentication.
 * @beta
 */
export interface ResourceGraphics {
  type: GraphicsContentType;
  /** A uri containing the location of the graphics content. This value can be cached but be aware that it might change over time. Some might contain a SAS key that expires after some time. */
  uri: string;
  /** Some repositories require authentication. If authentication details are provided, inspect the authentication.type property to determine the required method. You may need to add an Api Key (header or query parameter) or use basic authentication. */
  authentication?: GraphicsAuthentication;
  /** Optional CesiumJS provider configuration */
  provider?: GraphicsProvider;
}

/**
 * Response interface for retrieving resource graphics metadata.
 * @beta
 */
export interface ResourceGraphicsResponse {
  /** Graphics resource metadata and access configuration */
  graphics: ResourceGraphics[];
}
