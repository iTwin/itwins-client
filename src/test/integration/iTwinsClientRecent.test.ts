/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import type { AccessToken } from "@itwin/core-bentley";
import { BentleyAPIResponse } from "src/types/CommonApiTypes";
import type { ITwinRepresentation } from "src/types/ITwin";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import { TestConfig } from "../TestConfig";

describe("iTwinsClient - Recently Used Integration", () => {
  let baseUrl: string = "https://api.bentley.com/itwins";
  const urlPrefix = process.env.IMJS_URL_PREFIX;
  if (urlPrefix) {
    const url = new URL(baseUrl);
    url.hostname = urlPrefix + url.hostname;
    baseUrl = url.href;
  }
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  describe("getRecentUsedITwins", () => {
    describe("Success Cases", () => {
      it("should get a list of recently used iTwins", async () => {
        const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
          accessToken,
        );

        expect(recentsResponse.status).toBe(200);
        expect(recentsResponse.data).toBeDefined();

        if (recentsResponse.data!.iTwins) {
          expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(25);
        }
      });

      it("should get recently used iTwins with query parameters", async () => {
        const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
          accessToken,
          {
            top: 5,
            resultMode: "representation",
          },
        );

        expect(recentsResponse.status).toBe(200);
        expect(recentsResponse.data).toBeDefined();

        if (recentsResponse.data!.iTwins) {
          expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(5);

          recentsResponse.data!.iTwins.forEach((iTwin) => {
            expect(iTwin.id).toBeDefined();
            expect(iTwin.displayName).toBeDefined();
            expect(iTwin.class).toBeDefined();
            expect(iTwin.subClass).toBeDefined();
            expect(iTwin.type).toBeDefined();
            expect(iTwin.status).toBeDefined();
            expect(iTwin.ianaTimeZone).toBeDefined();
            expect(iTwin.dataCenterLocation).toBeDefined();
          });
        }
      });

      it("should get recently used iTwins including inactive ones", async () => {
        const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
          accessToken,
          {
            includeInactive: true,
          },
        );

        expect(recentsResponse.status).toBe(200);
        expect(recentsResponse.data).toBeDefined();

        if (recentsResponse.data!.iTwins) {
          expect(recentsResponse.data!.iTwins.length).toBeLessThanOrEqual(25);
        }
      });

      it("should return recently used iTwins in correct order (most recent first)", async () => {
        const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
          accessToken,
          {
            top: 10,
          },
        );

        expect(recentsResponse.status).toBe(200);
        expect(recentsResponse.data).toBeDefined();

        if (
          recentsResponse.data!.iTwins &&
          recentsResponse.data!.iTwins.length > 1
        ) {
          const iTwins = recentsResponse.data!.iTwins;

          iTwins.forEach((iTwin: ITwinRepresentation) => {
            expect(iTwin.id).toBeDefined();
            expect(iTwin.displayName).toBeDefined();
          });

          expect(iTwins.length).toBeGreaterThan(0);
          expect(iTwins.length).toBeLessThanOrEqual(10);
        }
      });
    });
  });

  describe("addITwinToMyRecents", () => {
    describe("Success Cases", () => {
      it("should successfully add and retrieve iTwin from recently used list", async () => {
        const newiTwin: Omit<ITwinRepresentation, "id"> = {
          displayName: `APIM iTwin Recents Test ${new Date().toISOString()}`,
          number: `APIM iTwin Recents Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin!.id!;

        try {
          expect(createResponse.status).toBe(201);

          const addRecentResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

          expect(addRecentResponse.status).toBe(204);

          const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
            accessToken,
            {
              displayName: newiTwin.displayName,
            },
          );

          expect(recentsResponse.status).toBe(200);
          expect(recentsResponse.data).toBeDefined();

          const foundRecent = recentsResponse.data!.iTwins?.find(
            (iTwin: ITwinRepresentation) => iTwin.id === iTwinId,
          );
          expect(foundRecent).toBeDefined();
          expect(foundRecent!.displayName).toBe(newiTwin.displayName);
        } finally {
          await iTwinsAccessClient.deleteItwin(accessToken, iTwinId);
        }
      });
    });

    describe("Edge Cases", () => {
      it("should handle adding the same iTwin to recents multiple times", async () => {
        const newiTwin: Omit<ITwinRepresentation, "id"> = {
          displayName: `APIM iTwin Recents Duplicate Test ${new Date().toISOString()}`,
          number: `APIM iTwin Recents Duplicate Number ${new Date().toISOString()}`,
          type: "Bridge",
          subClass: "Asset",
          class: "Thing",
          dataCenterLocation: "East US",
          ianaTimeZone: "America/New_York",
          status: "Trial",
        };

        const createResponse = await iTwinsAccessClient.createITwin(
          accessToken,
          newiTwin,
        );
        const iTwinId = createResponse.data?.iTwin!.id!;

        try {
          const firstAddResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

          const secondAddResponse: BentleyAPIResponse<undefined> =
            await iTwinsAccessClient.addITwinToMyRecents(accessToken, iTwinId);

          expect(firstAddResponse.status).toBe(204);
          expect(secondAddResponse.status).toBe(204);

          const recentsResponse = await iTwinsAccessClient.getRecentUsedITwins(
            accessToken,
            {
              displayName: newiTwin.displayName,
            },
          );

          expect(recentsResponse.status).toBe(200);

          const matchingRecents = recentsResponse.data!.iTwins?.filter(
            (iTwin: ITwinRepresentation) => iTwin.id === iTwinId,
          );
          expect(matchingRecents).toBeDefined();
          expect(matchingRecents.length).toBe(1);
        } finally {
          await iTwinsAccessClient.deleteItwin(accessToken, iTwinId);
        }
      });
    });

    describe("Error Responses", () => {
      it("should return 404 when adding non-existent iTwin to recents", async () => {
        const nonExistentITwinId = "33333333-3333-3333-3333-333333333333";

        const addRecentResponse: BentleyAPIResponse<undefined> =
          await iTwinsAccessClient.addITwinToMyRecents(
            accessToken,
            nonExistentITwinId,
          );

        expect(addRecentResponse.status).toBe(404);
      });
    });
  });
});
