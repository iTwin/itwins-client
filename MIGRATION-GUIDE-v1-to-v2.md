# Migration Guide: iTwins Client v1.x.x to v2.x.x

This guide will help you migrate from iTwins Client v1.x.x to v2.x.x. Version 2.0 introduces significant breaking changes, new features, and a completely redesigned API surface.

## Table of Contents

- [Overview](#overview)
- [Class Migration](#class-migration)
- [Type Renames and Remapping](#type-renames-and-remapping)
- [Method Renames](#method-renames)
- [Response Structure Changes](#response-structure-changes)
- [Environment Configuration Changes](#environment-configuration-changes)
- [Parameter Changes](#parameter-changes)
- [New Public Exports Available](#new-public-exports-available)
- [New Methods Available](#new-methods-available)
- [Critical Migration Steps](#critical-migration-steps)
- [Migration Examples](#migration-examples)

## Overview

Version 2.0 represents a complete API redesign focused on:

- Modern TypeScript patterns with better type safety
- Comprehensive iTwins API coverage
- Consistent naming conventions
- Enhanced developer experience
- HAL specification compliance for navigation links

## Class Migration

### Main Client Class

```typescript
// v1.x.x
import { ITwinsAccessClient } from '@itwin/itwins-client';
const client = new ITwinsAccessClient();

// v2.x.x
import { ITwinsClient } from '@itwin/itwins-client';
const client = new ITwinsClient();
```

The constructor signature remains the same, supporting optional custom URL parameter.

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts)

## Type Renames and Remapping

### Response Types

```typescript
// v1.x.x
ITwinAPIResponse
ITwinResultMode

// v2.x.x
BentleyAPIResponse
ResultMode
```

**Source**: [`src/types/CommonApiTypes.ts`](src/types/CommonApiTypes.ts)

### Interface Splits

```typescript
// v1.x.x
interface ITwin // Single interface for all cases

// v2.x.x
interface ITwinMinimal
interface ITwinRepresentation extends ITwinMinimal
```

**Source**: [`src/types/ITwin.ts`](src/types/ITwin.ts)

### Enum to String Union Conversions

All enums have been converted to string union types for better API compatibility and type safety. String unions are preferred over enums because:

- **Type space vs Value space**: Enums exist in both type space and value space, creating runtime objects that can cause bundling issues and unexpected behavior. String unions exist only in the type space, providing compile-time safety without runtime overhead.
- **API compatibility**: String unions are more compatible with JSON APIs and don't require importing enum objects for comparison.
- **Serialization**: String unions serialize naturally without the need for special handling that enums sometimes require.

```typescript
// v1.x.x
enum ITwinClass {
  Account = "Account",
  Thing = "Thing",
  Endeavor = "Endeavor"
}
// Creates runtime object: ITwinClass.Account === "Account"

// v2.x.x
type ITwinClass = "Thing" | "Endeavor" | "Account"
// Pure type definition: no runtime overhead, direct string comparison
```

**Source**: [`src/types/ITwin.ts`](src/types/ITwin.ts)

```typescript
// v1.x.x
enum ITwinSubClass {
  Account = "Account",
  Asset = "Asset",
  Project = "Project",
  Portfolio = "Portfolio",
  Program = "Program",
  WorkPackage = "WorkPackage"
}

// v2.x.x
type ITwinSubClass = "Account" | "Asset" | "Project" | "Portfolio" | "Program" | "WorkPackage"
```

**Source**: [`src/types/ITwin.ts`](src/types/ITwin.ts)

```typescript
// v1.x.x
enum RepositoryClass {
  iModels = "iModels",
  Storage = "Storage",
  Forms = "Forms",
  Issues = "Issues",
  RealityData = "RealityData",
  GeographicInformationSystem = "GeographicInformationSystem"
}

// v2.x.x
type RepositoryClass = "iModels" | "Storage" | "Forms" | "Issues" | "RealityData" | "GeographicInformationSystem" | "Construction" | "Performance" | "Subsurface"
```

**Source**: [`src/types/Repository.ts`](src/types/Repository.ts)

```typescript
// v1.x.x
enum RepositorySubClass {
  WebMapService = "WebMapService",
  WebMapTileService = "WebMapTileService",
  ArcGIS = "ArcGIS",
  UrlTemplate = "UrlTemplate"
}

// v2.x.x
type RepositorySubClass = "WebMapService" | "WebMapTileService" | "ArcGIS" | "UrlTemplate" | "EvoWorkspace"
```

**Source**: [`src/types/Repository.ts`](src/types/Repository.ts)

## Method Renames

All method names have been updated to remove the 'Async' suffix and follow modern naming conventions:

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts)

| v1.x.x Method | v2.x.x Method |
|---------------|---------------|
| `queryAsync()` | `getITwins()` |
| `getAsync()` | `getITwin()` |
| `queryFavoritesAsync()` | `getFavoritesITwins()` |
| `queryRecentsAsync()` | `getRecentUsedITwins()` |
| `queryRepositoriesAsync()` | `getRepositories()` |
| `getPrimaryAccountAsync()` | `getPrimaryAccount()` |
| `getAccountAsync()` | `getITwinAccount()` |
| `createiTwin()` | `createITwin()` |
| `updateiTwin()` | `updateItwin()` |
| `deleteiTwin()` | `deleteItwin()` |

## Response Structure Changes

### v1.x.x Response Pattern

```typescript
// v1.x.x - Data was automatically unwrapped
const response = await client.queryAsync(token);
const itwins = response.data; // Array of iTwins directly
```

### v2.x.x Response Pattern

```typescript
// v2.x.x - Data is properly wrapped with descriptive properties
const response = await client.getITwins(token);
const itwins = response.data.iTwins; // Array in iTwins property
const links = response.data._links; // HAL specification links

// Single iTwin responses
const response = await client.getITwin(token, iTwinId);
const itwin = response.data.iTwin; // Single iTwin in iTwin property

// Repository responses
const response = await client.getRepositories(token, iTwinId);
const repositories = response.data.repositories; // Array in repositories property
```

All paged responses now include `_links` properties following the HAL specification for navigation and pagination.
Single response now just include the object wrapped in a property name such as:

```typescript
{
  iTwin: {...data};
}

```

## Environment Configuration Changes

### URL Prefix Configuration

Version 2.0 changes how environment-based URL prefixes are configured for better cross-platform compatibility:

```typescript
// v1.x.x - Node.js specific
process.env.IMJS_URL_PREFIX

// v2.x.x - Universal (works in both Node.js and browsers)
globalThis.IMJS_URL_PREFIX
```

**Benefits of the new approach:**

- **Cross-Platform Compatibility**: Works in both Node.js and browser environments
- **Runtime Configuration**: Can be modified at runtime, not just at process startup
- **Modern Standards**: Uses ES2020 `globalThis` standard for accessing global objects
- **Dynamic Environment Switching**: Enables scenarios like switching environments without restart

## Parameter Changes

### Deprecated subClass Parameter Removal

```typescript
// v1.x.x
await client.queryAsync(token, ITwinSubClass.Project, args);
await client.queryFavoritesAsync(token, ITwinSubClass.Asset, args);

// v2.x.x - subClass moved into args object
await client.getITwins(token, { subClass: "Project", ...args });
await client.getFavoritesITwins(token, { subClass: "Asset", ...args });
```

### Query Arguments Consolidation

Query arguments have been consolidated into single parameter objects with better TypeScript support:

```typescript
// v2.x.x - Enhanced query parameters
await client.getITwins(token, {
  subClass: "Project",
  status: "Active",
  search: "My Project",
  top: 10,
  skip: 0,
  resultMode: "representation",
  queryScope: "all",
  // New OData parameters, note "filter" ,"orderby" ,and "select" are only present in the getItwins method
  filter: "status eq 'Active'",
  orderby: "displayName asc",
  select: "id,displayName,status"
});
```

## New Public Exports Available

Version 2.0 exports many new types for enhanced development experience:

### Tree Shaking and Type-Only Imports

A major improvement in v2.x.x is the separation of types from runtime code to enable better tree shaking and smaller bundle sizes:

- **v1.x.x Problem**: Types were mixed with runtime exports in value space, preventing effective tree shaking
- **v2.x.x Solution**: Types are exported separately and should be imported with `import type` syntax

This change provides significant benefits:

1. **Bundle Size Reduction**: Only the runtime code you actually use gets bundled
2. **Better Tree Shaking**: Build tools can eliminate unused type definitions completely
3. **Faster Builds**: TypeScript can optimize type-only imports more efficiently
4. **Clear Intent**: Distinguishes between runtime dependencies and compile-time type checking

```typescript
// v1.x.x - Mixed exports prevented tree shaking
import { ITwinsAccessClient, ITwinClass, SomeUtilFunction } from '@itwin/itwins-client';
// This would bundle ALL exports, even unused ones

// v2.x.x - Separate type and value imports enable tree shaking
import { ITwinsClient } from '@itwin/itwins-client'; // Runtime code only
import type { ITwinClass, BentleyAPIResponse } from '@itwin/itwins-client'; // Types only

// Result: Only ITwinsClient runtime code is bundled, types are stripped at compile time
```

**Migration Tip**: Always use `import type` for type-only imports to maximize bundle optimization:

### Repository Resource Types

```typescript
import type {
  PostRepositoryResourceResponse,
  GetRepositoryResourceMinimalResponse,
  GetRepositoryResourceRepresentationResponse,
  GetMultiRepositoryResourceMinimalResponse,
  GetMultiRepositoryResourceRepresentationResponse
} from '@itwin/itwins-client';
```

**Source**: [`src/types/Repository.ts`](src/types/Repository.ts)

### Export Types

```typescript
import type {
  ITwinExportRequestInfo,
  ITwinExportSingleResponse,
  ITwinExportMultiResponse
} from '@itwin/itwins-client';
```

**Source**: [`src/types/ITwinExport.ts`](src/types/ITwinExport.ts)

### Image Types

```typescript
import type { ITwinImageResponse } from '@itwin/itwins-client';
```

**Source**: [`src/types/ITwinImage.ts`](src/types/ITwinImage.ts)

### Enhanced Query and Response Types

```typescript
import type {
  ODataQueryParams,
  ITwinsQueryArg,
  Links,
  ResultMode,
  BentleyAPIResponse
} from '@itwin/itwins-client';
```

**Sources**:

- [`src/types/ITwinsQueryArgs.ts`](src/types/ITwinsQueryArgs.ts) - `ITwinsQueryArg`
- [`src/types/CommonApiTypes.ts`](src/types/CommonApiTypes.ts) - `ODataQueryParams`, `BentleyAPIResponse`, `ResultMode`
- [`src/types/links.ts`](src/types/links.ts) - `Links`

## New Methods Available

Version 2.0 introduces many new methods for comprehensive iTwins API coverage:

### Repository Resources (New) (Beta)

```typescript
// Create resources in GIS repositories
await client.createRepositoryResource(token, iTwinId, repositoryId, resource);

// Get individual repository resources
await client.getRepositoryResource(token, iTwinId, repositoryId, resourceId);

// Get multiple resources with filtering/pagination
await client.getRepositoryResources(token, iTwinId, repositoryId, queryParams);
```

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Repository resource methods

### iTwin Exports (New)

```typescript
// Create new iTwin exports
await client.createExport(token, exportRequest);

// Get specific export details
await client.getExport(token, exportId);

// List user's exports
await client.getExports(token);
```

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Export methods

### Image Management (New)

```typescript
// Upload PNG/JPEG images
await client.uploadITwinImage(token, iTwinId, imageBlob, contentType);

// Retrieve iTwin images
await client.getITwinImage(token, iTwinId);

// Remove iTwin images
await client.deleteITwinImage(token, iTwinId);
```

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Image management methods

### Enhanced Favorites and Recents

```typescript
// Add/remove favorites (new methods)
await client.addITwinToFavorites(token, iTwinId);
await client.removeITwinFromFavorites(token, iTwinId);

// Add to recents (new method)
await client.addITwinToMyRecents(token, iTwinId);
```

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Favorites and recents methods

### Enhanced Repository Management

```typescript
// Get single repository by ID (new)
await client.getRepository(token, iTwinId, repositoryId);

// Update existing repositories (new)
await client.updateRepository(token, iTwinId, repositoryId, updates);
```

**Source**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Repository management methods

## Critical Migration Steps

Follow these steps in order to migrate your codebase:

### 1. Update Import Statements

```typescript
// Replace this
import { ITwinsAccessClient } from '@itwin/itwins-client';

// With this
import { ITwinsClient } from '@itwin/itwins-client';
```

### 2. Update Class Instantiation

```typescript
// Replace this
const client = new ITwinsAccessClient();

// With this
const client = new ITwinsClient();
```

### 3. Remove 'Async' from Method Names

```typescript
// Replace this
await client.queryAsync(token, subClass, args);

// With this
await client.getITwins(token, args);
```

### 4. Update Response Handling

```typescript
// Replace this
const response = await client.queryAsync(token);
const itwins = response.data; // Direct array access

// With this
const response = await client.getITwins(token);
const itwins = response.data.iTwins; // Wrapped in iTwins property
const links = response.data._links; // Access navigation links
```

### 5. Move subClass Parameters

```typescript
// Replace this
await client.queryAsync(token, ITwinSubClass.Project, args);

// With this
await client.getITwins(token, { subClass: "Project", ...args });
```

### 6. Update Type Imports

```typescript
// Replace enum imports
import { ITwinClass, ITwinSubClass } from '@itwin/itwins-client';

// With type imports (values remain the same)
import type { ITwinClass, ITwinSubClass } from '@itwin/itwins-client';
```

### 7. Update ITwin Type Usage

```typescript
// Replace generic ITwin usage
const itwin: ITwin = response.data;

// With specific interface
const itwin: ITwinMinimal = response.data.iTwin; // For minimal mode
// OR
const itwin: ITwinRepresentation = response.data.iTwin; // For representation mode
```

### 8. Update Response Type Annotations

```typescript
// Replace this
const response: ITwinsAPIResponse<ITwin[]> = await client.queryAsync(token);

// With this
const response: BentleyAPIResponse<MultiITwinMinimalResponse> = await client.getITwins(token);
```

## Migration Examples

### Complete Before/After Example

```typescript
// v1.x.x
import { ITwinsAccessClient, ITwinSubClass, ITwinsAPIResponse, ITwin } from '@itwin/itwins-client';

const client = new ITwinsAccessClient();

async function getProjectITwins(token: string) {
  const response: ITwinsAPIResponse<ITwin[]> = await client.queryAsync(
    token,
    ITwinSubClass.Project,
    {
      top: 10,
      search: "My Project",
      resultMode: "representation"
    }
  );

  const itwins = response.data; // Direct array access
  return itwins;
}

// v2.x.x
import { ITwinsClient } from '@itwin/itwins-client';
import type {BentleyAPIResponse, MultiITwinRepresentationResponse} from '@itwin/itwins-client'

const client = new ITwinsClient();

async function getProjectITwins(token: string) {
  const response: BentleyAPIResponse<MultiITwinRepresentationResponse> = await client.getITwins(
    token,
    {
      subClass: "Project", // Moved into args object
      top: 10,
      search: "My Project",
      resultMode: "representation"
    }
  );

  const itwins = response.data.iTwins; // Wrapped in iTwins property
  const links = response.data._links; // Access navigation links
  return { itwins, links };
}
```

### Repository Query Migration

```typescript
// v1.x.x
const response = await client.queryRepositoriesAsync(token, iTwinId, {
  class: "GeographicInformationSystem"
});
const repositories = response.data; // Direct array

// v2.x.x
const response = await client.getRepositories(token, iTwinId, {
  class: "GeographicInformationSystem"
});
const repositories = response.data.repositories; // Wrapped in repositories property
```

This migration guide should help you successfully upgrade from iTwins Client v1.x.x to v2.x.x. The new version provides significantly enhanced functionality while maintaining the core patterns you're familiar with.

## Additional Resources

- **Main Export File**: [`src/itwins-client.ts`](src/itwins-client.ts) - All public exports
- **Client Implementation**: [`src/iTwinsClient.ts`](src/iTwinsClient.ts) - Main client class
- **Type Definitions**: [`src/types/`](src/types/) - All type definitions
