/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/**
 * Represents an iTwin image with different size variants
 */
export interface ITwinImage {
  /** Unique identifier for the image */
  id: string;
  /** Filename for the small version of the image */
  smallImageName: string;
  /** URL to access the small version of the image */
  smallImageUrl: string;
  /** Filename for the large version of the image */
  largeImageName: string;
  /** URL to access the large version of the image */
  largeImageUrl: string;
}

/**
 * Response interface for iTwin image operations
 */
export interface ITwinImageResponse {
  image: ITwinImage;
}