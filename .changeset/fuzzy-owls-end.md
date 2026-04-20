---
"@itwin/itwins-client": minor
---

Add Global Repositories endpoint methods

Added new `@beta` methods for the Global Repositories Technical Preview APIs:

- `getGlobalRepositories`
- `getGlobalRepository`
- `getGlobalRepositoryResource`
- `getGlobalRepositoryResources`
- `getGlobalResourceGraphics`

The implementation reuses the existing repository and repository-resource response types,
and expands the shared graphics provider options model to cover the Google provider
metadata returned by the global graphics endpoint.
