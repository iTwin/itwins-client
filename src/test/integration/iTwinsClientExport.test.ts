/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { beforeAll, describe, expect, it } from "vitest";
import { ITwinsClient } from "../../iTwinsClient";
import type { ITwinExportSingleResponse } from "../../types/ITwinExport";
import { TestConfig } from "../TestConfig";


describe("iTwinsClient Export Functionality", () => {
  const iTwinsAccessClient: ITwinsClient = new ITwinsClient();
  let accessToken: AccessToken;

  beforeAll(async () => {
    accessToken = await TestConfig.getAccessToken();
  }, 120000);

  // only have one success case,
  // A user can only have one Queued or InProgress export job at a time.
  // A user can only create 3 export jobs per hour.
  // **Primary Success Test** - Keep only one comprehensive success test
  // todo how does the service handle testing this ? Rates limiting on test user seems weird is there an white list?
  it("should create an iTwin export with comprehensive validation", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "Asset,Project",
      select: "id,displayName,status,number,createdDateTime",
      filter: "status+eq+'Active'",
      includeInactive: false
    });

    const testExportData = (exportData: ITwinExportSingleResponse["export"]) => {
      expect(exportData).toBeDefined();
      expect(exportData.id).toBeDefined();
      expect(exportData.status).toBeOneOf(["Queued", "InProgress", "Failed", "Completed"]);
      expect(exportData.request.outputFormat).toBe("JsonGZip");
      expect(exportData.request.queryScope).toBe("MemberOfiTwin");
      expect(exportData.request.subClass).toBe("Asset,Project");
      expect(exportData.request.select).toBe("id,displayName,status,number,createdDateTime");
      expect(exportData.request.filter).toBe("status+eq+'Active'");
      expect(exportData.request.includeInactive).toBe(false);
      expect(exportData.createdBy).toBeDefined();
      expect(exportData.createdDateTime).toBeDefined();
      if(exportData.status === "Completed") {
      expect(exportData.outputUrl).toBeDefined();
      } else {
      expect(exportData.outputUrl).toBeNull();
      }
    };

    // Assert - Comprehensive validation
    expect(exportResponse.status).toBe(201);
    expect(exportResponse.data).toBeDefined();
    testExportData(exportResponse.data!.export);

    const getExportResponse = await iTwinsAccessClient.getExport(accessToken, exportResponse.data!.export.id);
    expect(getExportResponse.status).toBe(200);
    expect(getExportResponse.data).toBeDefined();
    testExportData(getExportResponse.data!.export);

    const getExportsResponse = await iTwinsAccessClient.getExports(accessToken);
    expect(getExportsResponse.status).toBe(200);
    expect(getExportsResponse.data).toBeDefined();
    expect(getExportsResponse.data!.exports.length).toBeGreaterThan(0);
    expect(getExportsResponse.data!.exports.some(exp => exp.id === exportResponse.data!.export.id)).toBe(true);
    testExportData(getExportsResponse.data!.exports.find(exp => exp.id === exportResponse.data!.export.id)!);
  });

  it("should return 422 when creating export with invalid output format", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "InvalidFormat" as any,
      queryScope: "MemberOfiTwin",
      subClass: "Asset"
    });

    // Assert
    expect(exportResponse.status).toBe(422);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(exportResponse.error!.details).toBeDefined();
    expect(exportResponse.error!.details!.some(detail =>
      detail.code === "InvalidValue" && detail.target === "outputFormat"
    )).toBe(true);
  });

  it("should return 422 when creating export with invalid query scope", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "JsonGZip",
      queryScope: "InvalidScope" as any,
      subClass: "Asset"
    });

    // Assert
    expect(exportResponse.status).toBe(422);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(exportResponse.error!.details).toBeDefined();
    expect(exportResponse.error!.details!.some(detail =>
      detail.code === "InvalidValue" && detail.target === "queryScope"
    )).toBe(true);
  });

  it("should return 422 when creating export with invalid subClass", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "InvalidSubClass" as any
    });

    // Assert
    expect(exportResponse.status).toBe(422);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(exportResponse.error!.details).toBeDefined();
    expect(exportResponse.error!.details!.some(detail =>
      detail.code === "InvalidValue" && detail.target === "subClass"
    )).toBe(true);
  });

  it("should return 422 when creating export with malformed filter syntax", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "Asset",
      filter: "invalid filter syntax without proper operators"
    });

    // Assert
    expect(exportResponse.status).toBe(422);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(exportResponse.error!.message).toBeDefined();
    expect(exportResponse.error!.message).toBe("Syntax error at position 14 in 'invalid filter syntax without proper operators'.")
  });

  it("should return 422 when creating export with invalid select field names", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport(accessToken, {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "Asset",
      select: "id,invalidFieldName,anotherInvalidField"
    });

    // Assert
    expect(exportResponse.status).toBe(422);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InvalidiTwinsRequest");
    expect(exportResponse.error!.details).toBeDefined();
    expect(exportResponse.error?.message).toBe("Cannot query iTwins.");
    expect(exportResponse.error!.details!.some(detail =>
      detail.code === "InvalidValue" && detail.target === "$select" && detail.message === "The $select string contains an unknown property 'invalidFieldName'."
    )).toBe(true);
  });

  it("should return 500 when creating export without authorization header", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport("", {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "Asset"
    });

    // Assert
    expect(exportResponse.status).toBe(500);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error!.code).toBe("InternalServerError");
  });

  it("should return 401 when creating export with invalid access token", async () => {
    // Act
    const exportResponse = await iTwinsAccessClient.createExport("invalid-token", {
      outputFormat: "JsonGZip",
      queryScope: "MemberOfiTwin",
      subClass: "Asset"
    });

    // Assert
    expect(exportResponse.status).toBe(401);
    expect(exportResponse.data).toBeUndefined();
    expect(exportResponse.error).toBeDefined();
    expect(exportResponse.error?.message).toBe("Authorization scheme 'invalid-token' is not valid.");
    expect(exportResponse.error!.code).toBe("InvalidAuthorizationScheme");
  });
});
