/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import type { BentleyAPIResponse } from "../../types/CommonApiTypes";
import type { ItwinCreate } from "../../types/ITwin";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient - Favorites Integration", () => {
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  describe("getFavoritesITwins", () => {
    describe("Success Cases", () => {
      it("should get a list of favorited project iTwins", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM Project iTwin Test ${new Date().toISOString()}`,
          number: `APIM Project iTwin Number ${new Date().toISOString()}`,
          type: "Portfolio",
          subClass: "Project",
          class: "Endeavor",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
            {
              subClass: "Project",
            },
          );

          expect(iTwinsResponse.status).toBe(200);
          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data?.iTwins!.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
          expect(createdTwin?.class).toBe("Endeavor");
          expect(createdTwin?.subClass).toBe("Project");
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });

      it("should get a list of favorited asset iTwins", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM Asset iTwin Test ${new Date().toISOString()}`,
          number: `APIM Asset iTwin Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
            {
              subClass: "Asset",
            },
          );

          expect(iTwinsResponse.status).toBe(200);
          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data!.iTwins.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
          expect(createdTwin?.class).toBe("Thing");
          expect(createdTwin?.subClass).toBe("Asset");
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });

      it("should get a list of favorited project iTwins without subClass query", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin No SubClass Test ${new Date().toISOString()}`,
          number: `APIM iTwin No SubClass Number ${new Date().toISOString()}`,
          type: "Portfolio",
          subClass: "Project",
          class: "Endeavor",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
          );

          expect(iTwinsResponse.status).toBe(200);
          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data?.iTwins!.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });
    });

    describe("Result Modes", () => {
      it("should get more properties of favorited project iTwins in representation result mode", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM Representation Mode Test ${new Date().toISOString()}`,
          number: `APIM Representation Mode Number ${new Date().toISOString()}`,
          type: "Portfolio",
          subClass: "Project",
          class: "Endeavor",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
            {
              subClass: "Project",
              resultMode: "representation",
            },
          );

          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data!.iTwins.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
          expect(createdTwin?.parentId).toBeTypeOf("string");
          expect(createdTwin?.iTwinAccountId).toBeTypeOf("string");
          expect(createdTwin?.createdDateTime).toBeTypeOf("string");
          expect(createdTwin?.createdBy).toBeTypeOf("string");
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });
    });

    describe("Query Scopes", () => {
      it("should get a list of favorited project iTwins using all query scope", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM All Query Scope Test ${new Date().toISOString()}`,
          number: `APIM All Query Scope Number ${new Date().toISOString()}`,
          type: "Portfolio",
          subClass: "Project",
          class: "Endeavor",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
            {
              queryScope: "all",
              subClass: "Project",
            },
          );

          expect(iTwinsResponse.status).toBe(200);
          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data!.iTwins.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
          expect(createdTwin?.class).toBe("Endeavor");
          expect(createdTwin?.subClass).toBe("Project");
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });

      it("should get a list of favorited project iTwins using all query scope (second test)", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM All Query Scope Test 2 ${new Date().toISOString()}`,
          number: `APIM All Query Scope Number 2 ${new Date().toISOString()}`,
          type: "Portfolio",
          subClass: "Project",
          class: "Endeavor",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin?.id;

        try {
          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.iTwin?.displayName).toBe(
            newiTwin.displayName,
          );
          expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
          expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

          const addFavoriteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

          expect(addFavoriteResponse.status).toBe(204);

          const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
            accessToken,
            {
              queryScope: "all",
              subClass: "Project",
            },
          );

          expect(iTwinsResponse.status).toBe(200);
          expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
          const createdTwin = iTwinsResponse.data?.iTwins!.find(
            (twin) => twin.id === iTwinId,
          );
          expect(createdTwin).toBeDefined();
          expect(createdTwin?.class).toBe("Endeavor");
          expect(createdTwin?.subClass).toBe("Project");
        } finally {
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId!,
          );
          const deleteResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);
          expect(deleteResponse.status).toBe(204);
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 422 when top query option exceeds maximum allowed value", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            top: 1001,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });

      it("should return 422 when top query option is negative", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            top: -1,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });

      it("should return 422 when skip query option is negative", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            skip: -1,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });

      it("should return 422 when invalid subClass is provided", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            subClass: "InvalidSubClass" as any,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });

      it("should return 422 when invalid status is provided", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            status: "InvalidStatus" as any,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });

      it("should return 422 when includeInactive is used with status parameter", async () => {
        const iTwinsResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            status: "Active",
            includeInactive: true,
          },
        );

        expect(iTwinsResponse.status).toBe(422);
      });
    });
  });

  describe("addITwinToFavorites", () => {
    describe("Error Responses", () => {
      it("should return 404 when trying to add non-existent iTwin to favorites", async () => {
        const nonExistentITwinId = "12345678-1234-1234-1234-123456789abc";

        const addFavoriteResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.addITwinToFavorites(
            accessToken,
            nonExistentITwinId,
          );

        expect(addFavoriteResponse.status).toBe(404);
      });
    });
  });

  describe("removeITwinFromFavorites", () => {
    describe("Error Responses", () => {
      it("should return 404 when trying to remove non-existent iTwin from favorites", async () => {
        const nonExistentITwinId = "87654321-4321-4321-4321-ba9876543210";

        const removeFavoriteResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            nonExistentITwinId,
          );

        expect(removeFavoriteResponse.status).toBe(404);
      });
    });
  });

  describe("CRUD Lifecycle", () => {
    it("should create, favorite, and delete an iTwin", async () => {
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

      const createResponse = await iTwinsAccessClient.createITwin(
        accessToken,
        newiTwin,
      );
      const iTwinId = createResponse.data?.iTwin?.id;

      try {
        expect(createResponse.status).toBe(201);
        expect(createResponse.data?.iTwin?.displayName).toBe(
          newiTwin.displayName,
        );
        expect(createResponse.data?.iTwin?.class).toBe(newiTwin.class);
        expect(createResponse.data?.iTwin?.subClass).toBe(newiTwin.subClass);

        const addFavoriteResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.addITwinToFavorites(accessToken, iTwinId);

        expect(addFavoriteResponse.status).toBe(204);
        expect(addFavoriteResponse.data).toBeUndefined();

        let getFavoritesResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            displayName: newiTwin.displayName,
          },
        );
        expect(getFavoritesResponse.status).toBe(200);
        expect(getFavoritesResponse.data?.iTwins).toHaveLength(1);
        expect(getFavoritesResponse.data?.iTwins![0].id).toBe(iTwinId);

        const removeFavoriteResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.removeITwinFromFavorites(
            accessToken,
            iTwinId,
          );

        expect(removeFavoriteResponse.status).toBe(204);
        expect(removeFavoriteResponse.data).toBeUndefined();

        getFavoritesResponse = await iTwinsAccessClient.getFavoritesITwins(
          accessToken,
          {
            displayName: newiTwin.displayName,
          },
        );

        expect(getFavoritesResponse.status).toBe(200);
        expect(getFavoritesResponse.data?.iTwins).toHaveLength(0);
      } finally {
        const deleteResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.deleteItwin(accessToken, iTwinId!);

        expect(deleteResponse.status).toBe(204);
        expect(deleteResponse.data).toBeUndefined();
      }
    });
  });
});
