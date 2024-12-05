/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as chai from "chai";
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsAccessClient } from "../../iTwinsClient";
import type { ITwin, ITwinsAPIResponse, Repository } from "../../iTwinsAccessProps";
import { ITwinClass } from "../../iTwinsAccessProps";
import { ITwinSubClass, RepositoryClass, RepositorySubClass } from "../../iTwinsAccessProps";
import { TestConfig } from "../TestConfig";

chai.should();
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

  before(async function () {
    this.timeout(0);
    accessToken = await TestConfig.getAccessToken();
  });

  it("should get a list of project iTwins with custom url", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken, ITwinSubClass.Project);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get a list of project iTwins without provided subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get a list of project iTwins with provided subClass inside arg", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsCustomClient.queryAsync(accessToken, undefined, {
        subClass: ITwinSubClass.Project,
      });

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualRepository) => {
      chai.expect(actualRepository.class).to.be.eq("iModels");
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
        subClass: RepositorySubClass.MapServer,
      }
    );

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualRepository) => {
      chai.expect(actualRepository.class).to.be.eq("GeographicInformationSystem");
      chai.expect(actualRepository.subClass).to.be.eq("MapServer");
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
    chai.expect(iTwinsResponse.status).to.be.eq(404);
    chai.expect(iTwinsResponse.data).to.be.undefined;
    chai.expect(iTwinsResponse.error!.code).to.be.eq("iTwinNotFound");
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
    chai.expect(iTwinsResponse.status).to.be.eq(422);
    chai.expect(iTwinsResponse.data).to.be.undefined;
    chai.expect(iTwinsResponse.error).to.not.be.undefined;
    chai.expect(iTwinsResponse.error!.code).to.be.eq("InvalidiTwinsRequest");
    chai.expect(iTwinsResponse.error!.details![0].code).to.be.eq("InvalidValue");
    chai.expect(iTwinsResponse.error!.details![0].target).to.be.eq("class");
  });

  it("should get a 404 when trying to get an iTwin", async () => {
    // Arrange
    const notAniTwinId = "22acf21e-0575-4faf-849b-bcd538718269";

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, notAniTwinId);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(404);
    chai.expect(iTwinsResponse.data).to.be.undefined;
    chai.expect(iTwinsResponse.error!.code).to.be.eq("iTwinNotFound");
  });

  it("should get a 422 when querying with an unsupported subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(
        accessToken,
        "Invalid" as ITwinSubClass
      );

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(422);
    chai.expect(iTwinsResponse.data).to.be.undefined;
    chai.expect(iTwinsResponse.error).to.not.be.undefined;
    chai.expect(iTwinsResponse.error!.code).to.be.eq("InvalidiTwinsRequest");
    chai
      .expect(iTwinsResponse.error!.details![0].code)
      .to.be.eq("InvalidValue");
    chai.expect(iTwinsResponse.error!.details![0].target).to.be.eq("subClass");
  });

  it("should get a list of project iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Project);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get a list of project iTwins without providing subClass", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get a project iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.id).to.be.eq(iTwinId);
    chai.expect(actualiTwin.class).to.be.eq("Endeavor");
    chai.expect(actualiTwin.subClass).to.be.eq("Project");
  });

  it("should get more project iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!, "representation");

    // Assert
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.parentId).to.be.a("string");
    chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
    chai.expect(actualiTwin.imageName).to.be.null;
    chai.expect(actualiTwin.image).to.be.null;
    chai.expect(actualiTwin.createdDateTime).to.be.a("string");
    chai.expect(actualiTwin.createdBy).to.be.a("string");
  });

  it("should get an account", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAccountAsync(accessToken, iTwinId!);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.id).to.not.be.eq(iTwinId); // should be a different entity
    chai.expect(actualiTwin.class).to.be.eq("Account");
    chai.expect(actualiTwin.subClass).to.be.eq("Account");
  });

  it("should get more details for an account in represenatation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_PROJECT_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAccountAsync(accessToken, iTwinId!, "representation");

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.id).to.not.be.eq(iTwinId); // should be a different entity
    chai.expect(actualiTwin.class).to.be.eq("Account");
    chai.expect(actualiTwin.subClass).to.be.eq("Account");
    chai.expect(actualiTwin.createdDateTime).to.be.a("string");
    chai.expect(actualiTwin.createdBy).to.be.a("string");
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
    chai.expect(accountResponse.status).to.be.eq(200);
    chai.expect(accountResponse.data).to.not.be.empty;
    const actualAccount = accountResponse.data!;
    chai.expect(actualAccount.id).to.not.be.eq(iTwinId); // should be a different entity
    chai.expect(actualAccount.class).to.be.eq("Account");
    chai.expect(actualAccount.subClass).to.be.eq("Account");

    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.id).to.be.eq(iTwinId);
    chai.expect(actualiTwin.class).to.be.eq("Endeavor");
    chai.expect(actualiTwin.subClass).to.be.eq("Project");

    chai.expect(actualiTwin.iTwinAccountId).to.be.eq(actualAccount.id);
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
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    chai.expect(iTwinsResponse.data!.length).to.be.eq(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
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
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    chai.expect(iTwinsResponse.data!.length).to.be.eq(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
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
      chai.expect(iTwinsResponse.data).to.not.be.empty;
      chai.expect(iTwinsResponse.data!.length).to.be.eq(pageSize);
      iTwinsResponse.data!.forEach((actualiTwin) => {
        chai.expect(actualiTwin.class).to.be.eq("Endeavor");
        chai.expect(actualiTwin.subClass).to.be.eq("Project");
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
    chai.expect(iTwins).to.not.be.empty;
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.displayName).to.be.eq(iTwinName);
      chai.expect(actualiTwin.class).to.be.eq(ITwinClass.Endeavor);
      chai.expect(actualiTwin.subClass).to.be.eq(ITwinSubClass.Project);
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
        // eslint-disable-next-line id-blacklist
        number: iTwinNumber,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    chai.expect(iTwins).to.not.be.empty;
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.number).to.be.eq(iTwinNumber);
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
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
    chai.expect(iTwins).to.not.be.empty;
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.displayName).to.be.contain(iTwinSearchString);
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
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
    chai.expect(iTwins).to.not.be.empty;

    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.parentId).to.be.a("string");
      chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
      chai.expect(actualiTwin.createdDateTime).to.be.a("string");
      chai.expect(actualiTwin.createdBy).to.be.a("string");
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
    chai.expect(iTwins).to.not.be.empty;
  });

  it("should get a list of recent project iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken,
        ITwinSubClass.Project
      );

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get a list of recent project iTwins without subClass query", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryRecentsAsync(
        accessToken
      );

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
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
    chai.expect(iTwins).to.not.be.empty;

    // All items have the field "createdDateTime"
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.parentId).to.be.a("string");
      chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
      chai.expect(actualiTwin.createdDateTime).to.be.a("string");
      chai.expect(actualiTwin.createdBy).to.be.a("string");
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
    });
  });

  it("should get a list of favorited project iTwins without subClass query", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryFavoritesAsync(
        accessToken
      );

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
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
    chai.expect(iTwinsResponse.data).to.not.be.empty;

    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.parentId).to.be.a("string");
      chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
      chai.expect(actualiTwin.createdDateTime).to.be.a("string");
      chai.expect(actualiTwin.createdBy).to.be.a("string");
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
    });
  });

  it("should get a list of asset iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Asset);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
  });

  it("should get more properties of asset iTwins in representation result mode", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Asset, { resultMode: "representation" });

    // Assert
    chai.expect(iTwinsResponse.data).to.not.be.empty;

    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.parentId).to.be.a("string");
      chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
      chai.expect(actualiTwin.createdDateTime).to.be.a("string");
      chai.expect(actualiTwin.createdBy).to.be.a("string");
    });
  });

  it("should get a asset iTwin", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(iTwinId).to.be.eq(actualiTwin.id);
  });

  it("should get more asset iTwin properties in representation result mode", async () => {
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;

    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getAsync(accessToken, iTwinId!, "representation");

    // Assert
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.parentId).to.be.a("string");
    chai.expect(actualiTwin.iTwinAccountId).to.be.a("string");
    chai.expect(actualiTwin.imageName).to.be.null;
    chai.expect(actualiTwin.image).to.be.null;
    chai.expect(actualiTwin.createdDateTime).to.be.a("string");
    chai.expect(actualiTwin.createdBy).to.be.a("string");
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
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    chai.expect(iTwinsResponse.data!.length).to.be.eq(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    chai.expect(iTwinsResponse.data!.length).to.be.eq(3);
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
      chai.expect(iTwinsResponse.data).to.not.be.empty;
      chai.expect(iTwinsResponse.data!.length).to.be.eq(pageSize);
      iTwinsResponse.data!.forEach((actualiTwin) => {
        chai.expect(actualiTwin.class).to.be.eq("Thing");
        chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwins).to.not.be.empty;
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.displayName).to.be.eq(iTwinName);
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
        // eslint-disable-next-line id-blacklist
        number: iTwinNumber,
      }
    );
    const iTwins = iTwinsResponse.data!;

    // Assert
    chai.expect(iTwins).to.not.be.empty;
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.number).to.be.eq(iTwinNumber);
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwins).to.not.be.empty;
    // All items match the name
    iTwins.forEach((actualiTwin) => {
      chai.expect(actualiTwin.displayName).to.be.contain(iTwinSearchString);
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
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
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    iTwinsResponse.data!.forEach((actualiTwin) => {
      chai.expect(actualiTwin.class).to.be.eq("Thing");
      chai.expect(actualiTwin.subClass).to.be.eq("Asset");
    });
  });

  it("should get the primary account iTwin", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.getPrimaryAccountAsync(accessToken);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
    const actualiTwin = iTwinsResponse.data!;
    chai.expect(actualiTwin.id).to.not.be.empty;
  });

  it("should create, update, and delete an iTwin", async () => {
    /* CREATE THE ITWIN */
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    // eslint-disable-next-line no-console
    const iTwinId = createResponse.data!.id!;

    // Assert
    chai.expect(createResponse.status).to.be.eq(201);
    chai.expect(createResponse.data!.displayName).to.be.eq(newiTwin.displayName);
    chai.expect(createResponse.data!.class).to.be.eq(newiTwin.class);
    chai.expect(createResponse.data!.subClass).to.be.eq(newiTwin.subClass);

    /* UPDATE ITWIN */
    // Arrange
    const updatediTwin: ITwin = {
      displayName: "UPDATED APIM iTwin Test Display Name",
    };

    // Act
    const updateResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.updateiTwin(accessToken, iTwinId, updatediTwin);

    // Assert
    chai.expect(updateResponse.status).to.be.eq(200);
    chai.expect(updateResponse.data!.displayName).to.be.eq(updatediTwin.displayName);

    /* DELETE ITWIN */
    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    chai.expect(deleteResponse.status).to.be.eq(204);
    chai.expect(deleteResponse.data).to.be.undefined;
  });

  it("should create and delete an iTwin Repository", async () => {
    /* CREATE THE ITWIN REPOSITORY */
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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

    // eslint-disable-next-line no-console
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
    chai.expect(createResponse.status).to.be.eq(201);
    chai.expect(createResponse.data!.class).to.be.eq(newRepository.class);
    chai.expect(createResponse.data!.subClass).to.be.eq(newRepository.subClass);
    chai.expect(createResponse.data!.uri).to.be.eq(newRepository.uri);

    /* DELETE ITWIN REPOSITORY */
    // Act
    const repositoryDeleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteRepository(accessToken, iTwinId, createResponse.data!.id!);

    const iTwinDeleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);

    // Assert
    chai.expect(repositoryDeleteResponse.status).to.be.eq(204);
    chai.expect(repositoryDeleteResponse.data).to.be.undefined;
    chai.expect(iTwinDeleteResponse.status).to.be.eq(204);
    chai.expect(iTwinDeleteResponse.data).to.be.undefined;
  });

  it("should get a 409 conflict when trying to create a duplicate", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    chai.expect(iTwinResponse.status).to.be.eq(201);
    chai.expect(iTwinResponse2.status).to.be.eq(409);
    chai.expect(iTwinResponse2.data).to.be.undefined;
    chai.expect(iTwinResponse2.error).to.not.be.undefined;
    chai.expect(iTwinResponse2.error!.code).to.be.eq("iTwinExists");
    chai.expect(iTwinResponse2.error!.details![0].code).to.be.eq("InvalidValue");
    chai.expect(iTwinResponse2.error!.details![0].target).to.be.eq("number");
    chai.expect(deleteResponse.status).to.be.eq(204);
    chai.expect(deleteResponse.data).to.be.undefined;
  });

  it("should get a 422 unprocessable entity when trying to create an iTwin without a class specified", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    chai.expect(iTwinResponse.status).to.be.eq(422);
    chai.expect(iTwinResponse.data).to.be.undefined;
    chai.expect(iTwinResponse.error).to.not.be.undefined;
    chai.expect(iTwinResponse.error!.code).to.be.eq("InvalidiTwinsRequest");
    chai.expect(iTwinResponse.error!.details![0].code).to.be.eq("MissingRequiredProperty");
    chai.expect(iTwinResponse.error!.details![0].target).to.be.eq("class");
  });

  it("should get a 404 not found when trying to delete an iTwin that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";

    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteiTwin(accessToken, someRandomId);

    // Assert
    chai.expect(deleteResponse.status).to.be.eq(404);
    chai.expect(deleteResponse.data).to.be.undefined;
    chai.expect(deleteResponse.error).to.not.be.undefined;
    chai.expect(deleteResponse.error!.code).to.be.eq("iTwinNotFound");
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
    chai.expect(createResponse.status).to.be.eq(404);
    chai.expect(createResponse.data).to.be.undefined;
    chai.expect(createResponse.error).to.not.be.undefined;
    chai.expect(createResponse.error!.code).to.be.eq("iTwinNotFound");
  });

  it("should get a 409 conflict when trying to create a duplicate repository", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    chai.expect(createResponse.status).to.be.eq(201);
    chai.expect(createResponse.data!.class).to.be.eq(newRepository.class);
    chai.expect(createResponse.data!.subClass).to.be.eq(newRepository.subClass);
    chai.expect(createResponse.data!.uri).to.be.eq(newRepository.uri);
    chai.expect(createResponse2.status).to.be.eq(409);
    chai.expect(createResponse2.data).to.be.undefined;
    chai.expect(createResponse2.error).to.not.be.undefined;
    chai.expect(createResponse2.error!.code).to.be.eq("iTwinRepositoryExists");
    chai.expect(deleteResponse.status).to.be.eq(204);
    chai.expect(deleteResponse.data).to.be.undefined;
  });

  it("should get a 422 unprocessable entity when trying to create a repository without the uri property", async () => {
    // Arrange
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    chai.expect(createResponse.status).to.be.eq(422);
    chai.expect(createResponse.data).to.be.undefined;
    chai.expect(createResponse.error).to.not.be.undefined;
    chai.expect(createResponse.error!.code).to.be.eq("InvalidiTwinsRequest");
    chai.expect(createResponse.error!.details![0].code).to.be.eq("MissingRequiredProperty");
    chai.expect(createResponse.error!.details![0].target).to.be.eq("uri");
    chai.expect(deleteResponse.status).to.be.eq(204);
    chai.expect(deleteResponse.data).to.be.undefined;
  });

  it("should get a 404 not found when trying to delete an repository that doesn't exist", async () => {
    // Arrange
    const someRandomId = "ffd3dc75-0b4a-4587-b428-4c73f5d6dbb4";
    const newiTwin: ITwin = {
      displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
      // eslint-disable-next-line id-blacklist
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
    chai.expect(deleteResponse.status).to.be.eq(404);
    chai.expect(deleteResponse.data).to.be.undefined;
    chai.expect(deleteResponse.error).to.not.be.undefined;
    chai.expect(deleteResponse.error!.code).to.be.eq("iTwinRepositoryNotFound");
    chai.expect(iTwinDeleteResponse.status).to.be.eq(204);
    chai.expect(iTwinDeleteResponse.data).to.be.undefined;
  });
});
