/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import { TestConfig } from "../TestConfig";

const getDefinedValue = <T>(value: T | undefined, message: string): T => {
  expect(value, message).toBeDefined();
  if (value === undefined) {
    throw new Error(message);
  }

  return value;
};

describe("iTwins Client - Global Repository Integration Tests", () => {
  let accessToken: AccessToken;
  let client: ITwinsClient;

  const globalRepositoryId = "cesium";

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
    client = new ITwinsClient();
  });

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  const getFirstGlobalResourceId = async (): Promise<string> => {
    const resourcesResponse = await client.getGlobalRepositoryResources(
      accessToken,
      globalRepositoryId,
      { top: 1 }
    );

    expect(resourcesResponse.status).toBe(200);

    const resources = getDefinedValue(
      resourcesResponse.data?.resources,
      "Expected global repository resources"
    );

    expect(resources.length).toBeGreaterThan(0);

    const resource = getDefinedValue(
      resources[0],
      "Expected at least one global repository resource"
    );

    return resource.id;
  };

  const getGraphicsCapableResourceId = async (): Promise<string> => {
    const resourcesResponse = await client.getGlobalRepositoryResources(
      accessToken,
      globalRepositoryId,
      { top: 25 }
    );

    expect(resourcesResponse.status).toBe(200);

    const resources = getDefinedValue(
      resourcesResponse.data?.resources,
      "Expected global repository resources"
    );

    const graphicsCapableResource = resources.find(
      (entry) => entry.capabilities?.graphics?.uri !== undefined
    );

    const selectedResource = getDefinedValue(
      graphicsCapableResource,
      "Expected a graphics-capable global repository resource"
    );

    return selectedResource.id;
  };

  it("should get global repositories", async () => {
    const response = await client.getGlobalRepositories(accessToken);

    expect(response.status).toBe(200);

    const repositories = getDefinedValue(
      response.data?.repositories,
      "Expected global repositories"
    );

    expect(Array.isArray(repositories)).toBe(true);
    expect(repositories.length).toBeGreaterThan(0);
    expect(repositories.some((repository) => repository.id === globalRepositoryId)).toBe(true);
  });

  it("should filter global repositories by class", async () => {
    const response = await client.getGlobalRepositories(accessToken, {
      class: "Cesium",
    });

    expect(response.status).toBe(200);

    const repositories = getDefinedValue(
      response.data?.repositories,
      "Expected filtered global repositories"
    );

    expect(repositories.length).toBeGreaterThan(0);
    expect(repositories.every((repository) => repository.class === "Cesium")).toBe(true);
  });

  it("should get a specific global repository", async () => {
    const response = await client.getGlobalRepository(
      accessToken,
      globalRepositoryId
    );

    expect(response.status).toBe(200);

    const repository = getDefinedValue(
      response.data?.repository,
      "Expected a global repository"
    );

    expect(repository.id).toBe(globalRepositoryId);
    expect(repository.class).toBe("Cesium");
    expect(repository.capabilities?.resources?.uri).toContain(
      `/itwins/repositories/${globalRepositoryId}/resources`
    );
  });

  it("should get a 404 for a missing global repository", async () => {
    const response = await client.getGlobalRepository(
      accessToken,
      "not-a-real-global-repository"
    );

    expect(response.status).toBe(404);
    expect(response.data).toBeUndefined();
    expect(response.error).not.toBeUndefined();
    expect(response.error?.code).toBe("iTwinRepositoryNotFound");
  });

  it("should get global repository resources with pagination", async () => {
    const response = await client.getGlobalRepositoryResources(
      accessToken,
      globalRepositoryId,
      { top: 2 }
    );

    expect(response.status).toBe(200);

    const resources = getDefinedValue(
      response.data?.resources,
      "Expected global repository resources"
    );

    expect(resources.length).toBeGreaterThan(0);
    expect(resources.length).toBeLessThanOrEqual(2);
    expect(response.data?._links).toBeDefined();
  });

  it("should get global repository resources in representation mode", async () => {
    const response = await client.getGlobalRepositoryResources(
      accessToken,
      globalRepositoryId,
      { top: 1 },
      "representation"
    );

    expect(response.status).toBe(200);

    const resources = getDefinedValue(
      response.data?.resources,
      "Expected representation global repository resources"
    );

    const resource = getDefinedValue(
      resources[0],
      "Expected at least one representation resource"
    );

    expect("properties" in resource).toBe(true);
  });

  it("should get a specific global repository resource", async () => {
    const resourceId = await getFirstGlobalResourceId();

    const response = await client.getGlobalRepositoryResource(
      accessToken,
      globalRepositoryId,
      resourceId,
      "representation"
    );

    expect(response.status).toBe(200);

    const resource = getDefinedValue(
      response.data?.resource,
      "Expected a global repository resource"
    );

    expect(resource.id).toBe(resourceId);
    expect(resource.class).toBe("Cesium");
    expect("properties" in resource).toBe(true);
  });

  it("should get graphics metadata for a global repository resource", async () => {
    const resourceId = await getGraphicsCapableResourceId();

    const response = await client.getGlobalResourceGraphics(
      accessToken,
      globalRepositoryId,
      resourceId
    );

    expect(response.status).toBe(200);

    const graphics = getDefinedValue(
      response.data?.graphics,
      "Expected global resource graphics"
    );

    expect(graphics.length).toBeGreaterThan(0);
    expect(typeof graphics[0]?.type).toBe("string");
    expect(typeof graphics[0]?.uri).toBe("string");
  });
});