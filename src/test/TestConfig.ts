/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import type { TestUserCredentials } from "@itwin/oidc-signin-tool/lib/cjs/frontend";
import {
  getAccessTokenFromBackend,
  TestUsers,
} from "@itwin/oidc-signin-tool/lib/cjs/frontend";

/** Basic configuration used by all tests
 */
export class TestConfig {
  public static readonly iTwinSearchString: string = "APIM Test";
  public static readonly iTwinProjectName: string = "APIM Test Project";
  public static readonly iTwinProjectNumber: string =
    "APIM-Test-Project-20210204T00-58";
  public static readonly iTwinAssetName: string = "APIM Test Asset";
  public static readonly iTwinAssetNumber: string =
    "APIM-Test-Asset-001";

  /** Login the specified user and return the AuthorizationToken */
  public static async getAccessToken(
    user: TestUserCredentials = TestUsers.regular
  ): Promise<AccessToken> {
    return getAccessTokenFromBackend(user);
  }
}
