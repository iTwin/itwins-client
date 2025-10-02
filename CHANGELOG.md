# Change Log - @itwin/itwins-client

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
