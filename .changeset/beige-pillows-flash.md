---
"@itwin/itwins-client": minor
---

feat: update repository interface and capabilities, and fix esm module compatibility with nodeNext

\- Modified the Repository interface to make 'id' and 'displayName' required fields.

\- Added 'capabilities' field to the Repository interface to define supported operations.

\- Updated NewRepositoryConfig to reflect changes in the Repository interface.

\- Changed exports in itwins-client.ts to include .js extensions for compatibility.

\- Updated TypeScript configuration to target ES2022 and enable synthetic default imports.
