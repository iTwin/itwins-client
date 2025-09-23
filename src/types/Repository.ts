/** The simplified Repository object
 * @beta
 */
export interface Repository {
  id?: string;
  class: RepositoryClass;
  subClass: RepositorySubClass;
  uri: string;
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
  | "GeographicInformationSystem";

/**
 * Repository sub-classification types for specific data source implementations
 * @beta
 */
export type RepositorySubClass =
  | "WebMapService"
  | "WebMapTileService"
  | "ArcGIS"
  | "UrlTemplate";