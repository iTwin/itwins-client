# Integration Test Setup

## Env Setup

Make sure an `.env` file is created in the root folder. The following are the keys without the values:

```text
IMJS_URL_PREFIX="qa-"
IMJS_OIDC_BROWSER_TEST_CLIENT_ID="spa-XXXXXXXXXXXXXXXXXX"
IMJS_OIDC_BROWSER_TEST_REDIRECT_URI="http://localhost:3000/signin-callback"
IMJS_OIDC_BROWSER_TEST_SCOPES="itwin-platform"
IMJS_OIDC_AUTHING_BROWSER_TEST_SCOPES="itwin-platform"
IMJS_ITWIN_TEST_USER="testUserEmail"
IMJS_ITWIN_TEST_USER_PASSWORD="testUserPassword"
IMJS_TEST_ASSET_ID="testITwinId"
IMJS_TEST_PROJECT_ID="testItwinId"
```

## Test Scripts

Run the following npm commands from the root folder in order.

```text
pnpm install
pnpm build
pnpm test
```

`pnpm test` runs a script defined in `package.json`.

## Test User Setup And Itwin Setup

Please add a test user to both a `project` level Itwin and an `asset` level  Itwin. For more information on Itwin's, please read through our [API Docs](https://developer.bentley.com/apis/itwins/overview/).

The test user must have the role of `Project Administrator` or `ITwin Owner` on each Itwin for the test to function correctly.
