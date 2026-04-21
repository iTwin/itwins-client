---
"@itwin/itwins-client": major
---

Use strict graphics provider unions and plain string public identifiers

BREAKING CHANGE: `RepositoryClass`, `RepositorySubClass`, and `GraphicsContentType`
are now plain `string` aliases instead of string unions.

BREAKING CHANGE: `GraphicsProvider` is now a discriminated union keyed by
provider `name`, and `GraphicsProviderOptions` is now a union of the
provider-specific option interfaces instead of a merged superset interface.

This also removes the remaining repository resource response literals that previously narrowed
repository `class` values to a smaller fixed set.

Before:

```typescript
type RepositoryClass =
  | "iModels"
  | "Storage"
  | "Forms"
  | "RealityData"
  | "GeographicInformationSystem";

type RepositorySubClass =
  | "WebMapService"
  | "WebMapTileService"
  | "ArcGIS";

type GraphicsContentType =
  | "3DTILES"
  | "GLTF"
  | "IMAGERY"
  | "TERRAIN"
  | "KML"
  | "CZML"
  | "GEOJSON"
  | "OAPIF+GEOJSON";

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

After:

```typescript
type RepositoryClass = string;
type RepositorySubClass = string;
type GraphicsContentType = string;

type GraphicsProvider =
  | UrlTemplateImageryProvider
  | Google2DImageryProvider;

type GraphicsProviderOptions =
  | UrlTemplateImageryProviderOptions
  | Google2DImageryProviderOptions;
```

Migration:

- Existing calls that already pass string literals continue to work unchanged.
- Code that relied on exhaustive autocomplete or literal-union narrowing for repository
  `class`, `subClass`, and graphics `type` values should now treat those values as API-provided strings.
- Narrow `GraphicsProvider` by `name` before reading provider-specific option fields.
- Code that extended `GraphicsProviderOptions` should switch to one of the concrete option interfaces
  or use composition instead of interface inheritance.
