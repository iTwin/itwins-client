# iTwins Client Library

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

[iTwin.js](http://www.itwinjs.org) is an open source platform for creating, querying, modifying, and displaying Infrastructure Digital Twins. To learn more about the iTwin Platform and its APIs, visit the [iTwin developer portal](https://developer.bentley.com/).

If you have questions, or wish to contribute to iTwin.js, see our [Contributing guide](./CONTRIBUTING.md).

## About this Repository

Contains the **@itwin/itwins-client** package that wraps sending requests to the iTwins service. Visit the [iTwins API](https://developer.bentley.com/apis/itwins/) for more documentation on the iTwins service.

## Integration Test Setup

Make sure a `.env` file is created in the root folder.

```
IMJS_BUDDI_RESOLVE_URL_USING_REGION="{region_code_here}"
IMJS_AUTH_AUTHORITY="{ims_authority_url_here}"
IMJS_URL_PREFIX="qa-"
IMJS_OIDC_AUTHING_BROWSER_TEST_AUTHORITY="{ims_authority_url_here}"
IMJS_OIDC_BROWSER_TEST_CLIENT_ID="spa-B9Y8pYnRiSJLDPbRcB2IJJBQO"
IMJS_OIDC_BROWSER_TEST_REDIRECT_URI="http://localhost:3000/signin-callback"
IMJS_OIDC_BROWSER_TEST_SCOPES="itwins:read itwins:modify"
IMJS_OIDC_AUTHING_BROWSER_TEST_SCOPES="itwins:read itwins:modify"
IMJS_TEST_REGULAR_USER_NAME="{test_user_here}"
IMJS_TEST_REGULAR_USER_PASSWORD="{test_user_password_here}}"
IMJS_TEST_ASSET_ID="{test_asset_id_here}"
IMJS_TEST_PROJECT_ID="{test_project_id_here}"
IMJS_TEST_IMODEL_ID="{test_imodel_id_here}"
```

Run the following npm commands from the root folder in order.

```
npm i
npm run build
npm run test
```

`npm run test` runs a script defined in `package.json`.


## Contributing to this Repository

For information on how to contribute to this project, please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, [GETTINGSTARTED.md](GETTINGSTARTED.md) for information on working with the documentation in this repository.

In the future, [HELPWANTED.md](HELPWANTED.md) may contain a list of contributions we would like to see to this project.
