---
"@itwin/itwins-client": major
---

Use plain string identifiers for repository class and subClass

BREAKING CHANGE: `RepositoryClass` and `RepositorySubClass`
are now plain `string` aliases instead of string unions.

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
```

After:

```typescript
type RepositoryClass = string;
type RepositorySubClass = string;
```

Migration:

- Existing calls that already pass string literals continue to work unchanged.
- Code that relied on exhaustive autocomplete or literal-union narrowing for repository
  `class` and `subClass` should now treat those values as API-provided strings.
