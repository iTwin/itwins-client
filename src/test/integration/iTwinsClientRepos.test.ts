/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import type { AccessToken } from "@itwin/core-bentley";
import type { ItwinCreate  } from "../../types/ITwin";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import { NewRepositoryConfig } from "../../types/Repository";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient - Repository Integration", () => {
  let accessToken: AccessToken;
  let iTwinsAccessClient: ITwinsClient;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
    iTwinsAccessClient = new ITwinsClient();
  });

  beforeEach(async () => {
    // Add small delay between tests to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe("deleteItwin", () => {
    describe("Error Responses", () => {
      it("should return 404 when deleting a non-existent iTwin", async () => {
        const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const deleteResponse = await iTwinsAccessClient.deleteItwin(
          accessToken,
          someRandomId
        );

        expect(deleteResponse.status).toBe(404);
        expect(deleteResponse.data).toBeUndefined();
        expect(deleteResponse.error).not.toBeUndefined();
        expect(deleteResponse.error!.code).toBe("iTwinNotFound");
      });
    });
  });

  describe("createRepository", () => {
    describe("Error Responses", () => {
      it("should return 404 when creating a repository for a non-existent iTwin", async () => {
        const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const newRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
        };

        const createResponse = await iTwinsAccessClient.createRepository(
          accessToken,
          someRandomId,
          newRepository
        );

        expect(createResponse.status).toBe(404);
        expect(createResponse.data).toBeUndefined();
        expect(createResponse.error).not.toBeUndefined();
        expect(createResponse.error!.code).toBe("iTwinNotFound");
      });

      it("should return 409 when creating a duplicate repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );

        const iTwinId = iTwinResponse.data!.iTwin.id!;

        const newRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            newRepository
          );
          const createResponse2 = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            newRepository
          );

          expect(createResponse.status).toBe(201);
          expect(createResponse.data?.repository!.class).toBe(newRepository.class);
          expect(createResponse.data?.repository!.subClass).toBe(
            newRepository.subClass
          );
          expect(createResponse.data?.repository!.uri).toBe(newRepository.uri);
          expect(createResponse2.status).toBe(409);
          expect(createResponse2.data).toBeUndefined();
          expect(createResponse2.error).not.toBeUndefined();
          expect(createResponse2.error!.code).toBe("iTwinRepositoryExists");
        } finally {
          const deleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(deleteResponse.status).toBe(204);
          expect(deleteResponse.data).toBeUndefined();
        }
      });

      it("should return 422 when creating a repository without the uri property", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );

        const iTwinId = iTwinResponse.data!.iTwin.id!;

        const newRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            newRepository
          );

          expect(createResponse.status).toBe(422);
          expect(createResponse.data).toBeUndefined();
          expect(createResponse.error).not.toBeUndefined();
          expect(createResponse.error!.code).toBe("InvalidiTwinsRequest");
          expect(createResponse.error!.details![0].code).toBe(
            "MissingRequiredProperty"
          );
          expect(createResponse.error!.details![0].target).toBe("uri");
        } finally {
          const deleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(deleteResponse.status).toBe(204);
          expect(deleteResponse.data).toBeUndefined();
        }
      });
    });
  });

  describe("deleteRepository", () => {
    describe("Error Responses", () => {
      it("should return 404 when deleting a non-existent repository", async () => {
        const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );

        const iTwinId = iTwinResponse.data!.iTwin.id!;

        try {
          const deleteResponse = await iTwinsAccessClient.deleteRepository(
            accessToken,
            iTwinId,
            someRandomId
          );

          expect(deleteResponse.status).toBe(404);
          expect(deleteResponse.data).toBeUndefined();
          expect(deleteResponse.error).not.toBeUndefined();
          expect(deleteResponse.error!.code).toBe("iTwinRepositoryNotFound");
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });
  });

  describe("CRUD Lifecycle", () => {
    it("should create and delete an iTwin Repository", async () => {
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
      const iTwinResponse = await iTwinsAccessClient.createITwin(
        accessToken,
        newiTwin
      );

      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
      };

      try {
        const createResponse = await iTwinsAccessClient.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );

        expect(createResponse.status).toBe(201);
        expect(createResponse.data?.repository!.class).toBe(newRepository.class);
        expect(createResponse.data?.repository!.subClass).toBe(
          newRepository.subClass
        );
        expect(createResponse.data?.repository!.uri).toBe(newRepository.uri);

        const repositoryDeleteResponse =
          await iTwinsAccessClient.deleteRepository(
            accessToken,
            iTwinId,
            createResponse.data?.repository!.id!
          );

        expect(repositoryDeleteResponse.status).toBe(204);
        expect(repositoryDeleteResponse.data).toBeUndefined();
      } finally {
        const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
          accessToken,
          iTwinId
        );
        expect(iTwinDeleteResponse.status).toBe(204);
        expect(iTwinDeleteResponse.data).toBeUndefined();
      }
    });
  });

  describe("getRepositories", () => {
    describe("Error Responses", () => {
      it("should return 404 when getting repositories from a non-existent iTwin", async () => {
        const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const getResponse = await iTwinsAccessClient.getRepositories(
          accessToken,
          someRandomId
        );

        expect(getResponse.status).toBe(404);
        expect(getResponse.data).toBeUndefined();
        expect(getResponse.error).not.toBeUndefined();
        expect(getResponse.error!.code).toBe("iTwinNotFound");
      });
    });

    describe("Success Cases", () => {
      it("should return only cesium content for a new iTwin", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          class: "Endeavor",
          subClass: "WorkPackage",
          dataCenterLocation: "East US",
          status: "Inactive",
          type: "type",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        try {
          const getResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId
          );

          expect(getResponse.status).toBe(200);
          expect(getResponse.data?.repositories).toBeDefined();
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Filtering", () => {
      it("should filter repositories by class", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            gisRepository
          );
          expect(createResponse.status).toBe(201);

          const getAllResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId
          );

          expect(getAllResponse.status).toBe(200);
          expect(getAllResponse.data?.repositories).toBeDefined();
          expect(getAllResponse.data!.repositories).toHaveLength(2);
          expect(getAllResponse.data!.repositories[1].class).toBe(
            "GeographicInformationSystem"
          );
          expect(getAllResponse.data!.repositories[1].subClass).toBe(
            "WebMapService"
          );
          expect(getAllResponse.data!.repositories[1].uri).toBe(gisRepository.uri);

          const getFilteredResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            { class: "GeographicInformationSystem" }
          );

          expect(getFilteredResponse.status).toBe(200);
          expect(getFilteredResponse.data?.repositories).toBeDefined();
          expect(getFilteredResponse.data!.repositories).toHaveLength(1);
          expect(getFilteredResponse.data!.repositories[0].class).toBe(
            "GeographicInformationSystem"
          );

          const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            { class: "Storage" }
          );

          expect(getEmptyFilterResponse.status).toBe(200);
          expect(getEmptyFilterResponse.data?.repositories).toBeDefined();
          expect(getEmptyFilterResponse.data!.repositories).toHaveLength(0);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              createResponse.data?.repository!.id!
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should filter repositories by subClass", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        const wmsRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            wmsRepository
          );
          expect(createResponse.status).toBe(201);

          const getFilteredResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            {
              class: "GeographicInformationSystem",
              subClass: "WebMapService",
            }
          );

          expect(getFilteredResponse.status).toBe(200);
          expect(getFilteredResponse.data?.repositories).toBeDefined();
          expect(getFilteredResponse.data!.repositories).toHaveLength(1);
          expect(getFilteredResponse.data!.repositories[0].subClass).toBe(
            "WebMapService"
          );

          const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            { class: "GeographicInformationSystem", subClass: "ArcGIS" }
          );

          expect(getEmptyFilterResponse.status).toBe(200);
          expect(getEmptyFilterResponse.data?.repositories).toBeDefined();
          expect(getEmptyFilterResponse.data!.repositories).toHaveLength(0);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              createResponse.data?.repository!.id!
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should filter repositories by both class and subClass", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        const urlTemplateRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "UrlTemplate",
          uri: "http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            urlTemplateRepository
          );
          expect(createResponse.status).toBe(201);

          const getFilteredResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            {
              class: "GeographicInformationSystem",
              subClass: "UrlTemplate",
            }
          );

          expect(getFilteredResponse.status).toBe(200);
          expect(getFilteredResponse.data?.repositories).toBeDefined();
          expect(getFilteredResponse.data!.repositories).toHaveLength(1);
          expect(getFilteredResponse.data!.repositories[0].class).toBe(
            "GeographicInformationSystem"
          );
          expect(getFilteredResponse.data!.repositories[0].subClass).toBe(
            "UrlTemplate"
          );

          const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
            accessToken,
            iTwinId,
            {
              class: "Storage",
              subClass: "UrlTemplate",
            }
          );

          expect(getEmptyFilterResponse.status).toBe(422);
          expect(getEmptyFilterResponse.data).toBeUndefined();
          expect(getEmptyFilterResponse.error).toBeDefined();

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              createResponse.data?.repository!.id!
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });
  });

  describe("getRepository", () => {
    describe("Error Responses", () => {
      it("should return 404 when getting a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data!.iTwin.id!;
        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        try {
          const getResponse = await iTwinsAccessClient.getRepository(
            accessToken,
            iTwinId,
            someRandomRepositoryId
          );

          expect(getResponse.status).toBe(404);
          expect(getResponse.data).toBeUndefined();
          expect(getResponse.error).not.toBeUndefined();
          expect(getResponse.error!.code).toBe("iTwinRepositoryNotFound");
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting a repository from a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const getResponse = await iTwinsAccessClient.getRepository(
          accessToken,
          someRandomiTwinId,
          someRandomRepositoryId
        );

        expect(getResponse.status).toBe(404);
        expect(getResponse.data).toBeUndefined();
        expect(getResponse.error).not.toBeUndefined();
        expect(getResponse.error!.code).toBe("iTwinRepositoryNotFound");
        expect(getResponse.error?.message).toBe(
          "Requested iTwin Repository is not available."
        );
      });
    });

    describe("Success Cases", () => {
      it("should get a repository by ID", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data!.iTwin.id!;

        const newRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapTileService",
          uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS",
          displayName: "Test WMTS Repository",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            newRepository
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const getResponse = await iTwinsAccessClient.getRepository(
            accessToken,
            iTwinId,
            repositoryId
          );

          expect(getResponse.status).toBe(200);

          const retrievedRepository = getResponse.data!.repository;
          expect(retrievedRepository.id).toBe(repositoryId);
          expect(retrievedRepository.class).toBe(newRepository.class);
          expect(retrievedRepository.subClass).toBe(newRepository.subClass);
          expect(retrievedRepository.uri).toBe(newRepository.uri);
          expect(retrievedRepository.displayName).toBe(newRepository.displayName);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should get a repository with authentication and options", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        const repositoryWithAuth: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "UrlTemplate",
          uri: "http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          displayName: "Test UrlTemplate with Auth",
          authentication: {
            type: "Header",
            key: "X-Api-Key",
            value: "mySecretApiKey",
          },
          options: {
            queryParameters: {
              apiVersion: "1.5.1",
            },
            minimumLevel: 10,
            maximumLevel: 20,
          },
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            repositoryWithAuth
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const getResponse = await iTwinsAccessClient.getRepository(
            accessToken,
            iTwinId,
            repositoryId
          );

          expect(getResponse.status).toBe(200);

          const retrievedRepository = getResponse.data!.repository;
          expect(retrievedRepository.id).toBe(repositoryId);
          expect(retrievedRepository.class).toBe(repositoryWithAuth.class);
          expect(retrievedRepository.subClass).toBe(repositoryWithAuth.subClass);
          expect(retrievedRepository.uri).toBe(repositoryWithAuth.uri);
          expect(retrievedRepository.displayName).toBe(
            repositoryWithAuth.displayName
          );

          expect(retrievedRepository.authentication).toBeDefined();
          expect(retrievedRepository.authentication!.type).toBe("Header");
          if (retrievedRepository.authentication && (retrievedRepository.authentication.type === "Header" || retrievedRepository.authentication.type === "QueryParameter")) {
            expect(retrievedRepository.authentication.key).toBe("X-Api-Key");
            expect(retrievedRepository.authentication.value).toBe("mySecretApiKey");
          }

          expect(retrievedRepository.options).toBeDefined();
          expect(retrievedRepository.options!.queryParameters).toBeDefined();
          expect(retrievedRepository.options!.queryParameters!.apiVersion).toBe(
            "1.5.1"
          );
          expect(retrievedRepository.options!.minimumLevel).toBe(10);
          expect(retrievedRepository.options!.maximumLevel).toBe(20);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });
  });

  describe("updateRepository", () => {
    describe("Error Responses", () => {
      it("should return 404 when updating a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;
        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const updateData: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://updated-example.com/wms",
          displayName: "Updated Repository",
        };

        try {
          const updateResponse = await iTwinsAccessClient.updateRepository(
            accessToken,
            iTwinId,
            someRandomRepositoryId,
            updateData
          );

          expect(updateResponse.status).toBe(404);
          expect(updateResponse.data).toBeUndefined();
          expect(updateResponse.error).not.toBeUndefined();
          expect(updateResponse.error!.code).toBe("iTwinRepositoryNotFound");
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when updating a repository for a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const updateData: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://updated-example.com/wms",
          displayName: "Updated Repository",
        };

        const updateResponse = await iTwinsAccessClient.updateRepository(
          accessToken,
          someRandomiTwinId,
          someRandomRepositoryId,
          updateData
        );

        expect(updateResponse.status).toBe(404);
        expect(updateResponse.data).toBeUndefined();
        expect(updateResponse.error).not.toBeUndefined();
        expect(updateResponse.error!.code).toBe("iTwinRepositoryNotFound");
        expect(updateResponse.error?.message).toBe(
          "Requested iTwin Repository is not available."
        );
      });

      it("should return 422 when updating a repository with invalid data", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data!.iTwin.id!;

        const newRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Original Repository",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            newRepository
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const invalidUpdateData: NewRepositoryConfig = {
            class: "GeographicInformationSystem",
            subClass: "WebMapService",
            uri: "",
            displayName: "Updated Repository with Invalid URI",
          };

          const updateResponse = await iTwinsAccessClient.updateRepository(
            accessToken,
            iTwinId,
            repositoryId,
            invalidUpdateData
          );

          expect(updateResponse.status).toBe(422);
          expect(updateResponse.data).toBeUndefined();
          expect(updateResponse.error).not.toBeUndefined();
          expect(updateResponse.error!.code).toBe("InvalidiTwinsRequest");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Success Cases", () => {
      it("should update a repository with basic properties", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin!.id!;

        const originalRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://original-example.com/wms",
          displayName: "Original Repository Name",
        };

        const updatedRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://updated-example.com/wmts",
          displayName: "Updated Repository Name",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            originalRepository
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const updateResponse = await iTwinsAccessClient.updateRepository(
            accessToken,
            iTwinId,
            repositoryId,
            updatedRepository
          );

          expect(updateResponse.status).toBe(200);
          expect(updateResponse.data?.repository).toBeDefined();

          const updatedRepo = updateResponse.data!.repository;
          expect(updatedRepo.id).toBe(repositoryId);
          expect(updatedRepo.class).toBe(updatedRepository.class);
          expect(updatedRepo.subClass).toBe(updatedRepository.subClass);
          expect(updatedRepo.uri).toBe(updatedRepository.uri);
          expect(updatedRepo.displayName).toBe(updatedRepository.displayName);

          const getResponse = await iTwinsAccessClient.getRepository(
            accessToken,
            iTwinId,
            repositoryId
          );
          expect(getResponse.status).toBe(200);

          const retrievedRepo = getResponse.data!.repository;
          expect(retrievedRepo.subClass).toBe("WebMapService");
          expect(retrievedRepo.uri).toBe("https://updated-example.com/wmts");
          expect(retrievedRepo.displayName).toBe("Updated Repository Name");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should update a repository with authentication and options", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const originalRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "UrlTemplate",
          uri: "http://original-basemaps.com/light_all/{z}/{x}/{y}.png",
          displayName: "Original UrlTemplate Repository",
          authentication: {
            type: "Header",
            key: "X-Original-Key",
            value: "originalApiKey",
          },
          options: {
            queryParameters: {
              apiVersion: "1.0.0",
            },
            minimumLevel: 5,
            maximumLevel: 15,
          },
        };

        const updatedRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "UrlTemplate",
          uri: "http://updated-basemaps.com/dark_all/{z}/{x}/{y}.png",
          displayName: "Updated UrlTemplate Repository",
          authentication: {
            type: "QueryParameter",
            key: "apikey",
            value: "newUpdatedApiKey",
          },
          options: {
            queryParameters: {
              apiVersion: "2.0.0",
              format: "image/png",
            },
            minimumLevel: 8,
            maximumLevel: 22,
          },
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            originalRepository
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const updateResponse = await iTwinsAccessClient.updateRepository(
            accessToken,
            iTwinId,
            repositoryId,
            updatedRepository
          );

          expect(updateResponse.status).toBe(200);
          expect(updateResponse.data?.repository).toBeDefined();

          const updatedRepo = updateResponse.data!.repository;
          expect(updatedRepo.id).toBe(repositoryId);
          expect(updatedRepo.uri).toBe(updatedRepository.uri);
          expect(updatedRepo.displayName).toBe(updatedRepository.displayName);

          expect(updatedRepo.authentication).toBeDefined();
          expect(updatedRepo.authentication!.type).toBe("QueryParameter");
          if (updatedRepo.authentication && (updatedRepo.authentication.type === "Header" || updatedRepo.authentication.type === "QueryParameter")) {
            expect(updatedRepo.authentication.key).toBe("apikey");
            expect(updatedRepo.authentication.value).toBe("newUpdatedApiKey");
          }

          expect(updatedRepo.options).toBeDefined();
          expect(updatedRepo.options!.queryParameters).toBeDefined();
          expect(updatedRepo.options!.queryParameters!.apiVersion).toBe("2.0.0");
          expect(updatedRepo.options!.queryParameters!.format).toBe("image/png");
          expect(updatedRepo.options!.minimumLevel).toBe(8);
          expect(updatedRepo.options!.maximumLevel).toBe(22);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should update only specific fields of a repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const originalRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "ArcGIS",
          uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
          displayName: "Original ArcGIS Repository",
        };

        const partialUpdateRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "ArcGIS",
          uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
          displayName: "Updated ArcGIS Street Map Repository",
        };

        try {
          const createResponse = await iTwinsAccessClient.createRepository(
            accessToken,
            iTwinId,
            originalRepository
          );
          expect(createResponse.status).toBe(201);
          const repositoryId = createResponse.data?.repository!.id!;

          const updateResponse = await iTwinsAccessClient.updateRepository(
            accessToken,
            iTwinId,
            repositoryId,
            partialUpdateRepository
          );

          expect(updateResponse.status).toBe(200);
          expect(updateResponse.data?.repository).toBeDefined();

          const updatedRepo = updateResponse.data!.repository;
          expect(updatedRepo.id).toBe(repositoryId);
          expect(updatedRepo.class).toBe("GeographicInformationSystem"); // Unchanged
          expect(updatedRepo.subClass).toBe("ArcGIS"); // Unchanged
          expect(updatedRepo.uri).toBe(
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
          ); // Updated
          expect(updatedRepo.displayName).toBe(
            "Updated ArcGIS Street Map Repository"
          ); // Updated

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });
  });

  describe("createRepositoryResource", () => {
    describe("Success Cases", () => {
      it("should create a resource with required properties", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resources",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "flood_zones",
            displayName: "Flood Zones",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );

          expect(createResourceResponse.status).toBe(201);
          expect(createResourceResponse.data?.resource).toBeDefined();

          const createdResource = createResourceResponse.data!.resource;
          expect(createdResource.id).toBe(repositoryResource.id);
          expect(createdResource.displayName).toBe(repositoryResource.displayName);
          expect(createdResource.class).toBe("GeographicInformationSystem");
          expect(createdResource.subClass).toBe("WebMapService");

          const subClassValue: string | undefined = createdResource.subClass;
          expect(subClassValue).toBeDefined();
          expect(typeof subClassValue).toBe("string");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 422 when creating a resource without required properties", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resources",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const invalidRepositoryResource = {
            displayName: "Flood Zones Without ID",
          } as any;

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              invalidRepositoryResource,
            );

          expect(createResourceResponse.status).toBe(422);
          expect(createResourceResponse.data).toBeUndefined();
          expect(createResourceResponse.error).not.toBeUndefined();
          expect(createResourceResponse.error!.code).toBe("InvalidiTwinsRequest");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 422 when creating a resource with empty required properties", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resources",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const invalidRepositoryResource = {
            id: "",
            displayName: "",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              invalidRepositoryResource,
            );

          expect(createResourceResponse.status).toBe(422);
          expect(createResourceResponse.data).toBeUndefined();
          expect(createResourceResponse.error).not.toBeUndefined();
          expect(createResourceResponse.error!.code).toBe("InvalidiTwinsRequest");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 409 when creating a duplicate resource", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resources",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "water_bodies",
            displayName: "Water Bodies",
          };

          const createResourceResponse1 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );

          expect(createResourceResponse1.status).toBe(201);
          expect(createResourceResponse1.data?.resource).toBeDefined();
          expect(createResourceResponse1.data!.resource.id).toBe(
            repositoryResource.id,
          );

          const createResourceResponse2 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );

          expect(createResourceResponse2.status).toBe(409);
          expect(createResourceResponse2.data).toBeUndefined();
          expect(createResourceResponse2.error).not.toBeUndefined();
          expect(createResourceResponse2.error!.code).toBe(
            "iTwinRepositoryResourceExists",
          );

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when creating a resource for a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;
        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const repositoryResource = {
          id: "test_resource",
          displayName: "Test Resource",
        };

        try {
          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              someRandomRepositoryId,
              repositoryResource,
            );

          expect(createResourceResponse.status).toBe(404);
          expect(createResourceResponse.data).toBeUndefined();
          expect(createResourceResponse.error).not.toBeUndefined();
          expect(createResourceResponse.error!.code).toBe(
            "iTwinRepositoryNotFound",
          );
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when creating a resource for a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const repositoryResource = {
          id: "test_resource",
          displayName: "Test Resource",
        };

        const createResourceResponse =
          await iTwinsAccessClient.createRepositoryResource(
            accessToken,
            someRandomiTwinId,
            someRandomRepositoryId,
            repositoryResource,
          );

        expect(createResourceResponse.status).toBe(404);
        expect(createResourceResponse.data).toBeUndefined();
        expect(createResourceResponse.error).not.toBeUndefined();
        expect(createResourceResponse.error!.code).toBe("iTwinRepositoryNotFound");
      });
    });
  });

  describe("getRepositoryResource", () => {
    describe("Success Cases", () => {
      it("should get a resource with minimal mode", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resource Access",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "water_features",
            displayName: "Water Features",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );
          expect(createResourceResponse.status).toBe(201);
          const resourceId = createResourceResponse.data?.resource!.id!;

          const getResourceResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resourceId,
              "minimal",
            );

          expect(getResourceResponse.status).toBe(200);
          expect(getResourceResponse.data?.resource).toBeDefined();

          const retrievedResource = getResourceResponse.data!.resource;
          expect(retrievedResource.id).toBe(resourceId);
          expect(retrievedResource.displayName).toBe(
            repositoryResource.displayName,
          );
          expect(retrievedResource.class).toBeDefined();
          expect(retrievedResource.class).toBe("GeographicInformationSystem");

          expect("properties" in retrievedResource).toBe(false);

          const subClassValue: string | undefined = retrievedResource.subClass;
          if (subClassValue !== undefined) {
            expect(typeof subClassValue).toBe("string");
          }

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Result Modes", () => {
      it("should get a resource with representation mode", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data!.iTwin.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resource Representation",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "vegetation_areas",
            displayName: "Vegetation Areas",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );
          expect(createResourceResponse.status).toBe(201);
          const resourceId = createResourceResponse.data?.resource!.id!;

          const getResourceResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resourceId,
              "representation",
            );

          expect(getResourceResponse.status).toBe(200);
          expect(getResourceResponse.data?.resource).toBeDefined();

          const retrievedResource = getResourceResponse.data!.resource;
          expect(retrievedResource.id).toBe(resourceId);
          expect(retrievedResource.displayName).toBe(
            repositoryResource.displayName,
          );
          expect(retrievedResource.class).toBeDefined();
          expect(retrievedResource.class).toBe("GeographicInformationSystem");

          if ("properties" in retrievedResource) {
            expect(retrievedResource.properties).toBeDefined();
            expect(typeof retrievedResource.properties).toBe("object");
          }

          const subClassValue: string | undefined = retrievedResource.subClass;
          if (subClassValue !== undefined) {
            expect(typeof subClassValue).toBe("string");
          }

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 404 when getting a non-existent resource", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const someRandomResourceId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

          const getResourceResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              someRandomResourceId,
            );

          expect(getResourceResponse.status).toBe(404);
          expect(getResourceResponse.data).toBeUndefined();
          expect(getResourceResponse.error).not.toBeUndefined();
          expect(getResourceResponse.error!.code).toBe(
            "iTwinRepositoryResourceNotFound",
          );

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting a resource from a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        try {
          const getResourceResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              someRandomRepositoryId,
              someRandomResourceId,
            );

          expect(getResourceResponse.status).toBe(404);
          expect(getResourceResponse.data).toBeUndefined();
          expect(getResourceResponse.error).not.toBeUndefined();
          expect(getResourceResponse.error!.code).toBe("iTwinRepositoryNotFound");
        } finally {
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting a resource from a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "bbf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const getResourceResponse = await iTwinsAccessClient.getRepositoryResource(
          accessToken,
          someRandomiTwinId,
          someRandomRepositoryId,
          someRandomResourceId,
        );

        expect(getResourceResponse.status).toBe(404);
        expect(getResourceResponse.data).toBeUndefined();
        expect(getResourceResponse.error).not.toBeUndefined();
        expect(getResourceResponse.error!.code).toBe("iTwinNotFound");
      });
    });
  });

  describe("getRepositoryResources", () => {
    describe("Success Cases", () => {
      it("should get resources with minimal mode", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Multiple Resources",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const resource1 = {
            id: "water_features",
            displayName: "Water Features",
          };
          const resource2 = {
            id: "vegetation_areas",
            displayName: "Vegetation Areas",
          };

          const createResourceResponse1 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resource1,
            );
          expect(createResourceResponse1.status).toBe(201);

          const createResourceResponse2 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resource2,
            );
          expect(createResourceResponse2.status).toBe(201);

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
              undefined,
              "minimal",
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);
          expect(
            getResourcesResponse.data!.resources.length,
          ).toBeGreaterThanOrEqual(2);

          const resources = getResourcesResponse.data!.resources;
          const waterFeature = resources.find((r) => r.id === "water_features");
          const vegetationArea = resources.find((r) => r.id === "vegetation_areas");

          expect(waterFeature).toBeDefined();
          expect(waterFeature!.displayName).toBe("Water Features");
          expect(waterFeature!.class).toBe("GeographicInformationSystem");

          expect(vegetationArea).toBeDefined();
          expect(vegetationArea!.displayName).toBe("Vegetation Areas");
          expect(vegetationArea!.class).toBe("GeographicInformationSystem");

          resources.forEach((resource) => {
            expect("properties" in resource).toBe(false);
          });

          const minimalResponse = getResourcesResponse.data! as any;
          expect(minimalResponse._links).toBeDefined();
          expect(minimalResponse._links.self).toBeDefined();
          expect(minimalResponse._links.self.href).toBeDefined();
          expect(typeof minimalResponse._links.self.href).toBe("string");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return empty array from a repository with no resources", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Empty Test GIS Repository",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Result Modes", () => {
      it("should get resources with representation mode", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resource Representation",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const resource1 = {
            id: "roads_network",
            displayName: "Roads Network",
          };
          const resource2 = {
            id: "building_footprints",
            displayName: "Building Footprints",
          };

          const createResourceResponse1 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resource1,
            );
          expect(createResourceResponse1.status).toBe(201);

          const createResourceResponse2 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resource2,
            );
          expect(createResourceResponse2.status).toBe(201);

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
              undefined,
              "representation",
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);
          expect(
            getResourcesResponse.data!.resources.length,
          ).toBeGreaterThanOrEqual(2);

          const resources = getResourcesResponse.data!.resources;
          const roadsNetwork = resources.find((r) => r.id === "roads_network");
          const buildingFootprints = resources.find(
            (r) => r.id === "building_footprints",
          );

          expect(roadsNetwork).toBeDefined();
          expect(roadsNetwork!.displayName).toBe("Roads Network");
          expect(roadsNetwork!.class).toBe("GeographicInformationSystem");

          expect(buildingFootprints).toBeDefined();
          expect(buildingFootprints!.displayName).toBe("Building Footprints");
          expect(buildingFootprints!.class).toBe("GeographicInformationSystem");

          if (resources.length > 0 && "properties" in resources[0]) {
            expect(resources[0].properties).toBeDefined();
            expect(typeof resources[0].properties).toBe("object");
          }

          resources.forEach((resource) => {
            const subClassValue: string | undefined = resource.subClass;
            if (subClassValue !== undefined) {
              expect(typeof subClassValue).toBe("string");
            }
          });

          const representationResponse = getResourcesResponse.data! as any;
          expect(representationResponse._links).toBeDefined();
          expect(representationResponse._links.self).toBeDefined();
          expect(representationResponse._links.self.href).toBeDefined();
          expect(typeof representationResponse._links.self.href).toBe("string");

          if (representationResponse._links.prev) {
            expect(representationResponse._links.prev.href).toBeDefined();
            expect(typeof representationResponse._links.prev.href).toBe("string");
          }
          if (representationResponse._links.next) {
            expect(representationResponse._links.next.href).toBeDefined();
            expect(typeof representationResponse._links.next.href).toBe("string");
          }

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Pagination", () => {
      it("should get resources with pagination parameters", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Pagination",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const resources = [
            { id: "resource_1", displayName: "Resource One" },
            { id: "resource_2", displayName: "Resource Two" },
            { id: "resource_3", displayName: "Resource Three" },
          ];

          for (const resource of resources) {
            const createResourceResponse =
              await iTwinsAccessClient.createRepositoryResource(
                accessToken,
                iTwinId,
                repositoryId,
                resource,
              );
            expect(createResourceResponse.status).toBe(201);
          }

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
              { top: 2 },
              "representation",
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);
          expect(getResourcesResponse.data!.resources.length).toBeGreaterThan(0);

          const representationResponse = getResourcesResponse.data!;
          expect(representationResponse._links).toBeDefined();
          expect(representationResponse._links.self).toBeDefined();
          expect(representationResponse._links.self.href).toBeDefined();
          expect(typeof representationResponse._links.self.href).toBe("string");

          expect(representationResponse._links.self.href).toContain("top=2");

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should get resources with pagination in minimal mode and verify links", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Minimal Mode Pagination",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const resources = [
            { id: "minimal_resource_1", displayName: "Minimal Resource One" },
            { id: "minimal_resource_2", displayName: "Minimal Resource Two" },
            { id: "minimal_resource_3", displayName: "Minimal Resource Three" },
          ];

          for (const resource of resources) {
            const createResourceResponse =
              await iTwinsAccessClient.createRepositoryResource(
                accessToken,
                iTwinId,
                repositoryId,
                resource,
              );
            expect(createResourceResponse.status).toBe(201);
          }

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
              { top: 2, skip: 1 },
              "minimal",
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);
          expect(getResourcesResponse.data!.resources.length).toBeGreaterThan(0);

          const minimalResponse = getResourcesResponse.data! as any;
          expect(minimalResponse._links).toBeDefined();
          expect(minimalResponse._links.self).toBeDefined();
          expect(minimalResponse._links.self.href).toBeDefined();
          expect(typeof minimalResponse._links.self.href).toBe("string");

          expect(minimalResponse._links.self.href).toContain("top=2");
          expect(minimalResponse._links.self.href).toContain("skip=1");

          const resourcesResponse = getResourcesResponse.data!.resources;
          resourcesResponse.forEach((resource) => {
            expect("properties" in resource).toBe(false);
          });

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Search", () => {
      it("should get resources with search parameter", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Search",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const searchableResource = {
            id: "water_bodies_special",
            displayName: "Water Bodies Special Feature",
          };
          const otherResource = {
            id: "road_network",
            displayName: "Road Network System",
          };

          const createResourceResponse1 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              searchableResource,
            );
          expect(createResourceResponse1.status).toBe(201);

          const createResourceResponse2 =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              otherResource,
            );
          expect(createResourceResponse2.status).toBe(201);

          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              repositoryId,
              { search: "water" },
            );

          expect(getResourcesResponse.status).toBe(200);
          expect(getResourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(getResourcesResponse.data!.resources)).toBe(true);

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 404 when getting resources from a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        try {
          const getResourcesResponse =
            await iTwinsAccessClient.getRepositoryResources(
              accessToken,
              iTwinId,
              someRandomRepositoryId,
            );

          expect(getResourcesResponse.status).toBe(404);
          expect(getResourcesResponse.data).toBeUndefined();
          expect(getResourcesResponse.error).not.toBeUndefined();
          expect(getResourcesResponse.error!.code).toBe("iTwinRepositoryNotFound");
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting resources from a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const getResourcesResponse =
          await iTwinsAccessClient.getRepositoryResources(
            accessToken,
            someRandomiTwinId,
            someRandomRepositoryId,
          );

        expect(getResourcesResponse.status).toBe(404);
        expect(getResourcesResponse.data).toBeUndefined();
        expect(getResourcesResponse.error).not.toBeUndefined();
        expect(getResourcesResponse.error!.code).toBe("iTwinNotFound");
      });
    });
  });

  describe("deleteRepositoryResource", () => {
    describe("Success Cases", () => {
      it("should delete a resource", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Resource Deletion",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "test_resource_to_delete",
            displayName: "Test Resource for Deletion",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );
          expect(createResourceResponse.status).toBe(201);
          const resourceId = createResourceResponse.data?.resource!.id!;

          const getResourceResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resourceId,
            );
          expect(getResourceResponse.status).toBe(200);
          expect(getResourceResponse.data?.resource).toBeDefined();

          const deleteResourceResponse =
            await iTwinsAccessClient.deleteRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resourceId,
            );

          expect(deleteResourceResponse.status).toBe(204);
          expect(deleteResourceResponse.data).toBeUndefined();

          const verifyDeleteResponse =
            await iTwinsAccessClient.getRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              resourceId,
            );
          expect(verifyDeleteResponse.status).toBe(404);
          expect(verifyDeleteResponse.error?.code).toBe(
            "iTwinRepositoryResourceNotFound",
          );

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 404 when deleting a non-existent resource", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const someRandomResourceId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

          const deleteResourceResponse =
            await iTwinsAccessClient.deleteRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              someRandomResourceId,
            );

          expect(deleteResourceResponse.status).toBe(404);
          expect(deleteResourceResponse.data).toBeUndefined();
          expect(deleteResourceResponse.error).not.toBeUndefined();
          expect(deleteResourceResponse.error!.code).toBe(
            "iTwinRepositoryResourceNotFound",
          );

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when deleting a resource from a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        try {
          const deleteResourceResponse =
            await iTwinsAccessClient.deleteRepositoryResource(
              accessToken,
              iTwinId,
              someRandomRepositoryId,
              someRandomResourceId,
            );

          expect(deleteResourceResponse.status).toBe(404);
          expect(deleteResourceResponse.data).toBeUndefined();
          expect(deleteResourceResponse.error).not.toBeUndefined();
          expect(deleteResourceResponse.error!.code).toBe(
            "iTwinRepositoryResourceNotFound",
          );
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when deleting a resource from a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "bbf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const deleteResourceResponse =
          await iTwinsAccessClient.deleteRepositoryResource(
            accessToken,
            someRandomiTwinId,
            someRandomRepositoryId,
            someRandomResourceId,
          );

        expect(deleteResourceResponse.status).toBe(404);
        expect(deleteResourceResponse.data).toBeUndefined();
        expect(deleteResourceResponse.error).not.toBeUndefined();
        expect(deleteResourceResponse.error!.code).toBe("iTwinRepositoryNotFound");
      });
    });
  });

  describe("Resource Graphics", () => {
    describe("Success Cases", () => {
      it("should handle resource graphics request", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository for Graphics",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const repositoryResource = {
            id: "test_graphics_resource",
            displayName: "Test Graphics Resource",
          };

          const createResourceResponse =
            await iTwinsAccessClient.createRepositoryResource(
              accessToken,
              iTwinId,
              repositoryId,
              repositoryResource,
            );
          expect(createResourceResponse.status).toBe(201);
          const resourceId = createResourceResponse.data?.resource!.id!;

          const graphicsResponse = await iTwinsAccessClient.getResourceGraphics(
            accessToken,
            iTwinId,
            repositoryId,
            resourceId,
          );

          expect([200, 404]).toContain(graphicsResponse.status);

          if (graphicsResponse.status === 200) {
            expect(graphicsResponse.data?.graphics).toBeDefined();
            expect(Array.isArray(graphicsResponse.data!.graphics)).toBe(true);

            if (graphicsResponse.data!.graphics.length > 0) {
              const graphic = graphicsResponse.data!.graphics[0];
              expect(graphic.uri).toBeDefined();
              expect(typeof graphic.uri).toBe("string");
              expect(graphic.type).toBeDefined();

              if (graphic.authentication) {
                expect(graphic.authentication.type).toBeDefined();
                expect(["Header", "QueryParameter", "Basic"]).toContain(
                  graphic.authentication.type,
                );
              }
            }
          } else {
            expect(graphicsResponse.data).toBeUndefined();
            expect(graphicsResponse.error).not.toBeUndefined();
            expect(graphicsResponse.error!.code).toBeDefined();
          }

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 404 when getting graphics for a non-existent resource", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const gisRepository: NewRepositoryConfig = {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
          uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
          displayName: "Test GIS Repository",
        };

        try {
          const createRepositoryResponse =
            await iTwinsAccessClient.createRepository(
              accessToken,
              iTwinId,
              gisRepository,
            );
          expect(createRepositoryResponse.status).toBe(201);
          const repositoryId = createRepositoryResponse.data?.repository!.id!;

          const someRandomResourceId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

          const graphicsResponse = await iTwinsAccessClient.getResourceGraphics(
            accessToken,
            iTwinId,
            repositoryId,
            someRandomResourceId,
          );

          expect(graphicsResponse.status).toBe(404);
          expect(graphicsResponse.data).toBeUndefined();
          expect(graphicsResponse.error).not.toBeUndefined();

          const repositoryDeleteResponse =
            await iTwinsAccessClient.deleteRepository(
              accessToken,
              iTwinId,
              repositoryId,
            );
          expect(repositoryDeleteResponse.status).toBe(204);
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting graphics from a non-existent repository", async () => {
        const newiTwin: ItwinCreate = {
          displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
          number: `APIM iTwin Test Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          status: "Trial",
        };
        const iTwinResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = iTwinResponse.data?.iTwin?.id!;

        const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        try {
          const graphicsResponse = await iTwinsAccessClient.getResourceGraphics(
            accessToken,
            iTwinId,
            someRandomRepositoryId,
            someRandomResourceId,
          );

          expect(graphicsResponse.status).toBe(404);
          expect(graphicsResponse.data).toBeUndefined();
          expect(graphicsResponse.error).not.toBeUndefined();
        } finally {
          // Cleanup
          const iTwinDeleteResponse = await iTwinsAccessClient.deleteItwin(
            accessToken,
            iTwinId,
          );
          expect(iTwinDeleteResponse.status).toBe(204);
          expect(iTwinDeleteResponse.data).toBeUndefined();
        }
      });

      it("should return 404 when getting graphics from a non-existent iTwin", async () => {
        const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";
        const someRandomResourceId = "bbf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

        const graphicsResponse = await iTwinsAccessClient.getResourceGraphics(
          accessToken,
          someRandomiTwinId,
          someRandomRepositoryId,
          someRandomResourceId,
        );

        expect(graphicsResponse.status).toBe(404);
        expect(graphicsResponse.data).toBeUndefined();
        expect(graphicsResponse.error).not.toBeUndefined();
        expect(graphicsResponse.error!.code).toBe("iTwinNotFound");
      });
    });
  });
});
