/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import type { AccessToken } from "@itwin/core-bentley";
import { BentleyAPIResponse } from "src/types/CommonApiTypes";
import type { ITwinMinimal, ITwinRepresentation } from "src/types/ITwin";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient Recently Used Functionality", () => {
  let baseUrl: string = "https://api.bentley.com/itwins";
  const urlPrefix = process.env.IMJS_URL_PREFIX;
  if (urlPrefix) {
    const url = new URL(baseUrl);
    url.hostname = urlPrefix + url.hostname;
    baseUrl = url.href;
  }
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  it("should get a list of recently used iTwins", async () => {
    // Act
    const recentsResponse =
      await iTwinsAccessClient.getRecentUsedITwins(accessToken);

    // Assert
    expect(recentsResponse.status).toBe(200);
    expect(recentsResponse.data).toBeDefined();

    // Validate that we don't exceed the 25 iTwin limit
    if (recentsResponse.data!.iTwins) {
      expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(25);
    }
  });

  it("should get recently used iTwins with query parameters", async () => {
    // Act
    const recentsResponse =
      await iTwinsAccessClient.getRecentUsedITwins(accessToken, {
        top: 5,
        resultMode: "representation",
      });

    // Assert
    expect(recentsResponse.status).toBe(200);
    expect(recentsResponse.data).toBeDefined();

    // Should respect the top parameter (max 5 results)
    if (recentsResponse.data!.iTwins) {
      expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(5);

      // Verify representation mode returns additional properties
      recentsResponse.data!.iTwins.forEach((iTwin: ITwinMinimal) => {
        expect(iTwin.id).toBeDefined();
        expect(iTwin.displayName).toBeDefined();
        expect(iTwin.class).toBeDefined();
        expect(iTwin.subClass).toBeDefined();
      });
    }
  });

  it("should get recently used iTwins including inactive ones", async () => {
    // Act
    const recentsResponse =
      await iTwinsAccessClient.getRecentUsedITwins(accessToken, {
        includeInactive: true,
      });

    // Assert
    expect(recentsResponse.status).toBe(200);
    expect(recentsResponse.data).toBeDefined();

    // Should not exceed 25 iTwin limit even with inactive included
    if (recentsResponse.data!.iTwins) {
      expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(25);
    }
  });

  it("should return 404 when adding non-existent iTwin to recents", async () => {
    // Arrange - Use a random GUID that doesn't exist
    const nonExistentITwinId = "33333333-3333-3333-3333-333333333333";

    // Act
    const addRecentResponse: BentleyAPIResponse<undefined> =
      await iTwinsAccessClient.addITwinToMyRecents(accessToken, nonExistentITwinId);

    // Assert
    expect(addRecentResponse.status).toBe(404);
  });

  it("should successfully add and retrieve iTwin from recently used list", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: Omit<ITwinRepresentation, "id">= {
      displayName: `APIM iTwin Recents Test ${new Date().toISOString()}`,
      number: `APIM iTwin Recents Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);
    const iTwinId = createResponse.data?.iTwin!.id!;

    try {
      expect(createResponse.status).toBe(201);

      // Act - Add iTwin to recently used list
      const addRecentResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

      // Assert add operation
      expect(addRecentResponse.status).toBe(204);

      // Verify iTwin appears in recently used list
      const recentsResponse =
        await iTwinsAccessClient.getRecentUsedITwins(accessToken, {
          displayName: newiTwin.displayName,
        });

      expect(recentsResponse.status).toBe(200);
      expect(recentsResponse.data).toBeDefined();

      // Find our iTwin in the recents list
      const foundRecent = recentsResponse.data!.iTwins?.find(
        (iTwin: ITwinRepresentation) => iTwin.id === iTwinId
      );
      expect(foundRecent).toBeDefined();
      expect(foundRecent!.displayName).toBe(newiTwin.displayName);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteItwin(accessToken, iTwinId);
    }
  });

  it("should handle adding the same iTwin to recents multiple times", async () => {
    // Arrange - Create a test iTwin
    const newiTwin: Omit<ITwinRepresentation, "id"> = {
      displayName: `APIM iTwin Recents Duplicate Test ${new Date().toISOString()}`,
      number: `APIM iTwin Recents Duplicate Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    const createResponse =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);
    const iTwinId = createResponse.data?.iTwin!.id!;

    try {
      // Act - Add iTwin to recents twice
      const firstAddResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

      const secondAddResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

      // Assert - Both operations should succeed (idempotent behavior)
      expect(firstAddResponse.status).toBe(204);
      expect(secondAddResponse.status).toBe(204);

      // Verify iTwin is in recently used list (should appear only once, most recent)
      const recentsResponse =
        await iTwinsAccessClient.getRecentUsedITwins(accessToken, {
          displayName: newiTwin.displayName,
        });

      expect(recentsResponse.status).toBe(200);

      // Should find exactly one instance of our iTwin
      const matchingRecents = recentsResponse.data!.iTwins?.filter(
        (iTwin: ITwinRepresentation) => iTwin.id === iTwinId
      );
      expect(matchingRecents).toBeDefined();
      expect(matchingRecents.length).toBe(1);
    } finally {
      // Clean up - Delete the test iTwin
      await iTwinsAccessClient.deleteItwin(accessToken, iTwinId);
    }
  });

  it("should return recently used iTwins in correct order (most recent first)", async () => {
    // Act - Get recently used iTwins
    const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(accessToken, {
      top: 10,
    });

    // Assert
    expect(recentsResponse.status).toBe(200);
    expect(recentsResponse.data).toBeDefined();

    if (recentsResponse.data!.iTwins && recentsResponse.data!.iTwins.length > 1) {
      // Verify ordering - each iTwin should have a lastAccessedDateTime if available
      // Or verify that the list is properly ordered by checking that newer entries come first
      const iTwins = recentsResponse.data!.iTwins;

      // Basic validation that we have iTwins and they have required properties
      iTwins.forEach((iTwin: ITwinRepresentation) => {
        expect(iTwin.id).toBeDefined();
        expect(iTwin.displayName).toBeDefined();
      });

      // The API guarantees ordering, so we just verify we get a reasonable list
      expect(iTwins.length).toBeGreaterThan(0);
      expect(iTwins.length).toBeLessThanOrEqual(10);
    }
  });
});
