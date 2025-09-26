/**
 * Base iTwin interface containing core properties that are always available
 * in standard API responses.
 */
export interface ITwin {
  /** Unique identifier for the iTwin */
  id?: string;
  /** Main classification of the iTwin */
  class?: ITwinClass;
  /** Sub-classification providing more specific categorization */
  subClass?: ITwinSubClass;
  /** Type of the iTwin */
  type?: string;
  /** Human-readable name for the iTwin */
  displayName?: string;
  /** Numeric identifier for the iTwin */
  // eslint-disable-next-line id-denylist
  number?: string;
  /** Geographic location of the data center hosting this iTwin */
  dataCenterLocation?: string;
  /** Current status of the iTwin */
  status?: ITwinStatus;
  /** Identifier of the parent iTwin in hierarchical relationships */
  parentId?: string;
  /** Account identifier associated with this iTwin */
  iTwinAccountId?: string;
  /** IANA timezone identifier for the iTwin's geographic location */
  ianaTimeZone?: string;
  /** Name of the image file associated with this iTwin */
  imageName?: string;
  /** Base64 encoded image data or URL for the iTwin's visual representation */
  image?: string;
  /** ISO 8601 timestamp when the iTwin was created */
  createdDateTime?: string;
  /** Identifier of the user who created this iTwin */
  createdBy?: string;
  /** Geographic location description of the iTwin */
  geographicLocation?: string;
  /** Latitude coordinate of the iTwin's geographic location */
  latitude?: number;
  /** Longitude coordinate of the iTwin's geographic location */
  longitude?: number;
  /** ISO 8601 timestamp when the iTwin was last modified */
  lastModifiedDateTime?: string;
  /** Identifier of the user who last modified this iTwin */
  lastModifiedBy?: string;
}

/**
 * iTwin status types that indicate the current operational state
 * of the digital twin.
 *
 * @public
 */
export type ITwinStatus =
  | "Trial"
  | "Active"
  | "Inactive";

/**
 * iTwin sub-classification types that provide specific categorization
 * for different types of digital twins and organizational structures.
 *
 * @public
 */
export type ITwinSubClass =
  | "Account"
  | "Asset"
  | "Project"
  | "Portfolio"
  | "Program"
  | "WorkPackage";

/**
 * iTwin main classification types that define the primary category
 * of the digital twin within the organizational hierarchy.
 *
 * @public
 */
export type ITwinClass =
  | "Thing"
  | "Endeavor";
