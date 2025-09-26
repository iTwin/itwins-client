/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AccessToken } from "@itwin/core-bentley";
import { TestConfig } from "../TestConfig";
import { ITwinsAccessClient } from "../../iTwinsClient";
import { ITwin } from "../../types/ITwin";
import { Repository } from "../../types/Repository";

describe("iTwins Client - Repository Integration Tests", () => {
  let accessToken: AccessToken;
  let iTwinsAccessClient: ITwinsAccessClient;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
    iTwinsAccessClient = new ITwinsAccessClient();
  });

  beforeEach(async () => {
    // Add small delay between tests to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should get a 404 not found when trying to delete an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    // Act
    const deleteResponse = await iTwinsAccessClient.deleteiTwin(
      accessToken,
      someRandomId
    );

    // Assert
    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.data).toBeUndefined();
    expect(deleteResponse.error).not.toBeUndefined();
    expect(deleteResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get a 404 not found when trying to create a repository with an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    // Act
    const createResponse = await iTwinsAccessClient.createRepository(
      accessToken,
      someRandomId,
      newRepository
    );

    // Assert
    expect(createResponse.status).toBe(404);
    expect(createResponse.data).toBeUndefined();
    expect(createResponse.error).not.toBeUndefined();
    expect(createResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get a 409 conflict when trying to create a duplicate repository", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    try {
      // Act
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

      // Assert
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
      // Cleanup
      const deleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(deleteResponse.status).toBe(204);
      expect(deleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 422 unprocessable entity when trying to create a repository without the uri property", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "",
    };

    try {
      // Act
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        newRepository
      );

      // Assert
      expect(createResponse.status).toBe(422);
      expect(createResponse.data).toBeUndefined();
      expect(createResponse.error).not.toBeUndefined();
      expect(createResponse.error!.code).toBe("InvalidiTwinsRequest");
      expect(createResponse.error!.details![0].code).toBe(
        "MissingRequiredProperty"
      );
      expect(createResponse.error!.details![0].target).toBe("uri");
    } finally {
      // Cleanup
      const deleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(deleteResponse.status).toBe(204);
      expect(deleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to delete an repository that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );

    const iTwinId = iTwinResponse.data!.id!;

    try {
      // Act
      const deleteResponse = await iTwinsAccessClient.deleteRepository(
        accessToken,
        iTwinId,
        someRandomId
      );

      // Assert
      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.data).toBeUndefined();
      expect(deleteResponse.error).not.toBeUndefined();
      expect(deleteResponse.error!.code).toBe("iTwinRepositoryNotFound");
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should create and delete an iTwin Repository", async () => {
    /* CREATE THE ITWIN REPOSITORY */
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    try {
      // Act
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        newRepository
      );

      // Assert
      expect(createResponse.status).toBe(201);
      expect(createResponse.data?.repository!.class).toBe(newRepository.class);
      expect(createResponse.data?.repository!.subClass).toBe(
        newRepository.subClass
      );
      expect(createResponse.data?.repository!.uri).toBe(newRepository.uri);

      /* DELETE ITWIN REPOSITORY */
      // Act
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          createResponse.data?.repository!.id!
        );

      // Assert
      expect(repositoryDeleteResponse.status).toBe(204);
      expect(repositoryDeleteResponse.data).toBeUndefined();
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to get repositories from an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    // Act
    const getResponse = await iTwinsAccessClient.getRepositories(
      accessToken,
      someRandomId
    );

    // Assert
    expect(getResponse.status).toBe(404);
    expect(getResponse.data).toBeUndefined();
    expect(getResponse.error).not.toBeUndefined();
    expect(getResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get an array with only cesium content when getting repositories from an new iTwin", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      class: "Endeavor",
      subClass: "WorkPackage",
      dataCenterLocation: "East US",
      status: "Inactive",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    try {
      // Act
      const getResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId
      );

      // Assert
      expect(getResponse.status).toBe(200);
      expect(getResponse.data?.repositories).toBeDefined();
      expect(getResponse.data!.repositories).toHaveLength(1);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get repositories from an iTwin and filter by class", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const gisRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    try {
      // Create a repository
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        gisRepository
      );
      expect(createResponse.status).toBe(201);

      // Act - Get all repositories
      const getAllResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId
      );

      // Assert - All repositories
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

      // Act - Get repositories filtered by class
      const getFilteredResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        { class: "GeographicInformationSystem" }
      );

      // Assert - Filtered repositories
      expect(getFilteredResponse.status).toBe(200);
      expect(getFilteredResponse.data?.repositories).toBeDefined();
      expect(getFilteredResponse.data!.repositories).toHaveLength(1);
      expect(getFilteredResponse.data!.repositories[0].class).toBe(
        "GeographicInformationSystem"
      );

      // Act - Get repositories filtered by different class (should be empty)
      const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        { class: "Storage" }
      );

      // Assert - Empty filtered result
      expect(getEmptyFilterResponse.status).toBe(200);
      expect(getEmptyFilterResponse.data?.repositories).toBeDefined();
      expect(getEmptyFilterResponse.data!.repositories).toHaveLength(0);

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          createResponse.data?.repository!.id!
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get repositories from an iTwin and filter by subClass", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const wmsRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    try {
      // Create a repository
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        wmsRepository
      );
      expect(createResponse.status).toBe(201);

      // Act - Get repositories filtered by subClass
      const getFilteredResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        {
          class: "GeographicInformationSystem",
          subClass: "WebMapService",
        }
      );

      // Assert - Filtered repositories
      expect(getFilteredResponse.status).toBe(200);
      expect(getFilteredResponse.data?.repositories).toBeDefined();
      expect(getFilteredResponse.data!.repositories).toHaveLength(1);
      expect(getFilteredResponse.data!.repositories[0].subClass).toBe(
        "WebMapService"
      );

      // Act - Get repositories filtered by different subClass (should be empty)
      const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        { class: "GeographicInformationSystem", subClass: "ArcGIS" }
      );

      // Assert - Empty filtered result
      expect(getEmptyFilterResponse.status).toBe(200);
      expect(getEmptyFilterResponse.data?.repositories).toBeDefined();
      expect(getEmptyFilterResponse.data!.repositories).toHaveLength(0);

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          createResponse.data?.repository!.id!
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get repositories from an iTwin and filter by both class and subClass", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const urlTemplateRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "UrlTemplate",
      uri: "http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    };

    try {
      // Create a repository
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        urlTemplateRepository
      );
      expect(createResponse.status).toBe(201);

      // Act - Get repositories filtered by both class and subClass
      const getFilteredResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        {
          class: "GeographicInformationSystem",
          subClass: "UrlTemplate",
        }
      );

      // Assert - Filtered repositories
      expect(getFilteredResponse.status).toBe(200);
      expect(getFilteredResponse.data?.repositories).toBeDefined();
      expect(getFilteredResponse.data!.repositories).toHaveLength(1);
      expect(getFilteredResponse.data!.repositories[0].class).toBe(
        "GeographicInformationSystem"
      );
      expect(getFilteredResponse.data!.repositories[0].subClass).toBe(
        "UrlTemplate"
      );

      // Act - Get repositories with mismatched class and subClass (should be empty)
      const getEmptyFilterResponse = await iTwinsAccessClient.getRepositories(
        accessToken,
        iTwinId,
        {
          class: "Storage",
          subClass: "UrlTemplate",
        }
      );

      // Assert - Error, miss matched class and subclass
      expect(getEmptyFilterResponse.status).toBe(422);
      expect(getEmptyFilterResponse.data).toBeUndefined();
      expect(getEmptyFilterResponse.error).toBeDefined();

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          createResponse.data?.repository!.id!
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to get a repository that doesn't exist", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;
    const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    try {
      // Act
      const getResponse = await iTwinsAccessClient.getRepository(
        accessToken,
        iTwinId,
        someRandomRepositoryId
      );

      // Assert
      expect(getResponse.status).toBe(404);
      expect(getResponse.data).toBeUndefined();
      expect(getResponse.error).not.toBeUndefined();
      expect(getResponse.error!.code).toBe("iTwinRepositoryNotFound");
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to get a repository from an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    // Act
    const getResponse = await iTwinsAccessClient.getRepository(
      accessToken,
      someRandomiTwinId,
      someRandomRepositoryId
    );

    // Assert
    expect(getResponse.status).toBe(404);
    expect(getResponse.data).toBeUndefined();
    expect(getResponse.error).not.toBeUndefined();
    expect(getResponse.error!.code).toBe("iTwinRepositoryNotFound");
    expect(getResponse.error?.message).toBe("Requested iTwin Repository is not available.")
  });

  it("should successfully get a repository by ID", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapTileService",
      uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS",
      displayName: "Test WMTS Repository",
    };

    try {
      // Create a repository first
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        newRepository
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Act - Get the specific repository
      const getResponse = await iTwinsAccessClient.getRepository(
        accessToken,
        iTwinId,
        repositoryId
      );

      // Assert
      expect(getResponse.status).toBe(200);

      const retrievedRepository = getResponse.data!.repository;
      expect(retrievedRepository.id).toBe(repositoryId);
      expect(retrievedRepository.class).toBe(newRepository.class);
      expect(retrievedRepository.subClass).toBe(newRepository.subClass);
      expect(retrievedRepository.uri).toBe(newRepository.uri);
      expect(retrievedRepository.displayName).toBe(newRepository.displayName);

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a repository with authentication and options", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const repositoryWithAuth: Repository = {
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
      // Create a repository with authentication and options
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        repositoryWithAuth
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Act - Get the specific repository
      const getResponse = await iTwinsAccessClient.getRepository(
        accessToken,
        iTwinId,
        repositoryId
      );

      // Assert
      expect(getResponse.status).toBe(200);

      const retrievedRepository = getResponse.data!.repository;
      expect(retrievedRepository.id).toBe(repositoryId);
      expect(retrievedRepository.class).toBe(repositoryWithAuth.class);
      expect(retrievedRepository.subClass).toBe(repositoryWithAuth.subClass);
      expect(retrievedRepository.uri).toBe(repositoryWithAuth.uri);
      expect(retrievedRepository.displayName).toBe(repositoryWithAuth.displayName);

      // Verify authentication is returned
      expect(retrievedRepository.authentication).toBeDefined();
      expect(retrievedRepository.authentication!.type).toBe("Header");
      expect(retrievedRepository.authentication!.key).toBe("X-Api-Key");
      expect(retrievedRepository.authentication!.value).toBe("mySecretApiKey");

      // Verify options are returned
      expect(retrievedRepository.options).toBeDefined();
      expect(retrievedRepository.options!.queryParameters).toBeDefined();
      expect(retrievedRepository.options!.queryParameters!.apiVersion).toBe("1.5.1");
      expect(retrievedRepository.options!.minimumLevel).toBe(10);
      expect(retrievedRepository.options!.maximumLevel).toBe(20);

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to update a repository that doesn't exist", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;
    const someRandomRepositoryId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    const updateData: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://updated-example.com/wms",
      displayName: "Updated Repository",
    };

    try {
      // Act
      const updateResponse = await iTwinsAccessClient.updateRepository(
        accessToken,
        iTwinId,
        someRandomRepositoryId,
        updateData
      );

      // Assert
      expect(updateResponse.status).toBe(404);
      expect(updateResponse.data).toBeUndefined();
      expect(updateResponse.error).not.toBeUndefined();
      expect(updateResponse.error!.code).toBe("iTwinRepositoryNotFound");
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should get a 404 not found when trying to update a repository from an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomiTwinId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const someRandomRepositoryId = "aaf3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    const updateData: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://updated-example.com/wms",
      displayName: "Updated Repository",
    };

    // Act
    const updateResponse = await iTwinsAccessClient.updateRepository(
      accessToken,
      someRandomiTwinId,
      someRandomRepositoryId,
      updateData
    );

    // Assert
    expect(updateResponse.status).toBe(404);
    expect(updateResponse.data).toBeUndefined();
    expect(updateResponse.error).not.toBeUndefined();
    expect(updateResponse.error!.code).toBe("iTwinRepositoryNotFound");
    expect(updateResponse.error?.message).toBe("Requested iTwin Repository is not available.")
  });

  it("should get a 422 unprocessable entity when trying to update a repository with invalid data", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
      displayName: "Original Repository",
    };

    try {
      // Create a repository first
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        newRepository
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Prepare invalid update data (empty URI)
      const invalidUpdateData: Repository = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "",
        displayName: "Updated Repository with Invalid URI",
      };

      // Act - Try to update with invalid data
      const updateResponse = await iTwinsAccessClient.updateRepository(
        accessToken,
        iTwinId,
        repositoryId,
        invalidUpdateData
      );

      // Assert
      expect(updateResponse.status).toBe(422);
      expect(updateResponse.data).toBeUndefined();
      expect(updateResponse.error).not.toBeUndefined();
      expect(updateResponse.error!.code).toBe("InvalidiTwinsRequest");

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should successfully update a repository with basic properties", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const originalRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://original-example.com/wms",
      displayName: "Original Repository Name",
    };

    const updatedRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "WebMapService",
      uri: "https://updated-example.com/wmts",
      displayName: "Updated Repository Name",
    };

    try {
      // Create a repository first
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        originalRepository
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Act - Update the repository
      const updateResponse = await iTwinsAccessClient.updateRepository(
        accessToken,
        iTwinId,
        repositoryId,
        updatedRepository
      );

      // Assert - Update response
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data?.repository).toBeDefined();

      const updatedRepo = updateResponse.data!.repository;
      expect(updatedRepo.id).toBe(repositoryId);
      expect(updatedRepo.class).toBe(updatedRepository.class);
      expect(updatedRepo.subClass).toBe(updatedRepository.subClass);
      expect(updatedRepo.uri).toBe(updatedRepository.uri);
      expect(updatedRepo.displayName).toBe(updatedRepository.displayName);

      // Verify changes by getting the repository
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

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should successfully update a repository with authentication and options", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const originalRepository: Repository = {
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

    const updatedRepository: Repository = {
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
      // Create a repository with authentication and options
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        originalRepository
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Act - Update the repository with new authentication and options
      const updateResponse = await iTwinsAccessClient.updateRepository(
        accessToken,
        iTwinId,
        repositoryId,
        updatedRepository
      );

      // Assert - Update response
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data?.repository).toBeDefined();

      const updatedRepo = updateResponse.data!.repository;
      expect(updatedRepo.id).toBe(repositoryId);
      expect(updatedRepo.uri).toBe(updatedRepository.uri);
      expect(updatedRepo.displayName).toBe(updatedRepository.displayName);

      // Verify updated authentication
      expect(updatedRepo.authentication).toBeDefined();
      expect(updatedRepo.authentication!.type).toBe("QueryParameter");
      expect(updatedRepo.authentication!.key).toBe("apikey");
      expect(updatedRepo.authentication!.value).toBe("newUpdatedApiKey");

      // Verify updated options
      expect(updatedRepo.options).toBeDefined();
      expect(updatedRepo.options!.queryParameters).toBeDefined();
      expect(updatedRepo.options!.queryParameters!.apiVersion).toBe("2.0.0");
      expect(updatedRepo.options!.queryParameters!.format).toBe("image/png");
      expect(updatedRepo.options!.minimumLevel).toBe(8);
      expect(updatedRepo.options!.maximumLevel).toBe(22);

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });

  it("should successfully update only specific fields of a repository", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse = await iTwinsAccessClient.createiTwin(
      accessToken,
      newiTwin
    );
    const iTwinId = iTwinResponse.data!.id!;

    const originalRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "ArcGIS",
      uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      displayName: "Original ArcGIS Repository",
    };

    // Only update displayName and URI, keep class and subClass the same
    const partialUpdateRepository: Repository = {
      class: "GeographicInformationSystem",
      subClass: "ArcGIS",
      uri: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
      displayName: "Updated ArcGIS Street Map Repository",
    };

    try {
      // Create a repository first
      const createResponse = await iTwinsAccessClient.createRepository(
        accessToken,
        iTwinId,
        originalRepository
      );
      expect(createResponse.status).toBe(201);
      const repositoryId = createResponse.data?.repository!.id!;

      // Act - Update only specific fields
      const updateResponse = await iTwinsAccessClient.updateRepository(
        accessToken,
        iTwinId,
        repositoryId,
        partialUpdateRepository
      );

      // Assert - Update response
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data?.repository).toBeDefined();

      const updatedRepo = updateResponse.data!.repository;
      expect(updatedRepo.id).toBe(repositoryId);
      expect(updatedRepo.class).toBe("GeographicInformationSystem"); // Unchanged
      expect(updatedRepo.subClass).toBe("ArcGIS"); // Unchanged
      expect(updatedRepo.uri).toBe("https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"); // Updated
      expect(updatedRepo.displayName).toBe("Updated ArcGIS Street Map Repository"); // Updated

      // Cleanup repository
      const repositoryDeleteResponse =
        await iTwinsAccessClient.deleteRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
      expect(repositoryDeleteResponse.status).toBe(204);
    } finally {
      // Cleanup
      const iTwinDeleteResponse = await iTwinsAccessClient.deleteiTwin(
        accessToken,
        iTwinId
      );
      expect(iTwinDeleteResponse.status).toBe(204);
      expect(iTwinDeleteResponse.data).toBeUndefined();
    }
  });
});
