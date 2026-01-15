/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import type { AccessToken } from "@itwin/core-bentley";;
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import type { BentleyAPIResponse } from "../../types/CommonApiTypes";
import type { ItwinCreate, ITwinMinimal, ITwinRepresentation, ITwinRepresentationResponse, ITwinSubClass } from "../../types/ITwin";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient", () => {
  let baseUrl: string = "https://api.bentley.com/itwins";
  const urlPrefix = process.env.IMJS_URL_PREFIX;
  if (urlPrefix) {
    const url = new URL(baseUrl);
    url.hostname = urlPrefix + url.hostname;
    baseUrl = url.href;
  }
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  const iTwinsCustomClient: ITwinsClient = new ITwinsClient(
    baseUrl
  );
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  beforeEach(async () => {
    // Add small delay between tests to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should get a list of project iTwins with custom url", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsCustomClient.getITwins(accessToken, { subClass: "Project" });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get a list of project iTwins without provided subClass", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsCustomClient.getITwins(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get a list of project iTwins with provided subClass inside arg", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsCustomClient.getITwins(accessToken, {
        subClass: "Project",
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get a 404 when trying to get an iTwin", async () => {
    // Arrange
    const notAniTwinId = "22acf21e-0575-4faf-849b-bcd538718269";

    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwin(accessToken, notAniTwinId);

    // Assert
    expect(iTwinsResponse.status).toBe(404);
    expect(iTwinsResponse.data).toBeUndefined();
    expect(iTwinsResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get a 422 when querying with an unsupported subClass", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwins(accessToken, {
        subClass: "Invalid" as ITwinSubClass,
      });

    // Assert
    expect(iTwinsResponse.status).toBe(422);
    expect(iTwinsResponse.data).toBeUndefined();
    expect(iTwinsResponse.error).not.toBeUndefined();
    expect(iTwinsResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(iTwinsResponse.error!.details![0].code).toBe("InvalidValue");
    expect(iTwinsResponse.error!.details![0].target).toBe("subClass");
  });

  it("should get a list of project iTwins", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwins(accessToken, { subClass: "Project" });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get a list of project iTwins without providing subClass", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwins(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get a project iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwin(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.iTwin.id).toBe(iTwinId);
    expect(actualiTwin.iTwin.class).toBe("Endeavor");
    expect(actualiTwin.iTwin.subClass).toBe("Project");
  });

  it("should get more project iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
      await iTwinsAccessClient.getITwin(
        accessToken,
        iTwinId!,
        "representation"
      );

    // Assert
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.iTwin.parentId).toBeTypeOf("string");
    expect(actualiTwin.iTwin.iTwinAccountId).toBeTypeOf("string");
    expect(actualiTwin.iTwin.imageName).toBeNull();
    expect(actualiTwin.iTwin.image).toBeNull();
    expect(actualiTwin.iTwin.createdDateTime).toBeTypeOf("string");
    expect(actualiTwin.iTwin.createdBy).toBeTypeOf("string");
  });

  it("should get an account", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwinAccount(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.iTwin.id).not.toBe(iTwinId); // should be a different entity
    expect(actualiTwin.iTwin.class).toBe("Account");
    expect(actualiTwin.iTwin.subClass).toBe("Account");
  });

  it("should get more details for an account in represenatation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse : BentleyAPIResponse<ITwinRepresentationResponse> =
      await iTwinsAccessClient.getITwinAccount(
        accessToken,
        iTwinId!,
        "representation"
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.iTwin.id).not.toBe(iTwinId); // should be a different entity
    expect(actualiTwin.iTwin.class).toBe("Account");
    expect(actualiTwin.iTwin.subClass).toBe("Account");
    expect(actualiTwin.iTwin.createdDateTime).toBeTypeOf("string");
    expect(actualiTwin.iTwin.createdBy).toBeTypeOf("string");
  });

  it("should get the account specified by the iTwinAccountId", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const accountResponse =
      await iTwinsAccessClient.getITwinAccount(accessToken, iTwinId!);
    const iTwinsResponse =
      await iTwinsAccessClient.getITwin(
        accessToken,
        iTwinId!,
        "representation"
      );

    // Assert
    expect(accountResponse.status).toBe(200);
    expect(accountResponse.data).toBeDefined();
    const actualAccount = accountResponse.data!;
    expect(actualAccount.iTwin.id).not.toBe(iTwinId); // should be a different entity
    expect(actualAccount.iTwin.class).toBe("Account");
    expect(actualAccount.iTwin.subClass).toBe("Account");

    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.iTwin.id).toBe(iTwinId);
    expect(actualiTwin.iTwin.class).toBe("Endeavor");
    expect(actualiTwin.iTwin.subClass).toBe("Project");

    expect(actualiTwin.iTwin.iTwinAccountId).toBe(actualAccount.iTwin.id);
  });

  it("should get a paged list of project iTwins using top", async () => {
    // Arrange
    const numberOfiTwins = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      top: numberOfiTwins,
    });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?.iTwins!.length).toBe(3);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    iTwinsResponse.data?.iTwins!.forEach((actualiTwin: ITwinMinimal) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a paged list of project iTwins using skip", async () => {
    // Arrange
    const numberOfiTwins = 3;
    const numberToSkip = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      top: numberOfiTwins,
      skip: numberToSkip,
    });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data!.iTwins.length).toBe(3);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    // For skip-based pagination, there might be next/prev links
    if (numberToSkip > 0) {
      expect(iTwinsResponse.data?._links?.prev).toBeDefined();
    }
    iTwinsResponse.data!.iTwins.forEach((actualiTwin: ITwinMinimal) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a first three pages of project iTwins", async () => {
    // Arrange
    const numberOfPages = 3;
    const pageSize = 2;

    // Act
    for (let skip = 0; skip < numberOfPages * pageSize; skip += pageSize) {
      const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
        subClass: "Project",
        top: pageSize,
        skip,
      });

      // Assert
      expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
      expect(iTwinsResponse.data!.iTwins.length).toBe(pageSize);
      expect(iTwinsResponse.data?._links).toBeDefined();
      expect(iTwinsResponse.data?._links?.self).toBeDefined();
      // For pagination, check for next/prev links based on position
      if (skip > 0) {
        expect(iTwinsResponse.data?._links?.prev).toBeDefined();
      }
      iTwinsResponse.data!.iTwins.forEach((actualiTwin: ITwinMinimal) => {
        expect(actualiTwin.class).toBe("Endeavor");
        expect(actualiTwin.subClass).toBe("Project");
      });
    }
  });

  it("should get query a project iTwin by name", async () => {
    // Arrange
    const iTwinName = TestConfig.iTwinProjectName;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      displayName: iTwinName,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    iTwins.forEach((actualiTwin: ITwinMinimal) => {
      expect(actualiTwin.displayName).toBe(iTwinName);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get query a project iTwin by number", async () => {
    // Arrange
    const iTwinNumber = TestConfig.iTwinProjectNumber;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      number: iTwinNumber,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    // All items match the name
    iTwins.forEach((actualiTwin: ITwinMinimal) => {
      expect(actualiTwin.number).toBe(iTwinNumber);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should search for project iTwins", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      search: iTwinSearchString,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    // All items match the name
    iTwins.forEach((actualiTwin: ITwinMinimal) => {
      expect(actualiTwin.displayName).toContain(iTwinSearchString);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get more properties of iTwins in representation result mode", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      search: iTwinSearchString,
      resultMode: "representation",
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();

    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf("string");
      expect(actualiTwin.iTwinAccountId).toBeTypeOf("string");
      expect(actualiTwin.createdDateTime).toBeTypeOf("string");
      expect(actualiTwin.createdBy).toBeTypeOf("string");
    });
  });

  it("should get iTwins in query scope of all", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      search: iTwinSearchString,
      queryScope: "all",
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should filter iTwins using OData filter parameter", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      filter: "status eq 'Active'",
      resultMode: "representation",
      top: 10,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.status).toBe("Active");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should order iTwins using OData orderby parameter", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      orderby: "displayName asc",
      top: 10,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();

    // Verify ascending order by displayName
    for (let i = 1; i < iTwins.length; i++) {
      expect(iTwins[i].displayName.localeCompare(iTwins[i - 1].displayName)).toBeGreaterThanOrEqual(0);
    }
  });

  it("should order iTwins in descending order using OData orderby parameter", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      orderby: "displayName desc",
      top: 10,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();

    // Verify descending order by displayName
    for (let i = 1; i < iTwins.length; i++) {
      expect(iTwins[i].displayName.localeCompare(iTwins[i - 1].displayName)).toBeLessThanOrEqual(0);
    }
  });

  it("should select specific fields using OData select parameter", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      select: "id,displayName,class,subClass",
      top: 5,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    iTwins.forEach((actualiTwin) => {
      // Selected fields should be present
      expect(actualiTwin.id).toBeDefined();
      expect(actualiTwin.displayName).toBeDefined();
      expect(actualiTwin.class).toBeDefined();
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should combine multiple OData parameters", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      filter: "status eq 'Active'",
      orderby: "displayName asc",
      select: "id,displayName,status,class,subClass",
      resultMode: "representation",
      top: 5,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwins.length).toBeLessThanOrEqual(5);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();

    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.status).toBe("Active");
      expect(actualiTwin.subClass).toBe("Project");
      expect(actualiTwin.id).toBeDefined();
      expect(actualiTwin.displayName).toBeDefined();
    });

    // Verify ascending order by displayName
    for (let i = 1; i < iTwins.length; i++) {
      expect(iTwins[i].displayName.localeCompare(iTwins[i - 1].displayName)).toBeGreaterThanOrEqual(0);
    }
  });

  it("should handle complex OData filter expressions", async () => {
    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Project",
      filter: "status eq 'Active' or status eq 'Trial'",
      resultMode: "representation",
      top: 10,
    });

    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
    iTwins.forEach((actualiTwin) => {
      expect(["Active", "Trial"]).toContain(actualiTwin.status);
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a list of asset iTwins", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwins(accessToken, { subClass: "Asset" });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();
  });

  it("should get more properties of asset iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwins(accessToken, {
        subClass: "Asset",
        resultMode: "representation",
      });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data?._links).toBeDefined();
    expect(iTwinsResponse.data?._links?.self).toBeDefined();

    iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf("string");
      expect(actualiTwin.iTwinAccountId).toBeTypeOf("string");
      expect(actualiTwin.createdDateTime).toBeTypeOf("string");
      expect(actualiTwin.createdBy).toBeTypeOf("string");
    });
  });

  it("should get a asset iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwin(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data?.iTwin!;
    expect(iTwinId).toBe(actualiTwin.id);
  });

  it("should get more asset iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getITwin(
        accessToken,
        iTwinId!,
        "representation"
      );

    // Assert
    const actualiTwin: ITwinRepresentation = iTwinsResponse.data?.iTwin!;
    expect(actualiTwin.parentId).toBeTypeOf("string");
    expect(actualiTwin.iTwinAccountId).toBeTypeOf("string");
    expect(actualiTwin.imageName).toBeNull();
    expect(actualiTwin.image).toBeNull();
    expect(actualiTwin.createdDateTime).toBeTypeOf("string");
    expect(actualiTwin.createdBy).toBeTypeOf("string");
  });

  it("should get a paged list of asset iTwins using top", async () => {
    // Arrange
    const numberOfiTwins = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Asset",
      top: numberOfiTwins,
    });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data!.iTwins.length).toBe(3);
    iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a paged list of asset iTwins using skip", async () => {
    // Arrange
    const numberOfiTwins = 3;
    const numberToSkip = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Asset",
      top: numberOfiTwins,
      skip: numberToSkip,
    });

    // Assert
    expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
    expect(iTwinsResponse.data!.iTwins.length).toBe(3);
    iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a first three pages of asset iTwins", async () => {
    // Arrange
    const numberOfPages = 3;
    const pageSize = 2;

    // Act
    for (let skip = 0; skip < numberOfPages * pageSize; skip += pageSize) {
      const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
        subClass: "Asset",
        top: pageSize,
        skip,
      });

      // Assert
      expect(iTwinsResponse.data?.iTwins).not.toHaveLength(0);
      expect(iTwinsResponse.data?.iTwins.length).toBe(pageSize);
      iTwinsResponse.data?.iTwins.forEach((actualiTwin) => {
        expect(actualiTwin.class).toBe("Thing");
        expect(actualiTwin.subClass).toBe("Asset");
      });
    }
  });

  it("should get query an asset iTwin by name", async () => {
    // Arrange
    const iTwinName = TestConfig.iTwinAssetName;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Asset",
      displayName: iTwinName,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.displayName).toBe(iTwinName);
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get query an asset iTwin by number", async () => {
    // Arrange
    const iTwinNumber = TestConfig.iTwinAssetNumber;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Asset",
      number: iTwinNumber,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.number).toBe(iTwinNumber);
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should search for asset iTwins", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.getITwins(accessToken, {
      subClass: "Asset",
      search: iTwinSearchString,
    });
    const iTwins = iTwinsResponse.data?.iTwins!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.displayName).toContain(iTwinSearchString);
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get the primary account iTwin", async () => {
    // Act
    const iTwinsResponse =
      await iTwinsAccessClient.getPrimaryAccount(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    const actualiTwin = iTwinsResponse.data?.iTwin!;
    expect(actualiTwin.id).toBeTruthy();
  });

  it("should create, update, and delete an iTwin", async () => {
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
    const iTwinId = createResponse.data!.iTwin.id!;

    // Assert
    expect(createResponse.status).toBe(201);
    expect(createResponse.data?.iTwin!.displayName).toBe(newiTwin.displayName);
    expect(createResponse.data?.iTwin!.class).toBe(newiTwin.class);
    expect(createResponse.data?.iTwin!.subClass).toBe(newiTwin.subClass);

    /* UPDATE ITWIN */
    // Arrange
    const updatediTwin = {
      displayName: "UPDATED APIM iTwin Test Display Name",
    };

    // Act
    const updateResponse =
      await iTwinsAccessClient.updateItwin(accessToken, iTwinId, updatediTwin);

    // Assert
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data!.iTwin.displayName).toBe(updatediTwin.displayName);

    /* DELETE ITWIN */
    // Act
    const deleteResponse: BentleyAPIResponse<undefined> =
      await iTwinsAccessClient.deleteItwin(accessToken, iTwinId);

    // Assert
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.data).toBeUndefined();
  });

  it("should get a 409 conflict when trying to create a duplicate", async () => {
    // Arrange
    const newiTwin: ItwinCreate = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      class: "Thing",
      dataCenterLocation: "East US",
      status: "Trial",
    };

    // Act
    const iTwinResponse =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);
    const iTwinResponse2 =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);
    const deleteResponse: BentleyAPIResponse<undefined> =
      await iTwinsAccessClient.deleteItwin(
        accessToken,
        iTwinResponse.data!.iTwin.id!
      );

    // Assert
    expect(iTwinResponse.status).toBe(201);
    expect(iTwinResponse2.status).toBe(409);
    expect(iTwinResponse2.data).toBeUndefined();
    expect(iTwinResponse2.error).not.toBeUndefined();
    expect(iTwinResponse2.error!.code).toBe("iTwinExists");
    expect(iTwinResponse2.error!.details![0].code).toBe("InvalidValue");
    expect(iTwinResponse2.error!.details![0].target).toBe("number");
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.data).toBeUndefined();
  });

  it("should get a 422 unprocessable entity when trying to create an iTwin without a class specified", async () => {
    // Arrange
    const newiTwin: ItwinCreate = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: "Asset",
      dataCenterLocation: "East US",
      status: "Trial",
    } as ItwinCreate;

    // Act
    const iTwinResponse =
      await iTwinsAccessClient.createITwin(accessToken, newiTwin);

    // Assert
    expect(iTwinResponse.status).toBe(422);
    expect(iTwinResponse.data).toBeUndefined();
    expect(iTwinResponse.error).not.toBeUndefined();
    expect(iTwinResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(iTwinResponse.error!.details![0].code).toBe(
      "MissingRequiredProperty"
    );
    expect(iTwinResponse.error!.details![0].target).toBe("class");
  });
});
