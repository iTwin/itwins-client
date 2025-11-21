# iTwins Client Usage Examples

This document provides comprehensive examples for using the iTwins Client library. All examples assume you have a valid `AccessToken` from `@itwin/core-bentley`.

## Table of Contents

- [Basic Operations](#basic-operations)
- [iTwins Management](#itwins-management)
- [Repository Operations](#repository-operations)
- [Export Operations](#export-operations)
- [Image Management](#image-management)
- [Favorites and Recents](#favorites-and-recents)
- [Account Operations](#account-operations)
- [Advanced Queries](#advanced-queries)
- [Environment Configuration](#environment-configuration)
- [Error Handling](#error-handling)

## Basic Operations

### Get List of iTwins

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, { subClass: "Project" });

  iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get iTwin by ID

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const iTwinsResponse: BentleyAPIResponse<ITwinMinimalResponse> =
    await iTwinsClient.getITwin(
      accessToken,
      "3865240b-cfd9-4ba1-a9e5-65e8813d006b"
    );
  const actualiTwin = iTwinsResponse.data!.iTwin;
  console.log(actualiTwin.id, actualiTwin.displayName);
}
```

### Pagination with Top/Skip

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates pagination using top/skip parameters. */
async function paginatedQuery(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

## iTwins Management

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

  // Act
  const createResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await iTwinsClient.createITwin(accessToken, newiTwin);
  const iTwinId = createResponse.data!.iTwin.id;

  console.log("Created iTwin:", iTwinId);

  /* Update the iTwin */
  const updatediTwin: ItwinUpdate = {
    displayName: `Updated ${newiTwin.displayName}`,
    status: "Active",
  };

  const updateResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await iTwinsClient.updateItwin(accessToken, iTwinId, updatediTwin);

  console.log("Updated iTwin:", updateResponse.data!.iTwin.displayName);

  /* Delete the iTwin */
  const deleteResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteItwin(accessToken, iTwinId);

  console.log("Deleted iTwin, status:", deleteResponse.status);
}
```

## Repository Operations

### Get Repositories by iTwin ID

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

### Filter Repositories by Class and SubClass

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiRepositoriesResponse,
} from "@itwin/itwins-client";

/** Function that queries filtered repositories. */
async function printFilteredRepositoryIds(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

### Create and Delete Repository

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
async function demoRepositoryCRUD(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  /* Create an iTwin first */
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

  /* Create the iTwin Repository */
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

  const repositoryId = repositoryCreateResponse.data!.repository.id;

  console.log("Created repository:", repositoryId);

  /* Delete the iTwin Repository */
  const repositoryDeleteResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteRepository(
      accessToken,
      iTwinId,
      repositoryId
    );

  console.log("Deleted repository, status:", repositoryDeleteResponse.status);

  /* Delete the iTwin */
  const deleteITwinResponse: BentleyAPIResponse<undefined> =
    await iTwinsClient.deleteItwin(accessToken, iTwinId);

  console.log("Deleted iTwin, status:", deleteITwinResponse.status);
}
```

### Get Single Repository Details

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  SingleRepositoryResponse,
} from "@itwin/itwins-client";

/** Function that gets details of a specific repository. */
async function getRepositoryDetails(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const response: BentleyAPIResponse<SingleRepositoryResponse> =
    await client.getRepository(
      accessToken,
      "your-itwin-id",
      "your-repository-id"
    );

  if (response.error) {
    console.error("Error fetching repository:", response.error.message);
    return;
  }

  const repo = response.data!.repository;
  console.log(`Repository: ${repo.displayName || repo.id}`);
  console.log(`Class: ${repo.class}, SubClass: ${repo.subClass}`);
  console.log(`URI: ${repo.uri}`);

  if (repo.capabilities) {
    console.log(`Capabilities: ${repo.capabilities.join(", ")}`);
  }
}
```

### Update Repository

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  SingleRepositoryResponse,
  Repository,
} from "@itwin/itwins-client";

/** Function that updates repository properties. */
async function updateRepository(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const updates: Partial<Omit<Repository, "id" | "class" | "subClass" | "capabilities">> = {
    displayName: "Updated Repository Name",
    description: "Updated repository description",
    uri: "https://updated-service-url.com/service"
  };

  const response: BentleyAPIResponse<SingleRepositoryResponse> =
    await client.updateRepository(
      accessToken,
      "your-itwin-id",
      "your-repository-id",
      updates
    );

  if (response.error) {
    console.error("Error updating repository:", response.error.message);
    return;
  }

  const repo = response.data!.repository;
  console.log(`Repository updated: ${repo.displayName}`);
  console.log(`New description: ${repo.description}`);
}
```

### Repository Resource Operations

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  PostRepositoryResourceResponse,
  GetRepositoryResourceMinimalResponse,
  GetMultiRepositoryResourceMinimalResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates repository resource CRUD operations. */
async function manageRepositoryResources(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
  const iTwinId = "your-itwin-id";
  const repositoryId = "your-geo-info-system-repository-id";

  // Create a repository resource
  const newResource = {
    id: "resource-identifier",
    displayName: "My Geographic Resource"
  };

  const createResponse: BentleyAPIResponse<PostRepositoryResourceResponse> =
    await client.createRepositoryResource(accessToken, iTwinId, repositoryId, newResource);

  if (createResponse.error) {
    console.error("Error creating resource:", createResponse.error.message);
    return;
  }

  console.log("Resource created:", createResponse.data!.resource.id);

  // Get all repository resources
  const getAllResponse: BentleyAPIResponse<GetMultiRepositoryResourceMinimalResponse> =
    await client.getRepositoryResources(accessToken, iTwinId, repositoryId, {
      search: "geographic",
      top: 10
    });

  if (getAllResponse.error) {
    console.error("Error fetching resources:", getAllResponse.error.message);
    return;
  }

  console.log(`Found ${getAllResponse.data!.resources.length} resources`);

  // Get specific resource details
  const getResponse: BentleyAPIResponse<GetRepositoryResourceMinimalResponse> =
    await client.getRepositoryResource(
      accessToken,
      iTwinId,
      repositoryId,
      newResource.id
    );

  if (getResponse.error) {
    console.error("Error fetching resource details:", getResponse.error.message);
    return;
  }

  console.log(`Resource details: ${getResponse.data!.resource.displayName}`);

  // Delete the repository resource
  const deleteResponse: BentleyAPIResponse<undefined> =
    await client.deleteRepositoryResource(
      accessToken,
      iTwinId,
      repositoryId,
      newResource.id
    );

  if (deleteResponse.error) {
    console.error("Error deleting resource:", deleteResponse.error.message);
    return;
  }

  console.log("Resource deleted successfully");
}
```

### Repository Resources with Different Result Modes

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  GetRepositoryResourceRepresentationResponse,
  GetMultiRepositoryResourceRepresentationResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates getting repository resources with detailed information. */
async function getDetailedRepositoryResources(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
  const iTwinId = "your-itwin-id";
  const repositoryId = "your-repository-id";
  const resourceId = "your-resource-id";

  // Get detailed information about a specific resource
  const detailedResponse: BentleyAPIResponse<GetRepositoryResourceRepresentationResponse> =
    await client.getRepositoryResource(
      accessToken,
      iTwinId,
      repositoryId,
      resourceId,
      "representation"
    );

  if (detailedResponse.error) {
    console.error("Error fetching detailed resource:", detailedResponse.error.message);
    return;
  }

  const resource = detailedResponse.data!.resource;
  console.log(`Resource: ${resource.displayName}`);
  console.log(`Created: ${resource.createdDateTime}`);
  console.log(`Modified: ${resource.lastModified}`);
  console.log(`Size: ${resource.size} bytes`);

  // Get all resources with detailed information
  const allDetailedResponse: BentleyAPIResponse<GetMultiRepositoryResourceRepresentationResponse> =
    await client.getRepositoryResources(
      accessToken,
      iTwinId,
      repositoryId,
      { top: 5 },
      "representation"
    );

  if (allDetailedResponse.error) {
    console.error("Error fetching detailed resources:", allDetailedResponse.error.message);
    return;
  }

  const resources = allDetailedResponse.data!.resources;
  console.log(`\nFound ${resources.length} detailed resources:`);
  resources.forEach((res) => {
    console.log(`- ${res.displayName} (${res.size} bytes, modified: ${res.lastModified})`);
  });
}
```

## Advanced Queries

### Enhanced OData Query

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  MultiITwinRepresentationResponse,
} from "@itwin/itwins-client";

/** Function that demonstrates enhanced query capabilities with OData parameters. */
async function advancedQuery(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

## Export Operations

### Get All Exports for User

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinExportMultiResponse,
} from "@itwin/itwins-client";

/** Function that gets all export operations for the current user. */
async function getAllExports(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const response: BentleyAPIResponse<ITwinExportMultiResponse> =
    await client.getExports(accessToken);

  if (response.error) {
    console.error("Error fetching exports:", response.error.message);
    return;
  }

  const exports = response.data!.exports;
  console.log(`Found ${exports.length} export operations`);

  exports.forEach((exportOp) => {
    console.log(`Export ${exportOp.id}: ${exportOp.status} - ${exportOp.createdDateTime}`);
  });
}
```

### Get Specific Export Details

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinExportSingleResponse,
} from "@itwin/itwins-client";

/** Function that gets details of a specific export operation. */
async function getExportDetails(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
  const exportId = "your-export-id";

  const response: BentleyAPIResponse<ITwinExportSingleResponse> =
    await client.getExport(accessToken, exportId);

  if (response.error) {
    console.error("Error fetching export:", response.error.message);
    return;
  }

  const exportOp = response.data!.export;
  console.log(`Export Status: ${exportOp.status}`);
  console.log(`Created: ${exportOp.createdDateTime}`);

  if (exportOp.downloadUrl) {
    console.log(`Download URL: ${exportOp.downloadUrl}`);
  }

  if (exportOp.errorMessage) {
    console.log(`Error: ${exportOp.errorMessage}`);
  }
}
```

### Create New Export Operation

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinExportRequestInfo,
  ITwinExportSingleResponse,
} from "@itwin/itwins-client";

/** Function that creates a new export operation for an iTwin. */
async function createExport(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const exportRequest: ITwinExportRequestInfo = {
    iTwinId: "your-itwin-id",
    exportType: "CSV", // or "3SM"
    geometryOptions: {
      includeSourceGeometry: true,
      chordTolerance: 0.1
    }
  };

  const response: BentleyAPIResponse<ITwinExportSingleResponse> =
    await client.createExport(accessToken, exportRequest);

  if (response.error) {
    console.error("Error creating export:", response.error.message);
    return;
  }

  const exportOp = response.data!.export;
  console.log(`Export created with ID: ${exportOp.id}`);
  console.log(`Status: ${exportOp.status}`);

  // Poll for completion
  await pollExportStatus(client, accessToken, exportOp.id);
}

async function pollExportStatus(
  client: ITwinsClient,
  accessToken: AccessToken,
  exportId: string
): Promise<void> {
  let completed = false;

  while (!completed) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    const response = await client.getExport(accessToken, exportId);
    if (response.error) {
      console.error("Error checking export status:", response.error.message);
      break;
    }

    const exportOp = response.data!.export;
    console.log(`Export status: ${exportOp.status}`);

    if (exportOp.status === "Complete") {
      console.log(`Export completed! Download URL: ${exportOp.downloadUrl}`);
      completed = true;
    } else if (exportOp.status === "Failed") {
      console.error(`Export failed: ${exportOp.errorMessage}`);
      completed = true;
    }
  }
}
```

## Image Management

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
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

## Favorites and Recents

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
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

## Account Operations

### Get Primary Account

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinMinimalResponse,
} from "@itwin/itwins-client";

/** Function that gets the primary account for the current user. */
async function getPrimaryAccount(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const response: BentleyAPIResponse<ITwinMinimalResponse> =
    await client.getPrimaryAccount(accessToken);

  if (response.error) {
    console.error("Error fetching primary account:", response.error.message);
    return;
  }

  const account = response.data!.iTwin;
  console.log(`Primary Account: ${account.displayName}`);
  console.log(`Account ID: ${account.id}`);
  console.log(`Account Type: ${account.type}`);
  console.log(`Status: ${account.status}`);
}
```

### Get iTwin Account Details

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinMinimalResponse,
  ITwinRepresentationResponse,
} from "@itwin/itwins-client";

/** Function that gets account details for a specific iTwin. */
async function getITwinAccount(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };
  const iTwinId = "your-itwin-id";

  // Get minimal account details
  const minimalResponse: BentleyAPIResponse<ITwinMinimalResponse> =
    await client.getITwinAccount(accessToken, iTwinId, "minimal");

  if (minimalResponse.error) {
    console.error("Error fetching iTwin account:", minimalResponse.error.message);
    return;
  }

  const minimalAccount = minimalResponse.data!.iTwin;
  console.log(`Account (Minimal): ${minimalAccount.displayName}`);

  // Get detailed account information
  const detailedResponse: BentleyAPIResponse<ITwinRepresentationResponse> =
    await client.getITwinAccount(accessToken, iTwinId, "representation");

  if (detailedResponse.error) {
    console.error("Error fetching detailed account:", detailedResponse.error.message);
    return;
  }

  const detailedAccount = detailedResponse.data!.iTwin;
  console.log(`Account (Detailed): ${detailedAccount.displayName}`);
  console.log(`Created: ${detailedAccount.createdDateTime}`);
  console.log(`Created By: ${detailedAccount.createdBy}`);
  console.log(`Data Center: ${detailedAccount.dataCenterLocation}`);

  if (detailedAccount.parentId) {
    console.log(`Parent Account: ${detailedAccount.parentId}`);
  }
}
```

## Environment Configuration

### Using Custom Base URLs

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
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

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

/** Using constructor with custom URL */
async function useCustomURL(): Promise<void> {
  const iTwinsClient: ITwinsClient = new ITwinsClient("https://api.bentley.com/itwins");
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const iTwinsResponse: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await iTwinsClient.getITwins(accessToken, { subClass: "Project" });

  iTwinsResponse.data!.iTwins.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

## Error Handling

### Standard Error Handling Pattern

```typescript
import type { AccessToken } from "@itwin/core-bentley";
import { ITwinsClient } from "@itwin/itwins-client";

async function handleErrors(): Promise<void> {
  const client = new ITwinsClient();
  const accessToken: AccessToken = { /* get_access_token_logic_here */ };

  const response = await client.getITwin(accessToken, "invalid-id");

  if (response.error) {
    switch (response.status) {
      case 404:
        console.log("iTwin not found");
        break;
      case 422:
        console.log("Validation error:", response.error.details);
        break;
      case 401:
        console.log("Unauthorized - check access token");
        break;
      default:
        console.log("API error:", response.error.message);
    }
    return;
  }

  // Safe to use data after error check
  const iTwin = response.data!.iTwin;
  console.log("Found iTwin:", iTwin.displayName);
}
```
