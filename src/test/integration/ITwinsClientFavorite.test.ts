/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import type { BentleyAPIResponse } from "../../types/CommonApiTypes";
import type { ItwinCreate, ITwinRepresentation } from "../../types/ITwin";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient Favorites Functionality", () => {
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  it("should get a list of favorited project iTwins", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        subClass: "Project",
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    iTwinsResponse.data?.iTwins!.forEach((actualiTwin: ITwinRepresentation) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a list of favorited asset iTwins", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        subClass: "Asset",
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    iTwinsResponse.data!.iTwins.forEach((actualiTwin: ITwinRepresentation) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a list of favorited project iTwins without subClass query", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
  });

  it("should get more properties of favorited project iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        subClass: "Project",
        resultMode: "representation",
      });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);

    iTwinsResponse.data!.iTwins.forEach((actualiTwin: ITwinRepresentation) => {
      expect(actualiTwin.parentId).toBeTypeOf("string");
      expect(actualiTwin.iTwinAccountId).toBeTypeOf("string");
      expect(actualiTwin.createdDateTime).toBeTypeOf("string");
      expect(actualiTwin.createdBy).toBeTypeOf("string");
    });
  });

  it("should get a list of favorited project iTwins using all query scope", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        queryScope: "all",
        subClass: "Project",
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    iTwinsResponse.data!.iTwins.forEach((actualiTwin: ITwinRepresentation) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a list of favorited project iTwins using all query scope", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        queryScope: "all",
        subClass: "Project",
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    iTwinsResponse.data?.iTwins!.forEach((actualiTwin: ITwinRepresentation) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should return 422 when top query option exceeds maximum allowed value", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        top: 1001, // Exceeds maximum of 1000
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 422 when top query option is negative", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        top: -1, // Negative value not allowed
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 422 when skip query option is negative", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        skip: -1, // Negative value not allowed
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 422 when invalid subClass is provided", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        subClass: "InvalidSubClass" as any, // Invalid subClass value
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 422 when invalid status is provided", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        status: "InvalidStatus" as any, // Invalid status value
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 422 when includeInactive is used with status parameter", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getFavoritesITwins(accessToken, {
        status: "Active",
        includeInactive: true, // Should not be used together with status
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
  });

  it("should return 404 when trying to add non-existent iTwin to favorites", async () => {
    // Arrange - Use a random UUID that doesn't exist
    const nonExistentITwinId = "12345678-1234-1234-1234-123456789abc";

    // Act
    const addFavoriteResponse: BentleyAPIResponse<undefined> =
      await iTwinsAccessClient.addITwinToFavorites(accessToken, nonExistentITwinId);

    // Assert
    expect(addFavoriteResponse.status).toBe(404);
  });

  it("should return 404 when trying to remove non-existent iTwin from favorites", async () => {
    // Arrange - Use a random UUID that doesn't exist
    const nonExistentITwinId = "87654321-4321-4321-4321-ba9876543210";

    // Act
    const removeFavoriteResponse: BentleyAPIResponse<undefined> =
      await iTwinsAccessClient.removeITwinFromFavorites(accessToken, nonExistentITwinId);

    // Assert
    expect(removeFavoriteResponse.status).toBe(404);
  });

  it("should create, favorite, and delete an iTwin", async () => {
    /* CREATE THE ITWIN */
    // Arrange
    const newiTwin: ItwinCreate = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    // Act
    const createResponse =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);
    const iTwinId = createResponse.data?.iTwin?.id;

    try {
      // Assert
      expect(createResponse.status).toBe(201);
      expect(createResponse.data?.iTwin?.displayName).toBe(newiTwin.displayName);
      expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
      expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

      /* ADD ITWIN TO FAVORITES */

      // Act add to favorites
      const addFavoriteResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

      // Assert
      expect(addFavoriteResponse.status).toBe(204);
      expect(addFavoriteResponse.data).toBeUndefined();

      /* VERIFY ITWIN IS IN FAVORITES */
      // Act
      let getFavoritesResponse =
        await iTwinsAccessClient.getFavoritesITwins(accessToken, {
          displayName: newiTwin.displayName,
        });
      // Assert
      expect(getFavoritesResponse.status).toBe(200);
      expect(getFavoritesResponse.data?.iTwins).toHaveLength(1);
      expect(getFavoritesResponse.data?.iTwins![0].id).toBe(iTwinId);

      /* DELETE ITWIN FROM FAVORITES */
      const removeFavoriteResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.removeITwinFromFavorites(accessToken, iTwinId);

      // Assert
      expect(removeFavoriteResponse.status).toBe(204);
      expect(removeFavoriteResponse.data).toBeUndefined();

      /* VERIFY ITWIN IS NOT IN FAVORITES */
      // Act
      getFavoritesResponse = await iTwinsAccessClient.getFavoritesITwins(
        accessToken,
        {
          displayName: newiTwin.displayName,
        }
      );

      // Assert
      expect(getFavoritesResponse.status).toBe(200);
      expect(getFavoritesResponse.data?.iTwins).toHaveLength(0);
    } finally {
      // Clean up - Delete the test iTwin
      const deleteResponse: BentleyAPIResponse<undefined> =
        await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);

      // Assert cleanup was successful
      expect(deleteResponse.status).toBe(204);
      expect(deleteResponse.data).toBeUndefined();
    }
  });
});
