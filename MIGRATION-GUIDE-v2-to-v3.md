# Migration Guide: iTwins Client v2.x.x to v3.x.x

This guide covers the breaking repository and graphics typing changes introduced in iTwins Client v3.x.x.

## Table of Contents

- [Overview](#overview)
- [What Changed](#what-changed)
- [Who Needs to Update Code](#who-needs-to-update-code)
- [Required Code Changes](#required-code-changes)
- [Migration Examples](#migration-examples)
- [Migration Checklist](#migration-checklist)

## Overview

Version 3.0 changes repository class, repository subclass, graphics content type, and graphics provider typing to better match the API payloads.

This aligns the client with the API, which can return repository identifiers outside the previously hard-coded literal sets.

## What Changed

### Repository Type Aliases

In v2.x.x, repository identifiers were modeled as string unions:

```typescript
type RepositoryClass =
  | "iModels"
  | "Storage"
  | "Forms"
  | "RealityData"
  | "GeographicInformationSystem"
  | "Construction"
  | "Subsurface"
  | "GeospatialFeatures"
  | "SensorData"
  | "PdfPlansets"
  | "IndexedMedia";

type RepositorySubClass =
  | "WebMapService"
  | "WebMapTileService"
  | "WebFeatureService"
  | "ArcGIS"
  | "UrlTemplate"
  | "OgcApiFeatures"
  | "EvoWorkspace"
  | "Performance";

type GraphicsContentType =
  | "3DTILES"
  | "GLTF"
  | "IMAGERY"
  | "TERRAIN"
  | "KML"
  | "CZML"
  | "GEOJSON"
  | "OAPIF+GEOJSON";
```

In v3.x.x, all three are plain strings:

```typescript
type RepositoryClass = string;
type RepositorySubClass = string;
type GraphicsContentType = string;
```

**Source**: [src/types/Repository.ts](src/types/Repository.ts)

### Repository Resource Response Typing

Repository resource response types also no longer narrow `class`, `subClass`, or `type` to smaller fixed literal sets. Treat these values as API-provided identifiers rather than a closed list.

### Graphics Provider Typing

In v2.x.x, graphics provider configuration used a merged options interface:

```typescript
interface GraphicsProviderOptions {
  tilingScheme?: string;
  bounds?: [number, number, number, number];
  credit?: string;
  mapType?: string;
  url?: string;
  session?: string;
  tileWidth?: number;
  tileHeight?: number;
  imageFormat?: string;
  [key: string]: unknown;
}

interface GraphicsProvider {
  name: string;
  options: GraphicsProviderOptions;
}
```

In v3.x.x, graphics provider typing is modeled as a discriminated union keyed by `name`:

```typescript
interface UrlTemplateImageryProvider {
  name: "UrlTemplateImageryProvider";
  options: UrlTemplateImageryProviderOptions;
}

interface Google2DImageryProvider {
  name: "Google2DImageryProvider";
  options: Google2DImageryProviderOptions;
}

type GraphicsProvider =
  | UrlTemplateImageryProvider
  | Google2DImageryProvider;

type GraphicsProviderOptions =
  | UrlTemplateImageryProviderOptions
  | Google2DImageryProviderOptions;
```

This more closely matches the OpenAPI `oneOf` shape, but it is a breaking type change for code that assumed every provider exposed the full merged options bag.

### Removed Alias

If your code referenced `CreatableRepositoryClass`, replace it with `RepositoryClass` or `string`.

## Who Needs to Update Code

You need to make code changes if your v2.x.x code relied on any of these patterns:

- Exhaustive `switch` statements over `RepositoryClass` or `RepositorySubClass`
- Exhaustive `switch` statements over `GraphicsContentType`
- Code that accessed `GraphicsProvider.options` without first narrowing on `GraphicsProvider.name`
- Code that extended `GraphicsProviderOptions` as an interface
- Type guards that assumed only the old literal union members could appear
- Lookup tables typed as `Record<RepositoryClass, ...>` with full coverage of the old union
- Helper functions constrained to a fixed set of repository class literals
- Direct usage of the removed `CreatableRepositoryClass` alias

If your code already passed and compared raw string values, and narrowed graphics providers by `name` before reading provider-specific options, no migration is required.

## Required Code Changes

### 1. Treat Repository Identifiers as External Strings

Before:

```typescript
function isSupportedRepositoryClass(value: RepositoryClass): boolean {
  switch (value) {
    case "iModels":
    case "Storage":
    case "Forms":
      return true;
    default:
      return false;
  }
}
```

After:

```typescript
function isSupportedRepositoryClass(value: string): boolean {
  return ["iModels", "Storage", "Forms"].includes(value);
}
```

The key change is conceptual: these are no longer exhaustive domain types. They are API values that your code may choose to recognize selectively.

### 2. Treat Graphics Content Types as API Values

Before:

```typescript
function isImagery(type: GraphicsContentType): boolean {
  switch (type) {
    case "IMAGERY":
      return true;
    default:
      return false;
  }
}
```

After:

```typescript
function isImagery(type: string): boolean {
  return type === "IMAGERY";
}
```

### 3. Narrow Graphics Providers by `name`

Before:

```typescript
if (graphic.provider) {
  console.log(graphic.provider.options.bounds?.join(", "));
}
```

After:

```typescript
if (graphic.provider?.name === "UrlTemplateImageryProvider") {
  console.log(graphic.provider.options.bounds?.join(", "));
}
```

Side-by-side example:

```typescript
if (!graphic.provider) {
  return;
}

switch (graphic.provider.name) {
  case "UrlTemplateImageryProvider":
    console.log(graphic.provider.options.tilingScheme);
    console.log(graphic.provider.options.bounds?.join(", "));
    console.log(graphic.provider.options.credit);
    break;

  case "Google2DImageryProvider":
    console.log(graphic.provider.options.mapType);
    console.log(graphic.provider.options.url);
    console.log(graphic.provider.options.session);
    break;
}
```

### 4. Replace Exhaustive Branching with Known-Value Checks

Before:

```typescript
function getRepositoryLabel(repositoryClass: RepositoryClass): string {
  switch (repositoryClass) {
    case "iModels":
      return "iModels";
    case "Storage":
      return "Storage";
    case "Forms":
      return "Forms";
  }
}
```

After:

```typescript
function getRepositoryLabel(repositoryClass: string): string {
  const labels: Record<string, string> = {
    iModels: "iModels",
    Storage: "Storage",
    Forms: "Forms",
  };

  return labels[repositoryClass] ?? repositoryClass;
}
```

### 5. Replace `CreatableRepositoryClass`

Before:

```typescript
function buildRepositoryConfig(repositoryClass: CreatableRepositoryClass) {
  return {
    class: repositoryClass,
  };
}
```

After:

```typescript
function buildRepositoryConfig(repositoryClass: RepositoryClass) {
  return {
    class: repositoryClass,
  };
}
```

You can also use `string` directly when that better reflects your application boundary.

## Migration Examples

### Reading Repository Data

Before:

```typescript
const response = await client.getRepository(token, iTwinId, repositoryId);
const repository = response.data!.repository;

if (repository.class === "GeographicInformationSystem") {
  // GIS-only handling
}
```

After:

```typescript
const response = await client.getRepository(token, iTwinId, repositoryId);
const repository = response.data!.repository;

if (repository.class === "GeographicInformationSystem") {
  // GIS-only handling
}
```

This usage does not change. Existing string comparisons continue to work unchanged.

### Creating Repository Configurations

Before:

```typescript
const newRepository: NewRepositoryConfig = {
  class: "GeographicInformationSystem",
  subClass: "WebMapService",
  uri: "https://example.com/wms",
};
```

After:

```typescript
const newRepository: NewRepositoryConfig = {
  class: "GeographicInformationSystem",
  subClass: "WebMapService",
  uri: "https://example.com/wms",
};
```

This also continues to work unchanged. The migration impact is on compile-time assumptions, not on the request payload format.

## Migration Checklist

- Replace any usage of `CreatableRepositoryClass`
- Review `switch` statements over repository class and subclass values
- Review `switch` statements over graphics content type values
- Review code that reads `GraphicsProvider.options` without narrowing on `GraphicsProvider.name`
- Remove assumptions that `RepositoryClass`, `RepositorySubClass`, and `GraphicsContentType` are exhaustive unions
- Update lookup tables and helper utilities to accept unknown future values
- Keep existing string literals where they reflect known supported repository types in your application

This migration is intentionally small for most consumers. If your application already treated repository identifiers as strings returned by the API, upgrading to v3.x.x should require little or no code change.