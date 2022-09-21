/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as chai from "chai";
import type { AccessToken} from "@itwin/core-bentley";
import { ITwinsAccessClient } from "../../iTwinsClient";
import type { ITwin, ITwinsAPIResponse, NewiTwin, NewRepository, Repository} from "../../iTwinsAccessProps";
import { ITwinClass} from "../../iTwinsAccessProps";
import { ITwinSubClass, RepositoryClass, RepositorySubClass} from "../../iTwinsAccessProps";
import { TestConfig } from "../TestConfig";

chai.should();
describe("iTwinsClient", () => {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = await TestConfig.getAccessToken();
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
    const iTwinsResponse:  ITwinsAPIResponse<Repository[]> = await iTwinsAccessClient.queryRepositoriesAsync(
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
    const iTwinsResponse:  ITwinsAPIResponse<Repository[]> = await iTwinsAccessClient.queryRepositoriesAsync(
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
      chai.expect(actualiTwin.class).to.be.eq("Endeavor");
      chai.expect(actualiTwin.subClass).to.be.eq("Project");
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

  it("should get a list of asset iTwins", async () => {
    // Act
    const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
      await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Asset);

    // Assert
    chai.expect(iTwinsResponse.status).to.be.eq(200);
    chai.expect(iTwinsResponse.data).to.not.be.empty;
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

  it("should create and delete an iTwin Repository", async () =>{
    /* CREATE THE ITWIN REPOSITORY */
    // Arrange
    const iTwinId = process.env.IMJS_TEST_ASSET_ID;
    const newRepository: NewRepository = {
      class: RepositoryClass.GeographicInformationSystem,
      subClass: RepositorySubClass.WebMapService,
      uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
    };

    // Act
    const createResponse: ITwinsAPIResponse<Repository> =
      await iTwinsAccessClient.createRepository(accessToken, iTwinId!, newRepository);

    // Assert
    chai.expect(createResponse.status).to.be.eq(201);
    chai.expect(createResponse.data!.class).to.be.eq(newRepository.class);
    chai.expect(createResponse.data!.subClass).to.be.eq(newRepository.subClass);
    chai.expect(createResponse.data!.uri).to.be.eq(newRepository.uri);

    /* DELETE ITWIN REPOSITORY */
    // Act
    const deleteResponse: ITwinsAPIResponse<undefined> =
      await iTwinsAccessClient.deleteRepository(accessToken, iTwinId!, createResponse.data!.id);

    // Assert
    chai.expect(deleteResponse.status).to.be.eq(204);
    chai.expect(deleteResponse.data).to.be.undefined;
  });

  it("should create, update, and delete an iTwin", async () =>{
    /* CREATE THE ITWIN */
    // Arrange
    const newiTwin: NewiTwin = {
      displayName: "APIM iTwin Test Display Name dlfjalsdfasf",
      // eslint-disable-next-line id-blacklist
      number: "APIM iTwin Test Number fjkdlsfjlsadfdas",
      type: "Bridge",
      subClass: ITwinSubClass.Asset,
      class: ITwinClass.Thing,
      dataCenterLocation: "East US",
      status: "Trial",
    };

    // Act
    const createResponse: ITwinsAPIResponse<ITwin> =
      await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
    // eslint-disable-next-line no-console
    const iTwinId = createResponse.data!.id;

    // Assert
    chai.expect(createResponse.status).to.be.eq(201);
    chai.expect(createResponse.data!.displayName).to.be.eq(newiTwin.displayName);
    chai.expect(createResponse.data!.class).to.be.eq(newiTwin.class);
    chai.expect(createResponse.data!.subClass).to.be.eq(newiTwin.subClass);

    /* UPDATE ITWIN */
    // Arrange
    const updatediTwin: NewiTwin = {
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
});
