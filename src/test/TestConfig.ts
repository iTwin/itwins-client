/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import {
  getAccessTokenFromBackend,
} from "@itwin/oidc-signin-tool/lib/cjs/frontend";

/** Basic configuration used by all tests
 */
export class TestConfig {
  public static readonly iTwinSearchString: string = "APIM Test";
  public static readonly iTwinProjectName: string = "APIM Test Project";
  public static readonly iTwinProjectNumber: string =
  "APIM-Test-Project-20210204T00-58";
  public static readonly iTwinAssetName: string = "APIM Test Asset";
  public static readonly iTwinAssetNumber: string = "APIM-Test-Asset-001";

  /** Login the specified user and return the AuthorizationToken */
  public static async getAccessToken(
  ): Promise<AccessToken> {
    return getAccessTokenFromBackend(
      {
        email: process.env.IMJS_ITWIN_TEST_USER!,
        password: process.env.IMJS_ITWIN_TEST_USER_PASSWORD!,
      });
  }
}
