---
"@itwin/itwins-client": patch
---

Fix ESM entry point failing to load in Node.js with ERR_MODULE_NOT_FOUND

Relative imports in the ESM build now include `.js` extensions, and `lib/esm` ships a `package.json` with `"type": "module"`, so `import { ITwinsClient } from "@itwin/itwins-client"` works in native Node.js ESM. CommonJS and bundler consumers are unaffected. Fixes #105.
