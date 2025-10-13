# Change Log - @itwin/itwins-client

## 2.1.0

### Minor Changes

#### [2.1.0](https://www.npmjs.com/package/@itwin/itwins-client/v/2.1.0) - 2025-10-13

feat: update repository interface and capabilities, and fix esm module compatibility with nodeNext

\- Modified the Repository interface to make 'id' and 'displayName' required fields.

\- Added 'capabilities' field to the Repository interface to define supported operations.

\- Updated NewRepositoryConfig to reflect changes in the Repository interface.

\- Changed exports in itwins-client.ts to include .js extensions for compatibility.

\- Updated TypeScript configuration to target ES2022 and enable synthetic default imports.

## 2.0.0

### Major Changes

#### [2.0.0](https://www.npmjs.com/package/@itwin/itwins-client/v/2.0.0) - 2025-10-03

- Added new enum values ArcGIS and UrlTemplate to RepositorySubClass and removed MapServer. Created ts configs that only have one responsibility. Switched testing framework to vite. Fixed broken test. Upgraded package to use modern ts and eslint packages. Added the ability to debug tests. Added launch config and recommend plugins. ([commit](https://github.com/iTwin/itwins-client/commit/e0c9d3a803de62747c0841be6cbdad927297c955))
- Complete API redesign with breaking changes

MAJOR CHANGES:

- ITwinsAccessClient renamed to ITwinsClient
- All method names updated (removed 'Async' suffix)
- Enums converted to string union types
- Response structure changes with new data wrappers
- Type system improvements with ITwinMinimal/ITwinRepresentation split
- New repository resources, exports, and image management APIs
- HAL specification compliance with \_links navigation

See MIGRATION-GUIDE-v1-to-v2.md for detailed migration instructions and examples. ([commit](https://github.com/iTwin/itwins-client/commit/9a0cfc6c8042af24a7d01469c0d0d443f72061bb))

### Minor changes

- feat: replace axios with fetch and refactor base client ([commit](https://github.com/iTwin/itwins-client/commit/fc631bdf145f6b7dba63254fb507ee1a8caa6f30))
- Enhance repository creation with NewRepositoryConfig interface and update related methods. Can no longer try to create repos with auto generated values. ([commit](https://github.com/iTwin/itwins-client/commit/539f769d2dc410acaca9c44652ec0cfbdfa759e4))

## 1.6.1

### Patch Changes

#### [1.6.1](https://www.npmjs.com/package/@itwin/itwins-client/v/1.6.1) - 2024-12-13

- Added missing properties when accesing these methods:
  - `queryAsync`
  - `queryFavoritesAsync`
  - `queryRecentsAsync`
- Missing properties:
  - `includeInactive`
  - `status`
  - `subClass`
  - `parentId`
  - `iTwinAccountId`

## 1.6.0

### Minor Changes

#### [1.6.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.6.0) - 2024-12-03

- Updated methods so that `subClass` is no longer mandatory.
  - `queryAsync`
  - `queryFavoritesAsync`
  - `queryRecentsAsync`
- Marked `subClass` as a depricated property.
- Included `subClass` to be provided from the `arg` property.

## 1.5.0

### Minor Changes

#### [1.5.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.5.0) - 2024-07-22

- Added three new properties to the `iTwin` interface.

  - `ianaTimeZone`
  - `imageName`
  - `image`

- Added three new values to the `iTwinSubClass` enum.
  - Portfolio
  - Program
  - WorkPackage

## 1.4.0

### Minor Changes

#### [1.4.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.4.0) - 2024-05-29

- Added `getAccountAsync` method on `ITwinsAccessClient`

## 1.3.0

### Minor Changes

#### [1.3.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.3.0) - 2024-04-19

- Added Query Scope query argument, to allow for querying to be expanded outside of just the iTwins you are a member of (which only applies to Administrators).

## 1.2.1

### Patch Changes

#### [1.2.1](https://www.npmjs.com/package/@itwin/itwins-client/v/1.2.1) - 2023-11-15

- Upgraded axios dependency due to vulnerabilities in earlier versions.

## 1.2.0

### Minor Changes

#### [1.2.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.2.0) - 2023-06-05

- Added optional iTwin result mode parameter to enable fetching data in "representation" mode.

## 1.1.0

### Minor Changes

#### [1.1.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.1.0) - 2022-10-07

- Added constructor parameter to iTwinsClient for custom url.

## 1.0.1

### Patch Changes

#### [1.0.1](https://www.npmjs.com/package/@itwin/itwins-client/v/1.0.1) - 2022-09-25

- Updated code owners.
- Updated GettingStarted with new environment variable names.

## 1.0.0

### Major Changes

#### [1.0.0](https://www.npmjs.com/package/@itwin/itwins-client/v/1.0.0) - 2022-09-23

- Added POST, PATCH, and DELETE operations for iTwins and iTwin Repositories.
- Added additional integration tests for the new operations.
- Added usage examples for CRUD operations for iTwins and Repositories.

## 0.9.0

### Major Changes

#### [0.9.0](https://www.npmjs.com/package/@itwin/itwins-client/v/0.9.0) - 2022-09-20

- Initial commit with only iTwin query operations.
