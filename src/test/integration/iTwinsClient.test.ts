/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { beforeAll, describe, expect, it } from "vitest";
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsAccessClient } from "../../iTwinsClient";
import type { ITwin, ITwinsAPIResponse, Repository } from "../../iTwinsAccessProps";
import { ITwinClass , ITwinSubClass, RepositoryClass, RepositorySubClass } from "../../iTwinsAccessProps";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient", () => {
  let baseUrl: string = "https://api.bentley.com/itwins";
  const urlPrefix = process.env.IMJS_URL_PREFIX;
  if (urlPrefix) {
    const url = new URL(baseUrl);
    url.hostname = urlPrefix + url.hostname;
    baseUrl = url.href;
  }
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const iTwinsCustomClient: ITwinsAccessClient = new ITwinsAccessClient(baseUrl);
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 60000);

  it("should get a list of project iTwins with custom url", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken, ITwinSubClass.Project);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get a list of project iTwins without provided subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get a list of project iTwins with provided subClass inside arg", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken, undefined, {
        subClass: ITwinSubClass.Project,
      });

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get iTwin repositories by id", async () => {
    // Arrange
    const iTwinId = "e01065ed-c52b-4ddf-a326-e7845442716d";

    // Act
    const iTwinsResponse: ITwinsAPIResponse<Repository[]> = await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      iTwinId
    );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get iTwin repositories by id and class", async () => {
    // Arrange
    const iTwinId = "e01065ed-c52b-4ddf-a326-e7845442716d";

    // Act
    const iTwinsResponse: ITwinsAPIResponse<Repository[]> = await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      iTwinId,
      {
        class: RepositoryClass.iModels,
      }
    );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualRepository) => {
      expect(actualRepository.class).toBe("iModels");
    });
  });

  it("should get iTwin repositories by id, class, and subClass", async () => {
    // Arrange
    const iTwinId = "e01065ed-c52b-4ddf-a326-e7845442716d";

    // Act
    const iTwinsResponse: ITwinsAPIResponse<Repository[]> = await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      iTwinId,
      {
        class: RepositoryClass.GeographicInformationSystem,
        subClass: RepositorySubClass.ArcGIS,
      }
    );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).toBeDefined();
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualRepository) => {
      expect(actualRepository.class).toBe("GeographicInformationSystem");
      expect(actualRepository.subClass).toBe(RepositorySubClass.ArcGIS);
    });
  });

  it("should get a 404 when trying to get iTwin Repositories", async () => {
    // Arrange
    const iTwinId = "22acf21e-0575-4faf-849b-bcd538718269";

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      iTwinId
    );

    // Assert
    expect(iTwinsResponse.status).toBe(404);
    expect(iTwinsResponse.data).toBeUndefined();
    expect(iTwinsResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get a 422 when querying iTwin Repositories with unsupported class", async () => {
    // Arrange
    const iTwinId = "e01065ed-c52b-4ddf-a326-e7845442716d";

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      iTwinId,
      {
        class: "Invalid" as ITwinSubClass,
      }
    );

    // Assert
    expect(iTwinsResponse.status).toBe(422);
    expect(iTwinsResponse.data).toBeUndefined();
    expect(iTwinsResponse.error).not.toBeUndefined();
    expect(iTwinsResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(iTwinsResponse.error!.details![0].code).toBe("InvalidValue");
    expect(iTwinsResponse.error!.details![0].target).toBe("class");
  });

  it("should get a 404 when trying to get an iTwin", async () => {
    // Arrange
    const notAniTwinId = "22acf21e-0575-4faf-849b-bcd538718269";

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, notAniTwinId);

    // Assert
    expect(iTwinsResponse.status).toBe(404);
    expect(iTwinsResponse.data).toBeUndefined();
    expect(iTwinsResponse.error!.code).toBe("iTwinNotFound");
  });

  it("should get a 422 when querying with an unsupported subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(
        accessToken,
        "Invalid" as ITwinSubClass
      );

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
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Project);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get a list of project iTwins without providing subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get a project iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.id).toBe(iTwinId);
    expect(actualiTwin.class).toBe("Endeavor");
    expect(actualiTwin.subClass).toBe("Project");
  });

  it("should get more project iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!, "representation");

    // Assert
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.parentId).toBeTypeOf("string");
    expect(actualiTwin.iTwinAccountId).toBeTypeOf("string");
    expect(actualiTwin.imageName).toBeNull();
    expect(actualiTwin.image).toBeNull();
    expect(actualiTwin.createdDateTime).toBeTypeOf("string");
    expect(actualiTwin.createdBy).toBeTypeOf("string");
  });

  it("should get an account", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAccountAsync(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.id).not.toBe(iTwinId); // should be a different entity
    expect(actualiTwin.class).toBe("Account");
    expect(actualiTwin.subClass).toBe("Account");
  });

  it("should get more details for an account in represenatation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAccountAsync(accessToken, iTwinId!, "representation");

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.id).not.toBe(iTwinId); // should be a different entity
    expect(actualiTwin.class).toBe("Account");
    expect(actualiTwin.subClass).toBe("Account");
    expect(actualiTwin.createdDateTime).toBeTypeOf("string");
    expect(actualiTwin.createdBy).toBeTypeOf("string");
  });

  it("should get the account specified by the iTwinAccountId", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const accountResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAccountAsync(accessToken, iTwinId!);
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!, "representation");

    // Assert
    expect(accountResponse.status).toBe(200);
    expect(accountResponse.data).not.to.be.empty;
    const actualAccount = accountResponse.data!;
    expect(actualAccount.id).not.toBe(iTwinId); // should be a different entity
    expect(actualAccount.class).toBe("Account");
    expect(actualAccount.subClass).toBe("Account");

    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.id).toBe(iTwinId);
    expect(actualiTwin.class).toBe("Endeavor");
    expect(actualiTwin.subClass).toBe("Project");

    expect(actualiTwin.iTwinAccountId).toBe(actualAccount.id);
  });

  it("should get a paged list of project iTwins using top", async () => {
    // Arrange
    const numberOfiTwins = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        top: numberOfiTwins,
      }
    );

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);
    expect(iTwinsResponse.data!.length).toBe(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a paged list of project iTwins using skip", async () => {
    // Arrange
    const numberOfiTwins = 3;
    const numberToSkip = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        top: numberOfiTwins,
        skip: numberToSkip,
      }
    );

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);
    expect(iTwinsResponse.data!.length).toBe(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
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
      const iTwinsResponse = await iTwinsAccessClient.queryAsync(
        accessToken,
        ITwinSubClass.Project,
        {
          top: pageSize,
          skip,
        }
      );

      // Assert
      expect(iTwinsResponse.data).not.toHaveLength(0);
      expect(iTwinsResponse.data!.length).toBe(pageSize);
      iTwinsResponse.data!.forEach((actualiTwin) => {
        expect(actualiTwin.class).toBe("Endeavor");
        expect(actualiTwin.subClass).toBe("Project");
      });
    }
  });

  it("should get query a project iTwin by name", async () => {
    // Arrange
    const iTwinName = TestConfig.iTwinProjectName;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        displayName: iTwinName,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.displayName).toBe(iTwinName);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get query a project iTwin by number", async () => {
    // Arrange
    const iTwinNumber = TestConfig.iTwinProjectNumber;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        number: iTwinNumber,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.number).toBe(iTwinNumber);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should search for project iTwins", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        search: iTwinSearchString,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.displayName).toContain(iTwinSearchString);
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get more properties of iTwins in representation result mode", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        search: iTwinSearchString,
        resultMode: "representation",
      }
    );

    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);

    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf('string');
      expect(actualiTwin.iTwinAccountId).toBeTypeOf('string');
      expect(actualiTwin.createdDateTime).toBeTypeOf('string');
      expect(actualiTwin.createdBy).toBeTypeOf('string');
    });
  });

  it("should get iTwins in query scope of all", async () => {
    // Arrange
    const iTwinSearchString = TestConfig.iTwinSearchString;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Project,
      {
        search: iTwinSearchString,
        queryScope: "all",
      }
    );

    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
  });

  it("should get a list of recent project iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken,
        ITwinSubClass.Project
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get a list of recent project iTwins without subClass query", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get more properties of recent project iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken,
        ITwinSubClass.Project,
        { resultMode: "representation" }
      );

    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);

    // All items have the field "createdDateTime"
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf('string');
      expect(actualiTwin.iTwinAccountId).toBeTypeOf('string');
      expect(actualiTwin.createdDateTime).toBeTypeOf('string');
      expect(actualiTwin.createdBy).toBeTypeOf('string');
    });
  });

  it("should get a list of favorited project iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken,
        ITwinSubClass.Project
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a list of favorited project iTwins without subClass query", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get more properties of favorited project iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken,
        ITwinSubClass.Project,
        { resultMode: "representation" }
      );

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);

    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf('string');
      expect(actualiTwin.iTwinAccountId).toBeTypeOf('string');
      expect(actualiTwin.createdDateTime).toBeTypeOf('string');
      expect(actualiTwin.createdBy).toBeTypeOf('string');
    });
  });

  it("should get a list of favorited project iTwins using all query scope", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken,
        ITwinSubClass.Project,
        { queryScope: "all" }
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Endeavor");
      expect(actualiTwin.subClass).toBe("Project");
    });
  });

  it("should get a list of asset iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Asset);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
  });

  it("should get more properties of asset iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Asset, { resultMode: "representation" });

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);

    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.parentId).toBeTypeOf('string');
      expect(actualiTwin.iTwinAccountId).toBeTypeOf('string');
      expect(actualiTwin.createdDateTime).toBeTypeOf('string');
      expect(actualiTwin.createdBy).toBeTypeOf('string');
    });
  });

  it("should get a asset iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(iTwinId).toBe(actualiTwin.id);
  });

  it("should get more asset iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!, "representation");

    // Assert
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.parentId).toBeTypeOf('string');
    expect(actualiTwin.iTwinAccountId).toBeTypeOf('string');
    expect(actualiTwin.imageName).toBeNull();
    expect(actualiTwin.image).toBeNull();
    expect(actualiTwin.createdDateTime).toBeTypeOf('string');
    expect(actualiTwin.createdBy).toBeTypeOf('string');
  });

  it("should get a paged list of asset iTwins using top", async () => {
    // Arrange
    const numberOfiTwins = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Asset,
      {
        top: numberOfiTwins,
      }
    );

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);
    expect(iTwinsResponse.data!.length).toBe(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a paged list of asset iTwins using skip", async () => {
    // Arrange
    const numberOfiTwins = 3;
    const numberToSkip = 3;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Asset,
      {
        top: numberOfiTwins,
        skip: numberToSkip,
      }
    );

    // Assert
    expect(iTwinsResponse.data).not.toHaveLength(0);
    expect(iTwinsResponse.data!.length).toBe(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
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
      const iTwinsResponse = await iTwinsAccessClient.queryAsync(
        accessToken,
        ITwinSubClass.Asset,
        {
          top: pageSize,
          skip,
        }
      );

      // Assert
      expect(iTwinsResponse.data).not.toHaveLength(0);
      expect(iTwinsResponse.data!.length).toBe(pageSize);
      iTwinsResponse.data!.forEach((actualiTwin) => {
        expect(actualiTwin.class).toBe("Thing");
        expect(actualiTwin.subClass).toBe("Asset");
      });
    }
  });

  it("should get query an asset iTwin by name", async () => {
    // Arrange
    const iTwinName = TestConfig.iTwinAssetName;

    // Act
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Asset,
      {
        displayName: iTwinName,
      }
    );
    const iTwins = iTwinsResponse.data!;

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
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Asset,
      {
        number: iTwinNumber,
      }
    );
    const iTwins = iTwinsResponse.data!;

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
    const iTwinsResponse = await iTwinsAccessClient.queryAsync(
      accessToken,
      ITwinSubClass.Asset,
      {
        search: iTwinSearchString,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    expect(iTwins).not.toHaveLength(0);
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      expect(actualiTwin.displayName).toContain(iTwinSearchString);
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a list of recent asset iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken,
        ITwinSubClass.Asset
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a list of recent asset iTwins using all query scope", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken,
        ITwinSubClass.Asset,
        { queryScope: "all"}
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get a list of favorited asset iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken,
        ITwinSubClass.Asset
      );

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.toHaveLength(0);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      expect(actualiTwin.class).toBe("Thing");
      expect(actualiTwin.subClass).toBe("Asset");
    });
  });

  it("should get the primary account iTwin", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getPrimaryAccountAsync(accessToken);

    // Assert
    expect(iTwinsResponse.status).toBe(200);
    expect(iTwinsResponse.data).not.to.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    expect(actualiTwin.id).not.toHaveLength(0);
  });

  it("should create, update, and delete an iTwin", async () => {
    /* CREATE THE ITWIN */
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };

    // Act
    const createResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinId = createResponse.data!.id!;

    // Assert
    expect(createResponse.status).toBe(201);
    expect(createResponse.data!.displayName).toBe(newiTwin.displayName);
    expect(createResponse.data!.class).toBe(newiTwin.class);
    expect(createResponse.data!.subClass).toBe(newiTwin.subClass);

    /* UPDATE ITWIN */
    // Arrange
    const updatediTwin: ITwin = {
      displayName: "UPDATED APIM iTwin Test Display Name",
    };

    // Act
    const updateResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.updateiTwin(accessToken, iTwinId, updatediTwin);

    // Assert
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data!.displayName).toBe(updatediTwin.displayName);

    /* DELETE ITWIN */
    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.data).toBeUndefined();
  });

  it("should create and delete an iTwin Repository", async () => {
    /* CREATE THE ITWIN REPOSITORY */
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      ianaTimeZone: "America/New_York",
      status: "Trial",
    };
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: RepositoryClass.GeographicInformationSystem,
      subClass: RepositorySubClass.WebMapService,
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    // Act
    const createResponse: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, iTwinId, newRepository);

    // Assert
    expect(createResponse.status).toBe(201);
    expect(createResponse.data!.class).toBe(newRepository.class);
    expect(createResponse.data!.subClass).toBe(newRepository.subClass);
    expect(createResponse.data!.uri).toBe(newRepository.uri);

    /* DELETE ITWIN REPOSITORY */
    // Act
    const repositoryDeleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteRepository(accessToken, iTwinId, createResponse.data!.id!);

    const iTwinDeleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    expect(repositoryDeleteResponse.status).toBe(204);
    expect(repositoryDeleteResponse.data).toBeUndefined();
    expect(iTwinDeleteResponse.status).toBe(204);
    expect(iTwinDeleteResponse.data).toBeUndefined();
  });

  it("should get a 409 conflict when trying to create a duplicate", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      status: "Trial",
    };

    // Act
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const iTwinResponse2: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinResponse.data!.id!);

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
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      dataCenterLocation: "East US",
      status: "Trial",
    };

    // Act
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);

    // Assert
    expect(iTwinResponse.status).toBe(422);
    expect(iTwinResponse.data).toBeUndefined();
    expect(iTwinResponse.error).not.toBeUndefined();
    expect(iTwinResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(iTwinResponse.error!.details![0].code).toBe("MissingRequiredProperty");
    expect(iTwinResponse.error!.details![0].target).toBe("class");
  });

  it("should get a 404 not found when trying to delete an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, someRandomId);

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
      class: RepositoryClass.GeographicInformationSystem,
      subClass: RepositorySubClass.WebMapService,
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    // Act
    const createResponse: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, someRandomId, newRepository);

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
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: RepositoryClass.GeographicInformationSystem,
      subClass: RepositorySubClass.WebMapService,
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    // Act
    const createResponse: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, iTwinId, newRepository);
    const createResponse2: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, iTwinId, newRepository);
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    expect(createResponse.status).toBe(201);
    expect(createResponse.data!.class).toBe(newRepository.class);
    expect(createResponse.data!.subClass).toBe(newRepository.subClass);
    expect(createResponse.data!.uri).toBe(newRepository.uri);
    expect(createResponse2.status).toBe(409);
    expect(createResponse2.data).toBeUndefined();
    expect(createResponse2.error).not.toBeUndefined();
    expect(createResponse2.error!.code).toBe("iTwinRepositoryExists");
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.data).toBeUndefined();
  });

  it("should get a 422 unprocessable entity when trying to create a repository without the uri property", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);

    const iTwinId = iTwinResponse.data!.id!;

    const newRepository: Repository = {
      class: RepositoryClass.GeographicInformationSystem,
      subClass: RepositorySubClass.WebMapService,
      uri: "",
    };

    // Act
    const createResponse: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, iTwinId, newRepository);
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    expect(createResponse.status).toBe(422);
    expect(createResponse.data).toBeUndefined();
    expect(createResponse.error).not.toBeUndefined();
    expect(createResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(createResponse.error!.details![0].code).toBe("MissingRequiredProperty");
    expect(createResponse.error!.details![0].target).toBe("uri");
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.data).toBeUndefined();
  });

  it("should get a 404 not found when trying to delete an repository that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      number: `APIM iTwin Test Number ${new Date().toISOString()}`,
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      status: "Trial",
    };
    const iTwinResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);

    const iTwinId = iTwinResponse.data!.id!;

    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteRepository(accessToken, iTwinId, someRandomId);
    const iTwinDeleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.data).toBeUndefined();
    expect(deleteResponse.error).not.toBeUndefined();
    expect(deleteResponse.error!.code).toBe("iTwinRepositoryNotFound");
    expect(iTwinDeleteResponse.status).toBe(204);
    expect(iTwinDeleteResponse.data).toBeUndefined();
  });
});

