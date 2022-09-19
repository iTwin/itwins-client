# iTwins Client Library

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

[iTwin.js](http://www.itwinjs.org) is an open source platform for creating, querying, modifying, and displaying Infrastructure Digital Twins. To learn more about the iTwin Platform and its APIs, visit the [iTwin developer portal](https://developer.bentley.com/).

If you have questions, or wish to contribute to iTwin.js, see our [Contributing guide](./CONTRIBUTING.md).

## About this Repository

Contains the **@itwin/itwins-client** package that wraps sending requests to the iTwins service. Visit the [iTwins API](https://developer.bentley.com/apis/itwins/) for more documentation on the iTwins service.

## Usage examples

### Get list of iTwins
```typescript
import { ITwinsAccessClient, ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = { get_access_token_logic_here }
  });
  
  const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
    await iTwinsAccessClient.queryAsync(accessToken, ITwinSubClass.Project);
    
   iTwinsResponse.data!.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get paged list of iTwins using top/skip
```typescript
import { ITwinsAccessClient, ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";

/** Function that queries all iTwins and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = { get_access_token_logic_here }
  });
  
  const iTwinsResponse: ITwinsAPIResponse<ITwin[]> =
    await iTwinsAccessClient.queryAsync(
      accessToken, 
      "Project",
      {
        top: 25,
        skip: 13,
      }
    );
    
   iTwinsResponse.data!.forEach((actualiTwin) => {
    console.log(actualiTwin.id);
  });
}
```

### Get iTwin by Id
```typescript
import { ITwinsAccessClient, ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";

/** Function that gets iTwin by id and prints the id and displayName. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = { get_access_token_logic_here }
  });
  
  const iTwinsResponse: ITwinsAPIResponse<ITwin> =
    await iTwinsAccessClient.getAsync(accessToken, "3865240b-cfd9-4ba1-a9e5-65e8813d006b");
  const actualiTwin = iTwinsResponse.data!;
  console.log(actualiTwin.id, actualiTwin.displayName);
  });
}
```

### Get list of Repositories by Id
```typescript
import { ITwinsAccessClient, ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = { get_access_token_logic_here }
  });
  
  const iTwinsResponse = await iTwinsAccessClient.queryRepositoriesAsync(
    accessToken,
    iTwinId
  );
    
   iTwinsResponse.data!.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

### Get list of Repositories by Id, Class, and Sub Class
```typescript
import { ITwinsAccessClient, ITwin, ITwinsAPIResponse } from "@itwin/itwins-client";

/** Function that queries all iTwin Repositories and prints their ids to the console. */
async function printiTwinIds(): Promise<void> {
  const iTwinsAccessClient: ITwinsAccessClient = new ITwinsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = { get_access_token_logic_here }
  });
  
  const iTwinsResponse = await iTwinsAccessClient.queryRepositoriesAsync(
    accessToken,
    iTwinId,
    {
      class: "GeographicInformationSystem",
      subClass: "MapServer",
    }
  );
    
   iTwinsResponse.data!.forEach((actualRepository) => {
    console.log(actualRepository.id);
  });
}
```

## Contributing to this Repository

For information on how to contribute to this project, please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, [GETTINGSTARTED.md](GETTINGSTARTED.md) for information on working with the documentation in this repository.

In the future, [HELPWANTED.md](HELPWANTED.md) may contain a list of contributions we would like to see to this project.
