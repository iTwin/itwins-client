# iTwins Client Library

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

[iTwin.js](http://www.itwinjs.org) is an open source platform for creating, querying, modifying, and displaying Infrastructure Digital Twins. To learn more about the iTwin Platform and its APIs, visit the [iTwin developer portal](https://developer.bentley.com/).

If you have questions, or wish to contribute to iTwin.js, see our [Contributing guide](./CONTRIBUTING.md).

## About this Repository

Contains the **@itwin/itwins-client** package that wraps sending requests to the iTwins service. Visit the [iTwins API](https://developer.bentley.com/apis/itwins/) for more documentation on the iTwins service.

## Usage examples

### Get list of iTwins

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import {
  ITwinsAccessClient,
  ITwin,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
    await iTwinsAccessClient.queryAsync(accessToken, "Project");

  iTwinsResponse.data!.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get paged list of iTwins using top/skip

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import {
  ITwinsAccessClient,
  ITwin,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
    await iTwinsAccessClient.queryAsync(accessToken, "Project", {
      top: 25,
      skip: 13,
    });

  iTwinsResponse.data!.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get iTwin by Id

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import {
  ITwinsAccessClient,
  ITwin,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";

/** Function that gets iTwin by id and prints the id and displayName. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: ITwinsAPIResponse<ITwin> =
    await iTwinsAccessClient.getAsync(
      accessToken,
      "3865240b-cfd9-4ba1-a9e5-65e8813d006b"
    );
  const actualiTwin = iTwinsResponse.data!;
  console.log(actualiTwin.id, actualiTwin.displayName);
}
```

### Get list of Repositories by iTwin Id

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import {
  ITwinsAccessClient,
  Repository,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: ITwinsAPIResponse<Repository[]> =
    await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      "e36e29fa-11c0-4ac8-9ead-e8678ebc393c"
    );

  iTwinsResponse.data!.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

### Get list of Repositories by iTwin Id, Class, and Sub Class

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import {
  ITwinsAccessClient,
  Repository,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: ITwinsAPIResponse<Repository[]> =
    await iTwinsAccessClient.queryRepositoriesAsync(
      accessToken,
      "e36e29fa-11c0-4ac8-9ead-e8678ebc393c",
      {
        class: "GeographicInformationSystem",
        subClass: "MapServer",
      }
    );

  iTwinsResponse.data!.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

### Create, Update, and Delete an iTwin

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import type { ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";
import {
  ITwinsAccessClient,
  ITwinClass,
  ITwinSubClass,
} from "@itwin/itwins-client";

/** Function that creates, updates, and then deletes an iTwin. */
async function demoCRUD(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  /* Create the iTwin */
  const newiTwin: ITwin = {
    displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
    number: `APIM iTwin Test Number ${new Date().toISOString()}`,
    type: "Bridge",
    subClass: ITwinSubClass.Asset,
    class: ITwinClass.Thing,
    dataCenterLocation: "East US",
    status: "Trial",
  };
  const createResponse: ITwinsAPIResponse<ITwin> =
    await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
  const iTwinId = createResponse.data!.id;

  /* Update the iTwin */
  const updatediTwin: ITwin = {
    displayName: "UPDATED APIM iTwin Test Display Name",
  };
  const updateResponse: ITwinsAPIResponse<ITwin> =
    await iTwinsAccessClient.updateiTwin(accessToken, iTwinId, updatediTwin);

  /* Delete the iTwin */
  const deleteResponse: ITwinsAPIResponse<undefined> =
    await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
}
```

### Create and Delete an iTwin Repository

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import type {
  ITwin,
  Repository,
  ITwinsAPIResponse,
} from "@itwin/itwins-client";
import {
  ITwinsAccessClient,
  ITwinClass,
  ITwinSubClass,
  RepositoryClass,
  RepositorySubClass,
} from "@itwin/itwins-client";

/** Function that creates, updates, and then deletes an iTwin. */
async function demoCRUD(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  /* Create the iTwin Repository */
  // Create an iTwin first
  const newiTwin: ITwin = {
    displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
    number: `APIM iTwin Test Number ${new Date().toISOString()}`,
    type: "Bridge",
    subClass: ITwinSubClass.Asset,
    class: ITwinClass.Thing,
    dataCenterLocation: "East US",
    status: "Trial",
  };
  const createResponse: ITwinsAPIResponse<ITwin> =
    await iTwinsAccessClient.createiTwin(accessToken, newiTwin);
  const iTwinId = createResponse.data!.id;

  // Now create the iTwin Repository
  const newRepository: Repository = {
    class: RepositoryClass.GeographicInformationSystem,
    subClass: RepositorySubClass.WebMapService,
    uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
  };
  const createResponse: ITwinsAPIResponse<Repository> =
    await iTwinsAccessClient.createRepository(
      accessToken,
      iTwinId,
      newRepository
    );

  /* Delete the iTwin Repository */
  const repositoryDeleteResponse: ITwinsAPIResponse<undefined> =
    await iTwinsAccessClient.deleteRepository(
      accessToken,
      iTwinId,
      createResponse.data!.id
    );
  // Cleanup:  deleting iTwin
  const iTwinDeleteResponse: ITwinsAPIResponse<undefined> =
    await iTwinsAccessClient.deleteiTwin(accessToken, iTwinId);
}
```

## Contributing to this Repository

For information on how to contribute to this project, please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, [GETTINGSTARTED.md](GETTINGSTARTED.md) for information on working with the documentation in this repository.
