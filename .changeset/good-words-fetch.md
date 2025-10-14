---
"@itwin/itwins-client": minor
---

Enhanced type safety with conditional return types

Added conditional return types to methods that support both minimal and representation responses. Return types now automatically infer based on the `resultMode` parameter, providing better IntelliSense and compile-time type checking.

\*\*Enhanced Methods:\*\*

\- `getFavoritesITwins`

\- `getRecentUsedITwins`

\- `getITwins`

\- `getITwin`

\- `getRepositoryResource`

\- `getRepositoryResources`

\- `getITwinAccount`

\*\*Before:\*\*

```typescript
const result = await client.getITwin(token, "id", "representation");

// Type: BentleyAPIResponse<ITwinMinimalResponse | ITwinRepresentationResponse>

const result = await client.getITwin(token, "id", "representation");

// Type: BentleyAPIResponse<ITwinRepresentationResponse>
```
