/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  Google2DImageryProvider,
  Google2DImageryProviderOptions,
  GraphicsProvider,
  UrlTemplateImageryProvider,
  UrlTemplateImageryProviderOptions
} from "../../types/Repository";

describe("Repository - Graphics Provider Types", () => {
  it("should narrow UrlTemplate provider options by provider name", () => {
    const provider: GraphicsProvider = {
      name: "UrlTemplateImageryProvider",
      options: {
        tilingScheme: "WebMercatorTilingScheme",
        bounds: [-180, -90, 180, 90],
        credit: "Bentley"
      }
    };

    if (provider.name === "UrlTemplateImageryProvider") {
      const options: UrlTemplateImageryProviderOptions = provider.options;

      expectTypeOf(provider).toEqualTypeOf<UrlTemplateImageryProvider>();
      expectTypeOf(options).toEqualTypeOf<UrlTemplateImageryProviderOptions>();

      expect(options.tilingScheme).toBe("WebMercatorTilingScheme");
      expect(options.bounds).toEqual([-180, -90, 180, 90]);
      expect(options.credit).toBe("Bentley");
    } else {
      expect.fail("Expected UrlTemplateImageryProvider");
    }
  });

  it("should narrow Google2D provider options by provider name", () => {
    const provider: GraphicsProvider = {
      name: "Google2DImageryProvider",
      options: {
        mapType: "satellite",
        url: "https://tile.googleapis.com/v1/2dtiles",
        session: "test-session",
        tileWidth: 256,
        tileHeight: 256,
        imageFormat: "png"
      }
    };

    if (provider.name === "Google2DImageryProvider") {
      const options: Google2DImageryProviderOptions = provider.options;

      expectTypeOf(provider).toEqualTypeOf<Google2DImageryProvider>();
      expectTypeOf(options).toEqualTypeOf<Google2DImageryProviderOptions>();

      expect(options.mapType).toBe("satellite");
      expect(options.url).toBe("https://tile.googleapis.com/v1/2dtiles");
      expect(options.session).toBe("test-session");
      expect(options.tileWidth).toBe(256);
      expect(options.tileHeight).toBe(256);
      expect(options.imageFormat).toBe("png");
    } else {
      expect.fail("Expected Google2DImageryProvider");
    }
  });

  it("should support exhaustive handling of known graphics providers", () => {
    const summarizeProvider = (provider: GraphicsProvider): string => {
      switch (provider.name) {
        case "UrlTemplateImageryProvider":
          return provider.options.tilingScheme ?? "url-template";
        case "Google2DImageryProvider":
          return provider.options.mapType ?? "google2d";
        default: {
          const exhaustiveCheck: never = provider;
          return exhaustiveCheck;
        }
      }
    };

    const providers: GraphicsProvider[] = [
      {
        name: "UrlTemplateImageryProvider",
        options: {
          tilingScheme: "WebMercatorTilingScheme"
        }
      },
      {
        name: "Google2DImageryProvider",
        options: {
          mapType: "satellite"
        }
      }
    ];

    expect(providers.map(summarizeProvider)).toEqual([
      "WebMercatorTilingScheme",
      "satellite"
    ]);
  });
});