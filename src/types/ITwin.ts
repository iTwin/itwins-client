/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { Links } from "./links";

/**
 * Minimal iTwin interface containing only minimal properties.
 */
export interface ITwinMinimal {
  /** Unique identifier for the iTwin */
  id: string;
  /** Main classification of the iTwin */
  class: ITwinClass;
  /** Sub-classification providing more specific categorization */
  subClass: ITwinSubClass;
  /** Type of the iTwin */
  type: string;
  /** Human-readable name for the iTwin */
  displayName: string;
  /** Numeric identifier for the iTwin */
  // eslint-disable-next-line id-denylist
  number?: string;
  /** Account identifier associated with this iTwin */
  iTwinAccountId?: string;
}

/**
 * Complete iTwin interface extending minimal with full representation properties.
 */
export interface ITwinRepresentation extends ITwinMinimal {
  /** Geographic location of the data center hosting this iTwin */
  dataCenterLocation?: string;
  /** Current status of the iTwin */
  status?: ITwinStatus;
  /** Identifier of the parent iTwin in hierarchical relationships */
  parentId?: string;
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
 */
export type ITwinStatus = "Trial" | "Active" | "Inactive";

/**
 * iTwin sub-classification types that provide specific categorization
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
 */
export type ITwinClass = "Thing" | "Endeavor";

/**
 * Response interface for multiple iTwins in minimal mode.
 */
export interface MultiITwinMinimalResponse {
  /** Array of iTwin objects */
  iTwins: ITwinMinimal[];
  /** Navigation links for pagination and related resources */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: Links;
}

/**
 * Response interface for multiple iTwins in representation mode.
 */
export interface MultiITwinRepresentationResponse {
  /** Array of iTwin objects */
  iTwins: ITwinRepresentation[];
  /** Navigation links for pagination and related resources */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: Links;
}

/**
 * Response interface for single iTwin operations in representation mode.
 */
export interface ITwinRepresentationResponse {
  /** The complete iTwin object with all properties */
  iTwin: ITwinRepresentation;
}

/**
 * Response interface for single iTwin operations in minimal mode.
 */
export interface ITwinMinimalResponse {
  /** The minimal iTwin object with essential properties */
  iTwin: ITwinMinimal;
}

/**
 * Type for creating new iTwins.
 */
export type ItwinCreate =
   Omit<
    ITwinRepresentation,
    "id" | "createdDateTime" | "lastModifiedDateTime" | "iTwinAccountId" | "createdBy" | "image" | "imageName" | "lastModifiedBy"
  >

/**
 * Type for updating existing iTwins.
 */
export type ItwinUpdate = Partial<ItwinCreate>