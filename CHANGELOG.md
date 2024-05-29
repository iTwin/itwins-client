# Change Log - @itwin/itwins-client

## 1.4.0

- Added `getAccountAsync` method on `ITwinsAccessClient`

## 1.3.0

- Added Query Scope query argument, to allow for querying to be expanded outside of just the iTwins you are a member of (which only applies to Administrators).

## 1.2.1

- Upgraded axios dependency due to vulnerabilities in earlier versions.

## 1.2.0

- Added optional iTwin result mode parameter to enable fetching data in "representation" mode.

## 1.1.0

- Added constructor parameter to iTwinsClient for custom url.

## 1.0.1

- Updated code owners.
- Updated GettingStarted with new environment variable names.

## 1.0.0

- Added POST, PATCH, and DELETE operations for iTwins and iTwin Repositories.
- Added additional integration tests for the new operations.
- Added usage examples for CRUD operations for iTwins and Repositories.

## 0.9.0

- Initial commit with only iTwin query operaitons.
