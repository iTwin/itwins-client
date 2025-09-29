/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { APIResponse } from "../../types/CommonApiTypes";
import type { ITwin } from "../../types/ITwin";
import type { ITwinImageResponse } from "../../types/ITwinImage";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsAccessClient } from "../../iTwinsClient";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient Image Functionality", () => {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 60000);

  it("should return 404 when trying to upload image to non-existent iTwin", async () => {
    // Arrange - Use a random GUID that doesn't exist
    const nonExistentITwinId = "12345678-1234-1234-1234-123456789abc";

    // Load test JPEG image
    const imagePath = resolve(__dirname, "../testImage/imageJpg.jpg");
    const imageBuffer = readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

    // Act
    const uploadResponse: APIResponse<ITwinImageResponse> =
      await iTwinsAccessClient.uploadITwinImage(
        accessToken,
        nonExistentITwinId,
        imageBlob,
        "image/jpeg"
      );

    // Assert
    expect(uploadResponse.status).toBe(404);
  });

  it("should return 422 when image file is too large (exceeds 5MB)", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Large Image Test ${new Date().toISOString()}`,
      number: `APIM iTwin Large Image Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Create a large image blob (simulate > 5MB)
      // Create a buffer larger than 5MB (5 * 1024 * 1024 bytes)
      const largeSizeBytes = 6 * 1024 * 1024; // 6MB
      const largeImageBuffer = new Uint8Array(largeSizeBytes);

      // Fill with minimal JPEG header at the beginning
      largeImageBuffer[0] = 0xff;
      largeImageBuffer[1] = 0xd8;
      largeImageBuffer[2] = 0xff;
      largeImageBuffer[3] = 0xe0;

      const largeImageBlob = new Blob([largeImageBuffer], {
        type: "image/jpeg",
      });

      // Act
      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          largeImageBlob,
          "image/jpeg"
        );

      // Assert
      expect(uploadResponse.status).toBe(413);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should return 422 when image has invalid aspect ratio (width/height > 5:1)", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Aspect Ratio Test ${new Date().toISOString()}`,
      number: `APIM iTwin Aspect Ratio Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Create a PNG with invalid aspect ratio (6:1 ratio, which exceeds 5:1 limit)
      // This creates a minimal PNG with dimensions that would fail validation
      const invalidAspectRatioPng = new Uint8Array([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a, // PNG signature
        0x00,
        0x00,
        0x00,
        0x0d, // IHDR chunk length
        0x49,
        0x48,
        0x44,
        0x52, // "IHDR"
        0x00,
        0x00,
        0x02,
        0x58, // Width: 600 pixels (0x0258)
        0x00,
        0x00,
        0x00,
        0x64, // Height: 100 pixels (0x0064) - 6:1 ratio
        0x08,
        0x02,
        0x00,
        0x00,
        0x00, // Bit depth, color type, etc.
        0x4b,
        0x6d,
        0x29,
        0xdc, // IHDR CRC (calculated for this header)
        0x00,
        0x00,
        0x00,
        0x00, // IEND chunk length
        0x49,
        0x45,
        0x4e,
        0x44, // "IEND"
        0xae,
        0x42,
        0x60,
        0x82, // IEND CRC
      ]);

      const invalidAspectRatioBlob = new Blob([invalidAspectRatioPng], {
        type: "image/png",
      });

      // Act
      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          invalidAspectRatioBlob,
          "image/png"
        );

      // Assert
      expect(uploadResponse.status).toBe(422);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should successfully upload and process a valid JPEG image", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Image Upload Test ${new Date().toISOString()}`,
      number: `APIM iTwin Image Upload Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Load test JPEG image
      const imagePath = resolve(__dirname, "../testImage/imageJpg.jpg");
      const imageBuffer = readFileSync(imagePath);
      const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

      // Act
      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          imageBlob,
          "image/jpeg"
        );

      // Assert
      expect(uploadResponse.status).toBe(201);
      expect(uploadResponse.data).toBeDefined();
      expect(uploadResponse.data!.image).toBeDefined();
      expect(uploadResponse.data!.image.id).toBeDefined();
      expect(uploadResponse.data!.image.smallImageName).toBeDefined();
      expect(uploadResponse.data!.image.smallImageUrl).toBeDefined();
      expect(uploadResponse.data!.image.largeImageName).toBeDefined();
      expect(uploadResponse.data!.image.largeImageUrl).toBeDefined();

      // Validate image URLs are accessible
      expect(uploadResponse.data!.image.smallImageUrl).toMatch(
        /^https?:\/\/.+/
      );
      expect(uploadResponse.data!.image.largeImageUrl).toMatch(
        /^https?:\/\/.+/
      );
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should successfully upload and process a valid PNG image", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: ITwin = {
      displayName: `APIM iTwin PNG Upload Test ${new Date().toISOString()}`,
      number: `APIM iTwin PNG Upload Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Load test PNG image
      const imagePath = resolve(__dirname, "../testImage/imagePng.png");
      const imageBuffer = readFileSync(imagePath);
      const imageBlob = new Blob([imageBuffer], { type: "image/png" });

      // Act
      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          imageBlob,
          "image/png"
        );

      // Assert
      expect(uploadResponse.status).toBe(201);
      expect(uploadResponse.data).toBeDefined();
      expect(uploadResponse.data!.image).toBeDefined();
      expect(uploadResponse.data!.image.id).toBeDefined();
      expect(uploadResponse.data!.image.smallImageName).toBeDefined();
      expect(uploadResponse.data!.image.smallImageUrl).toBeDefined();
      expect(uploadResponse.data!.image.largeImageName).toBeDefined();
      expect(uploadResponse.data!.image.largeImageUrl).toBeDefined();

      // Validate image URLs are accessible and contain expected content
      expect(uploadResponse.data!.image.smallImageUrl).toMatch(
        /^https?:\/\/.+/
      );
      expect(uploadResponse.data!.image.largeImageUrl).toMatch(
        /^https?:\/\/.+/
      );
      expect(uploadResponse.data!.image.smallImageName).toContain(
        uploadResponse.data!.image.id
      );
      expect(uploadResponse.data!.image.largeImageName).toContain(
        uploadResponse.data!.image.id
      );
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  // Add these tests to your existing ItwinClientImage.test.ts file

  it("should successfully retrieve an existing iTwin image", async () => {
    // Arrange - Create a test iTwin and upload an image first
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Get Image Test ${new Date().toISOString()}`,
      number: `APIM iTwin Get Image Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // First upload an image
      const imagePath = resolve(__dirname, "../testImage/imageJpg.jpg");
      const imageBuffer = readFileSync(imagePath);
      const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          imageBlob,
          "image/jpeg"
        );

      expect(uploadResponse.status).toBe(201);

      // Act - Get the uploaded image
      const getResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.getITwinImage(accessToken, iTwinId);

      // Assert
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toBeDefined();
      expect(getResponse.data!.image).toBeDefined();
      expect(getResponse.data!.image.id).toBeDefined();
      expect(getResponse.data!.image.smallImageName).toBeDefined();
      expect(getResponse.data!.image.smallImageUrl).toBeDefined();
      expect(getResponse.data!.image.largeImageName).toBeDefined();
      expect(getResponse.data!.image.largeImageUrl).toBeDefined();

      // Validate URLs are properly formatted
      expect(getResponse.data!.image.smallImageUrl).toMatch(/^https?:\/\/.+/);
      expect(getResponse.data!.image.largeImageUrl).toMatch(/^https?:\/\/.+/);

      // Validate that the retrieved image data matches the uploaded image
      expect(getResponse.data!.image.id).toBe(uploadResponse.data!.image.id);
      expect(getResponse.data!.image.smallImageName).toBe(
        uploadResponse.data!.image.smallImageName
      );
      expect(getResponse.data!.image.largeImageName).toBe(
        uploadResponse.data!.image.largeImageName
      );
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should return 404 when trying to get image from non-existent iTwin", async () => {
    // Arrange - Use a random GUID that doesn't exist
    const nonExistentITwinId = "87654321-4321-4321-4321-210987654321";

    // Act
    const getResponse: APIResponse<ITwinImageResponse> =
      await iTwinsAccessClient.getITwinImage(accessToken, nonExistentITwinId);

    // Assert
    expect(getResponse.status).toBe(404);
  });

  it("should return 404 when trying to get image from iTwin that has no image", async () => {
    // Arrange - Create a test iTwin without uploading an image
    const newiTwin: ITwin = {
      displayName: `APIM iTwin No Image Test ${new Date().toISOString()}`,
      number: `APIM iTwin No Image Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Act - Try to get image from iTwin that has no image
      const getResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.getITwinImage(accessToken, iTwinId);

      // Assert
      expect(getResponse.status).toBe(404);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should successfully delete an existing iTwin image", async () => {
    // Arrange - Create a test iTwin and upload an image first
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Delete Image Test ${new Date().toISOString()}`,
      number: `APIM iTwin Delete Image Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // First upload an image
      const imagePath = resolve(__dirname, "../testImage/imageJpg.jpg");
      const imageBuffer = readFileSync(imagePath);
      const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

      const uploadResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.uploadITwinImage(
          accessToken,
          iTwinId,
          imageBlob,
          "image/jpeg"
        );

      expect(uploadResponse.status).toBe(201);

      // Verify image exists
      const getResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.getITwinImage(accessToken, iTwinId);
      expect(getResponse.status).toBe(200);

      // Act - Delete the uploaded image
      const deleteResponse: APIResponse<undefined> =
        await iTwinsAccessClient.deleteITwinImage(accessToken, iTwinId);

      // Assert
      expect(deleteResponse.status).toBe(204);

      // Verify image is actually deleted by trying to get it
      const getAfterDeleteResponse: APIResponse<ITwinImageResponse> =
        await iTwinsAccessClient.getITwinImage(accessToken, iTwinId);
      expect(getAfterDeleteResponse.status).toBe(404);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });

  it("should return 404 when trying to delete image from non-existent iTwin", async () => {
    // Arrange - Use a random GUID that doesn't exist
    const nonExistentITwinId = "11111111-1111-1111-1111-111111111111";

    // Act
    const deleteResponse: APIResponse<undefined> =
      await iTwinsAccessClient.deleteITwinImage(
        accessToken,
        nonExistentITwinId
      );

    // Assert
    expect(deleteResponse.status).toBe(404);
  });

  it("should return 404 when trying to delete image from iTwin that has no image", async () => {
    // Arrange - Create a test iTwin without uploading an image
    const newiTwin: ITwin = {
      displayName: `APIM iTwin No Image Delete Test ${new Date().toISOString()}`,
      number: `APIM iTwin No Image Delete Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse: APIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    try {
      // Act - Try to delete image from iTwin that has no image
      const deleteResponse: APIResponse<undefined> =
        await iTwinsAccessClient.deleteITwinImage(accessToken, iTwinId);

      // Assert
      expect(deleteResponse.status).toBe(404);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
    }
  });
});
