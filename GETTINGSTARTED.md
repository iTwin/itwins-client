## Integration Test Setup

Make sure an `.env` file is created in the root folder. The following are the keys without the values:

```
IMJS_AUTH_AUTHORITY=""
IMJS_URL_PREFIX=""
IMJS_OIDC_AUTHING_BROWSER_TEST_AUTHORITY=""
IMJS_OIDC_BROWSER_TEST_CLIENT_ID=""
IMJS_OIDC_BROWSER_TEST_REDIRECT_URI=""
IMJS_OIDC_BROWSER_TEST_SCOPES=""
IMJS_OIDC_AUTHING_BROWSER_TEST_SCOPES=""
IMJS_ITWIN_TEST_USER=""
IMJS_ITWIN_TEST_USER_PASSWORD=""
IMJS_TEST_ASSET_ID=""
IMJS_TEST_PROJECT_ID=""
IMJS_TEST_IMODEL_ID=""
```

Run the following npm commands from the root folder in order.

```
pnpm install
pnpm build
pnpm test
```

`pnpm test` runs a script defined in `package.json`.
