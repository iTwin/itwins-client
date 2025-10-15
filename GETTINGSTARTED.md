## Integration Test Setup

Make sure an `.env` file is created in the root folder. The following are the keys without the values:

```
IMJS_URL_PREFIX="qa-"
IMJS_OIDC_BROWSER_TEST_CLIENT_ID="spa-XXXXXXXXXXXXXXXXXX"
IMJS_OIDC_BROWSER_TEST_REDIRECT_URI="http://localhost:3000/signin-callback"
IMJS_OIDC_BROWSER_TEST_SCOPES="itwin-platform"
IMJS_OIDC_AUTHING_BROWSER_TEST_SCOPES="itwin-platform"
IMJS_ITWIN_TEST_USER="testUserEmail"
IMJS_ITWIN_TEST_USER_PASSWORD="testUserPassword"
IMJS_TEST_ASSET_ID="testIModelId"
IMJS_TEST_PROJECT_ID="testItwinId"
```

Run the following npm commands from the root folder in order.

```
pnpm install
pnpm build
pnpm test
```

`pnpm test` runs a script defined in `package.json`.
