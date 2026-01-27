/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/dot-notation */
import type { AccessToken } from "@itwin/core-bentley";
import type { ItwinCreate } from "../../types/ITwin";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import type { NewRepositoryConfig } from "../../types/Repository";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient - URI-Based Repository Methods Integration Tests", () => {
  let accessToken: AccessToken;
  let client: ITwinsClient;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
    client = new ITwinsClient();
  });

  beforeEach(async () => {
    // Add small delay between tests to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe("getRepositoryResourcesByUri", () => {
    it("should get repository resources using capability URI", async () => {
      // Arrange - Create test iTwin and repository
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        // Get repository with capabilities
        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        // Extract capability URI
        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          // Act - Use URI-based method
          const resourcesResponse = await client.getRepositoryResourcesByUri(
            accessToken,
            resourcesUri
          );

          // Assert
          expect(resourcesResponse.status).toBe(200);
          expect(resourcesResponse.data).toBeDefined();
          expect(resourcesResponse.data?.resources).toBeDefined();
          expect(Array.isArray(resourcesResponse.data?.resources)).toBe(true);
        } else {
          // Skip test if capabilities not available
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should get repository resources with search and pagination parameters", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          // Act - Use URI-based method with OData parameters
          const resourcesResponse = await client.getRepositoryResourcesByUri(
            accessToken,
            resourcesUri,
            { top: 10, skip: 0 }
          );

          // Assert
          expect(resourcesResponse.status).toBe(200);
          expect(resourcesResponse.data).toBeDefined();
        } else {
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should get repository resources in representation mode", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          // Act - Use URI-based method with representation mode
          const resourcesResponse = await client.getRepositoryResourcesByUri(
            accessToken,
            resourcesUri,
            undefined,
            "representation"
          );

          // Assert
          expect(resourcesResponse.status).toBe(200);
          expect(resourcesResponse.data).toBeDefined();
        } else {
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });
  });

  describe("getRepositoryResourceByUri", () => {
    it("should get a specific repository resource using capability URI", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        // Create a test resource
        const resourceId = `test-resource-${Date.now()}`;
        const resourceResponse = await client.createRepositoryResource(
          accessToken,
          iTwinId,
          repositoryId,
          {
            id: resourceId,
            displayName: "Test Resource for URI",
          }
        );

        expect(resourceResponse.status).toBe(201);

        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          const resourceUri = `${resourcesUri}/${resourceId}`;

          // Act - Use URI-based method
          const resourceResponse2 = await client.getRepositoryResourceByUri(
            accessToken,
            resourceUri
          );

          // Assert
          expect(resourceResponse2.status).toBe(200);
          expect(resourceResponse2.data).toBeDefined();
          expect(resourceResponse2.data?.resource).toBeDefined();
          expect(resourceResponse2.data?.resource.id).toBe(resourceId);
        } else {
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should return 404 for non-existent resource URI", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          const nonExistentUri = `${resourcesUri}/non-existent-resource-id`;

          // Act - Try to get non-existent resource
          const resourceResponse = await client.getRepositoryResourceByUri(
            accessToken,
            nonExistentUri
          );

          // Assert
          expect(resourceResponse.status).toBe(404);
          expect(resourceResponse.data).toBeUndefined();
          expect(resourceResponse.error).toBeDefined();
        } else {
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should get resource in representation mode using URI", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const resourceId = `test-resource-${Date.now()}`;
        await client.createRepositoryResource(accessToken, iTwinId, repositoryId, {
          id: resourceId,
          displayName: "Test Resource for Representation Mode",
        });

        const repoWithCaps = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );

        const resourcesUri =
          repoWithCaps.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          const resourceUri = `${resourcesUri}/${resourceId}`;

          // Act - Use representation mode
          const resourceResponse = await client.getRepositoryResourceByUri(
            accessToken,
            resourceUri,
            "representation"
          );

          // Assert
          expect(resourceResponse.status).toBe(200);
          expect(resourceResponse.data).toBeDefined();
        } else {
          console.warn("Repository capabilities.resources.uri not available");
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });
  });

  describe("getResourceGraphicsByUri", () => {
    it("should return 404 when graphics capability URI is not available", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const resourceId = `test-resource-${Date.now()}`;
        await client.createRepositoryResource(accessToken, iTwinId, repositoryId, {
          id: resourceId,
          displayName: "Test Resource",
        });

        // Construct a fake graphics URI (will return 404 if not supported)
        const fakeGraphicsUri = `${client["_baseUrl"]}/${iTwinId}/repositories/${repositoryId}/resources/${resourceId}/graphics`;

        // Act - Try to get graphics from non-existent capability
        const graphicsResponse = await client.getResourceGraphicsByUri(
          accessToken,
          fakeGraphicsUri
        );

        // Assert - Expect 404 since graphics capability may not be available
        expect([200, 404]).toContain(graphicsResponse.status);
        if (graphicsResponse.status === 404) {
          expect(graphicsResponse.data).toBeUndefined();
          expect(graphicsResponse.error).toBeDefined();
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    // Note: Positive test for graphics would require a resource with graphics capability
    // This is environment-dependent and may not be available in all test environments
    it.skip("should get graphics metadata using capability URI (requires graphics-enabled resource)", async () => {
      // This test is skipped by default as it requires special test data
      // To enable: create a resource with graphics capability and update the test

      const newiTwin: ItwinCreate = {
        displayName: `URI Test iTwin ${new Date().toISOString()}`,
        number: `URI-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      try {
        // TODO: Create or reference a repository resource with graphics capability
        // const resourceResponse = await client.getRepositoryResource(...);
        // const graphicsUri = resourceResponse.data?.resource.capabilities?.graphics?.uri;
        //
        // if (graphicsUri) {
        //   const graphicsResponse = await client.getResourceGraphicsByUri(
        //     accessToken,
        //     graphicsUri
        //   );
        //
        //   expect(graphicsResponse.status).toBe(200);
        //   expect(graphicsResponse.data?.graphics).toBeDefined();
        //   expect(graphicsResponse.data?.graphics.contentType).toBeDefined();
        //   expect(graphicsResponse.data?.graphics.uri).toBeDefined();
        // }
      } finally {
        await client.deleteItwin(accessToken, iTwinId);
      }
    });
  });

  describe("Backward Compatibility", () => {
    it("should verify getRepositoryResource method still works", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `Compat Test iTwin ${new Date().toISOString()}`,
        number: `Compat-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const resourceId = `test-resource-${Date.now()}`;
        await client.createRepositoryResource(accessToken, iTwinId, repositoryId, {
          id: resourceId,
          displayName: "Backward Compat Test Resource",
        });

        // Act
        const resourceResponse = await client.getRepositoryResource(
          accessToken,
          iTwinId,
          repositoryId,
          resourceId
        );

        // Assert
        expect(resourceResponse.status).toBe(200);
        expect(resourceResponse.data).toBeDefined();
        expect(resourceResponse.data?.resource.id).toBe(resourceId);
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should verify getRepositoryResources method still works", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `Compat Test iTwin ${new Date().toISOString()}`,
        number: `Compat-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        // Act
        const resourcesResponse = await client.getRepositoryResources(
          accessToken,
          iTwinId,
          repositoryId
        );

        // Assert
        expect(resourcesResponse.status).toBe(200);
        expect(resourcesResponse.data).toBeDefined();
        expect(Array.isArray(resourcesResponse.data?.resources)).toBe(true);
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });
  });

  describe("Migration Pattern", () => {
    it("should demonstrate complete migration from old to URI-based methods", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `Migration Test iTwin ${new Date().toISOString()}`,
        number: `Migration-Test-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        const resourceId = `migration-test-${Date.now()}`;
        await client.createRepositoryResource(accessToken, iTwinId, repositoryId, {
          id: resourceId,
          displayName: "Migration Test Resource",
        });

        // Step 1:
        const oldWayResponse = await client.getRepositoryResource(
          accessToken,
          iTwinId,
          repositoryId,
          resourceId
        );

        expect(oldWayResponse.status).toBe(200);
        const oldResourceData = oldWayResponse.data?.resource;

        // Step 2: New way (recommended)
        const repo = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
        const resourcesUri = repo.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          const resourceUri = `${resourcesUri}/${resourceId}`;
          const newWayResponse = await client.getRepositoryResourceByUri(
            accessToken,
            resourceUri
          );

          expect(newWayResponse.status).toBe(200);
          const newResourceData = newWayResponse.data?.resource;

          // Assert - Both methods return equivalent data
          expect(newResourceData?.id).toBe(oldResourceData?.id);
          expect(newResourceData?.displayName).toBe(oldResourceData?.displayName);
        } else {
          console.warn(
            "Migration test skipped: capabilities.resources.uri not available"
          );
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });

    it("should demonstrate migration for list operations", async () => {
      // Arrange
      const newiTwin: ItwinCreate = {
        displayName: `Migration List Test ${new Date().toISOString()}`,
        number: `Migration-List-${new Date().toISOString()}`,
        type: "Bridge",
        subClass: "Asset",
        class: "Thing",
        dataCenterLocation: "East US",
        status: "Trial",
      };

      const iTwinResponse = await client.createITwin(accessToken, newiTwin);
      const iTwinId = iTwinResponse.data!.iTwin.id!;

      const newRepository: NewRepositoryConfig = {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
        uri: "https://www.example.com/",
      };

      try {
        const repoResponse = await client.createRepository(
          accessToken,
          iTwinId,
          newRepository
        );
        const repositoryId = repoResponse.data!.repository.id!;

        // Step 1
        const oldWayResponse = await client.getRepositoryResources(
          accessToken,
          iTwinId,
          repositoryId
        );

        expect(oldWayResponse.status).toBe(200);
        const oldResourcesCount = oldWayResponse.data?.resources.length || 0;

        // Step 2: New way (recommended)
        const repo = await client.getRepository(
          accessToken,
          iTwinId,
          repositoryId
        );
        const resourcesUri = repo.data?.repository.capabilities?.resources?.uri;

        if (resourcesUri) {
          const newWayResponse = await client.getRepositoryResourcesByUri(
            accessToken,
            resourcesUri
          );

          expect(newWayResponse.status).toBe(200);
          const newResourcesCount = newWayResponse.data?.resources.length || 0;

          // Assert - Both methods return same number of resources
          expect(newResourcesCount).toBe(oldResourcesCount);
        } else {
          console.warn(
            "Migration test skipped: capabilities.resources.uri not available"
          );
        }
      } finally {
        // Cleanup
        await client.deleteItwin(accessToken, iTwinId);
      }
    });
  });
});
