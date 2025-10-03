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
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, { subClass: "Project" });

  iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get list of iTwins (constructor supplied base url)

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient("https://api.bentley.com/itwins");
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, { subClass: "Project" });

  iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get paged list of iTwins using top/skip

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, {
      subClass: "Project",
      top: 25,
      skip: 13,
    });

  iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get iTwin by Id

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that gets iTwin by id and prints the id and displayName. */
async function printiTwinDetails(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: BentleyAPIResponse<ITwinMinimalResponse> =
    await iTwinsClient.getITwin(
      accessToken,
      "3865240b-cfd9-4ba1-a9e5-65e8813d006b"
    );
  const actualiTwin = iTwinsResponse.data!.iTwin;
  console.log(actualiTwin.id, actualiTwin.displayName);
}
```

### Get list of Repositories by iTwin Id

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiRepositoriesResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printRepositoryIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const repositoriesResponse: BentleyAPIResponse<MultiRepositoriesResponse> =
    await iTwinsClient.getRepositories(
      accessToken,
      "e36e29fa-11c0-4ac8-9ead-e8678ebc393c"
    );

  repositoriesResponse.data!.repositories.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

### Get list of Repositories by iTwin Id, Class, and Sub Class

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiRepositoriesResponse,
} from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printRepositoryIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const repositoriesResponse: BentleyAPIResponse<MultiRepositoriesResponse> =
    await iTwinsClient.getRepositories(
      accessToken,
      "e36e29fa-11c0-4ac8-9ead-e8678ebc393c",
      {
        class: "GeographicInformationSystem",
        subClass: "WebMapService",
      }
    );

  repositoriesResponse.data!.repositories.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

### Environment Configuration with globalThis.IMJS_URL_PREFIX

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates environment configuration for different deployment environments. */
async function configureEnvironment(): Promise<void> {
  // Set URL prefix for different environments
  // This works in both Node.js and browser environments
  globalThis.IMJS_URL_PREFIX = "dev-";  // For development environment
  // globalThis.IMJS_URL_PREFIX = "qa-";   // For QA environment
  // globalThis.IMJS_URL_PREFIX = undefined; // For production environment

  // Client will automatically use the configured environment
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  // This will now hit dev-api.bentley.com/itwins instead of api.bentley.com/itwins
  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, { subClass: "Project" });

  console.log(`Fetched ${iTwinsResponse.data!.iTwins.length} iTwins from development environment`);
}

/** Alternative: Configure environment from process.env in Node.js applications */
function configureFromEnvironment(): void {
  // In test files or Node.js applications, you can bridge from process.env
  globalThis.IMJS_URL_PREFIX = process.env.IMJS_URL_PREFIX;

  // Now all iTwins client instances will use the configured environment
  const iTwinsClient: ITwinsClient = new ITwinsClient();
}
```

### Create, Update, and Delete an iTwin

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ItwinCreate,
  ItwinUpdate,
  ITwinRepresentationResponse,
} from "@itwin/itwins-client";

/** Function that creates, updates, and then deletes an iTwin. */
async function demoCRUD(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  /* Create the iTwin */
  const newiTwin: ItwinCreate = {
    displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
    number: `APIM iTwin Test Number ${new Date().toISOString()}`,
    type: "Bridge",
    subClass: "Asset",
    class: "Thing",
    dataCenterLocation: "East US",
    status: "Trial",
  };
  const createResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await iTwinsClient.createITwin(accessToken, newiTwin);
  const iTwinId = createResponse.data!.iTwin.id;

  /* Update the iTwin */
  const updatediTwin: ItwinUpdate = {
    displayName: "UPDATED APIM iTwin Test Display Name",
  };
  const updateResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await iTwinsClient.updateItwin(accessToken, iTwinId, updatediTwin);

  /* Delete the iTwin */
  const deleteResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteItwin(accessToken, iTwinId);
}
```

### Create and Delete an iTwin Repository

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ItwinCreate,
  ITwinRepresentationResponse,
  Repository,
  SingleRepositoryResponse,
} from "@itwin/itwins-client";

/** Function that creates an iTwin, creates a repository, then deletes both. */
async function demoCRUD(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  /* Create the iTwin Repository */
  // Create an iTwin first
  const newiTwin: ItwinCreate = {
    displayName: `APIM iTwin Test Display Name ${new Date().toISOString()}`,
    number: `APIM iTwin Test Number ${new Date().toISOString()}`,
    type: "Bridge",
    subClass: "Asset",
    class: "Thing",
    dataCenterLocation: "East US",
    status: "Trial",
  };
  const createResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await iTwinsClient.createITwin(accessToken, newiTwin);
  const iTwinId = createResponse.data!.iTwin.id;

  // Now create the iTwin Repository
  const newRepository: Omit<Repository, "id"> = {
    class: "GeographicInformationSystem",
    subClass: "WebMapService",
    uri: "https://www.sciencebase.gov/arcgis/rest/services/Catalog/5888bf4fe4b05ccb964bab9d/MapServer",
  };
  const repositoryCreateResponse: BentleyAPIResponse<SingleRepositoryResponse> =
    await iTwinsClient.createRepository(
      accessToken,
      iTwinId,
      newRepository
    );

  /* Delete the iTwin Repository */
  const repositoryDeleteResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteRepository(
      accessToken,
      iTwinId,
      repositoryCreateResponse.data!.repository.id
    );
  // Cleanup: deleting iTwin
  const iTwinDeleteResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteItwin(accessToken, iTwinId);
}
```

### Get iTwins with Enhanced ODATA Query

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinRepresentationResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates enhanced query capabilities with OData parameters. */
async function advancedQuery(): Promise<void> {
  const iTwinsClient: ITwinsClient = new iTwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinRepresentationResponse> =
    await iTwinsClient.getITwins(accessToken, {
      subClass: "Project",
      resultMode: "representation",
      filter: "status eq 'Active'",
      orderby: "displayName asc",
      select: "id,displayName,status,createdDateTime",
      top: 10,
    });

  // Access iTwins data
  const iTwins = iTwinsResponse.data!.iTwins;

  // Access HAL navigation links
  const links = iTwinsResponse.data!._links;
  console.log("Self link:", links.self?.href);
  console.log("Next page:", links.next?.href);

  iTwins.forEach((itwin) => {
    console.log(`${itwin.displayName} (${itwin.status}) - Created: ${itwin.createdDateTime}`);
  });
}
```

### Upload and Manage iTwin Images

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinImageResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates image management capabilities. */
async function manageImages(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };
  const iTwinId = "your-itwin-id";

  // Upload an image
  const imageFile = new File([/* your image data */], "itwin-image.png", { type: "image/png" });
  const uploadResponse: BentleyAPIResponse<ITwinImageResponse> =
    await iTwinsClient.uploadITwinImage(accessToken, iTwinId, imageFile, "image/png");

  console.log("Image uploaded:", uploadResponse.data!.image.id);

  // Get the image
  const getResponse: BentleyAPIResponse<ITwinImageResponse> =
    await iTwinsClient.getITwinImage(accessToken, iTwinId);

  console.log("Retrieved image:", getResponse.data!.image.url);

  // Delete the image
  await iTwinsClient.deleteITwinImage(accessToken, iTwinId);
  console.log("Image deleted");
}
```

### Work with Favorites and Recents

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates favorites and recents management. */
async function manageFavoritesAndRecents(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { get_access_token_logic_here };
  const iTwinId = "your-itwin-id";

  // Add to favorites
  await iTwinsClient.addITwinToFavorites(accessToken, iTwinId);

  // Add to recents
  await iTwinsClient.addITwinToMyRecents(accessToken, iTwinId);

  // Get favorite iTwins
  const favoritesResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getFavoritesITwins(accessToken, { subClass: "Project" });

  console.log("Favorite iTwins:", favoritesResponse.data!.iTwins.length);

  // Get recent iTwins
  const recentsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getRecentUsedITwins(accessToken);

  console.log("Recent iTwins:", recentsResponse.data!.iTwins.length);

  // Remove from favorites
  await iTwinsClient.removeITwinFromFavorites(accessToken, iTwinId);
}
```

## Migration Guides

When upgrading between major versions of the iTwins Client, please refer to the appropriate migration guide for detailed instructions and breaking changes:

### Current Migration Guides

- **[v1.x.x to v2.x.x Migration Guide](MIGRATION-GUIDE-v1-to-v2.md)** - Complete guide for upgrading from v1 to v2, including API changes, type updates, and new features

### Future Migration Guides

Future migration guides will be added here as new major versions are released. Each guide will include:

- Breaking changes and their rationale
- Step-by-step migration instructions
- Code examples showing before/after patterns
- New features and capabilities
- Deprecation notices and timelines

## Contributing to this Repository

For information on how to contribute to this project, please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, [GETTINGSTARTED.md](GETTINGSTARTED.md) for information on working with the documentation in this repository.

### Versioning with Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to manage package versioning and changelogs. When making changes that affect the public API or behavior, please add a changeset by running:

```shell
pnpm changeset
```

Follow the prompts to describe your changes and select the appropriate version bump (major, minor, or patch). Versioning should follow [semver](https://semver.org/) conventions. If no version bump is required (such as for documentation-only changes), use `npx changeset --empty`.

When changesets are added and merged into the main branch, a release pull request (PR) will be automatically created by the Changesets GitHub Action. This PR will contain the version updates and changelog entries generated from your changesets. Review the release PR to ensure the version bumps and changelog messages are accurate before merging. Once the release PR is merged, the new package version will be published automatically.

For more details, see the [Changesets documentation](https://github.com/changesets/changesets/blob/main/README.md) and [Publish Readme](publish_readme.md)