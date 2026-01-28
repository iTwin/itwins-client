/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { describe, expect, it } from "vitest";
import type {
  ApimError,
  BentleyAPIResponse,
  ErrorDetail
} from "../../types/CommonApiTypes";

describe("CommonApiTypes - Type Definitions", () => {
  describe("BentleyAPIResponse", () => {
    it("should allow valid success response with data", () => {
      const response: BentleyAPIResponse<{ id: string }> = {
        status: 200,
        data: { id: "123" }
      };

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ id: "123" });
      expect(response.error).toBeUndefined();
    });

    it("should allow valid error response", () => {
      const response: BentleyAPIResponse<never> = {
        status: 404,
        error: {
          code: "NotFound",
          message: "Resource not found"
        }
      };

      expect(response.status).toBe(404);
      expect(response.error).toBeDefined();
      expect(response.data).toBeUndefined();
    });

    it("should allow response with both data and error (edge case)", () => {
      // While unusual, the type allows this
      const response: BentleyAPIResponse<{ partial: string }> = {
        status: 207,
        data: { partial: "data" },
        error: {
          code: "PartialError",
          message: "Partial failure"
        }
      };

      expect(response.status).toBe(207);
      expect(response.data).toBeDefined();
      expect(response.error).toBeDefined();
    });

    it("should support generic type parameter", () => {
      interface CustomData {
        iTwinId: string;
        displayName: string;
        status: "Active" | "Inactive";
      }

      const response: BentleyAPIResponse<CustomData> = {
        status: 200,
        data: {
          iTwinId: "abc-123",
          displayName: "Test iTwin",
          status: "Active"
        }
      };

      expect(response.data!.iTwinId).toBe("abc-123");
      expect(response.data!.status).toBe("Active");
    });

    it("should work with array data types", () => {
      const response: BentleyAPIResponse<string[]> = {
        status: 200,
        data: ["item1", "item2", "item3"]
      };

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(3);
    });

    it("should work with undefined data type", () => {
      const response: BentleyAPIResponse<undefined> = {
        status: 204
      };

      expect(response.status).toBe(204);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });
  });

  describe("ApimError - Error Structure", () => {
    it("should support basic error with code and message", () => {
      const error: ApimError = {
        code: "InvalidRequest",
        message: "The request is invalid"
      };

      expect(error.code).toBe("InvalidRequest");
      expect(error.message).toBe("The request is invalid");
    });

    it("should support error with target", () => {
      const error: ApimError = {
        code: "ValidationError",
        message: "Validation failed",
        target: "displayName"
      };

      expect(error.target).toBe("displayName");
    });

    it("should support nested error details", () => {
      const details: ErrorDetail[] = [
        {
          code: "Required",
          message: "Field is required",
          target: "iTwinClass"
        },
        {
          code: "MaxLength",
          message: "Maximum length exceeded",
          target: "displayName"
        }
      ];

      const error: ApimError = {
        code: "ValidationError",
        message: "Multiple validation errors",
        details
      };

      expect(error.details).toHaveLength(2);
      expect(error.details![0].code).toBe("Required");
      expect(error.details![1].target).toBe("displayName");
    });

    it("should support multiple levels of error details", () => {
      const error: ApimError = {
        code: "ComplexError",
        message: "Complex validation failure",
        details: [
          {
            code: "NestedError",
            message: "Nested validation failed",
            target: "repository"
          },
          {
            code: "InvalidFormat",
            message: "Format is invalid",
            target: "repository.id"
          }
        ]
      };

      expect(error.details).toHaveLength(2);
      expect(error.details![0].code).toBe("NestedError");
      expect(error.details![1].target).toBe("repository.id");
    });

    it("should support error with additional context", () => {
      const error: ApimError = {
        code: "ServiceError",
        message: "Service encountered an error",
        target: "database",
        details: [
          {
            code: "DatabaseError",
            message: "Database connection failed"
          }
        ]
      };

      expect(error.target).toBe("database");
      expect(error.details).toHaveLength(1);
      expect(error.details![0].code).toBe("DatabaseError");
    });

    it("should support common error codes", () => {
      const errorCodes = [
        "BadRequest",
        "Unauthorized",
        "Forbidden",
        "NotFound",
        "Conflict",
        "InternalServerError",
        "ServiceUnavailable",
        "InvalidRequest",
        "ValidationError"
      ];

      errorCodes.forEach(code => {
        const error: ApimError = {
          code,
          message: `Error: ${code}`
        };

        expect(error.code).toBe(code);
      });
    });
  });

  describe("ErrorDetail", () => {
    it("should support basic error detail", () => {
      const detail: ErrorDetail = {
        code: "Required",
        message: "This field is required"
      };

      expect(detail.code).toBe("Required");
      expect(detail.message).toBe("This field is required");
    });

    it("should support error detail with target", () => {
      const detail: ErrorDetail = {
        code: "InvalidValue",
        message: "Value is not valid",
        target: "status"
      };

      expect(detail.target).toBe("status");
    });

    it("should support basic error detail structure", () => {
      const detail: ErrorDetail = {
        code: "ParentError",
        message: "Parent error occurred"
      };

      expect(detail.code).toBe("ParentError");
      expect(detail.message).toBe("Parent error occurred");
    });
  });

  describe("ODataQueryParams", () => {
    it("should support search parameter", () => {
      const params = {
        search: "test project"
      };

      expect(params.search).toBe("test project");
    });

    it("should support top and skip for pagination", () => {
      const params = {
        top: 50,
        skip: 100
      };

      expect(params.top).toBe(50);
      expect(params.skip).toBe(100);
    });

    it("should support all OData query parameters", () => {
      const params = {
        search: "infrastructure",
        top: 25,
        skip: 0
      };

      expect(params.search).toBe("infrastructure");
      expect(params.top).toBe(25);
      expect(params.skip).toBe(0);
    });
  });

  describe("Method Type", () => {
    it("should support all HTTP methods", () => {
      const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

      methods.forEach(method => {
        expect(method).toMatch(/^(GET|POST|PUT|PATCH|DELETE)$/);
      });
    });
  });

  describe("ResultMode Type", () => {
    it("should support minimal result mode", () => {
      const mode: "minimal" | "representation" = "minimal";
      expect(mode).toBe("minimal");
    });

    it("should support representation result mode", () => {
      const mode: "minimal" | "representation" = "representation";
      expect(mode).toBe("representation");
    });
  });

  describe("Real-world Response Scenarios", () => {
    it("should model successful iTwin retrieval", () => {
      interface ITwinData {
        iTwin: {
          id: string;
          displayName: string;
          class: string;
        };
      }

      const response: BentleyAPIResponse<ITwinData> = {
        status: 200,
        data: {
          iTwin: {
            id: "abc-123",
            displayName: "Infrastructure Project",
            class: "Thing"
          }
        }
      };

      expect(response.status).toBe(200);
      expect(response.data!.iTwin.id).toBe("abc-123");
    });

    it("should model 404 not found error", () => {
      const response: BentleyAPIResponse<never> = {
        status: 404,
        error: {
          code: "iTwinNotFound",
          message: "The requested iTwin was not found.",
          target: "iTwinId"
        }
      };

      expect(response.status).toBe(404);
      expect(response.error!.code).toBe("iTwinNotFound");
    });

    it("should model 422 validation error with details", () => {
      const response: BentleyAPIResponse<never> = {
        status: 422,
        error: {
          code: "InvalidiTwinsRequest",
          message: "Cannot process the request.",
          details: [
            {
              code: "InvalidValue",
              message: "Provided 'iTwinClass' value is not valid.",
              target: "iTwinClass"
            },
            {
              code: "MissingRequiredProperty",
              message: "Required property is missing.",
              target: "displayName"
            }
          ]
        }
      };

      expect(response.status).toBe(422);
      expect(response.error!.details).toHaveLength(2);
      expect(response.error!.details![0].target).toBe("iTwinClass");
    });

    it("should model 401 unauthorized error", () => {
      const response: BentleyAPIResponse<never> = {
        status: 401,
        error: {
          code: "Unauthorized",
          message: "The request requires authentication."
        }
      };

      expect(response.status).toBe(401);
      expect(response.error!.code).toBe("Unauthorized");
    });

    it("should model successful DELETE with no content", () => {
      const response: BentleyAPIResponse<undefined> = {
        status: 204
      };

      expect(response.status).toBe(204);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });
  });
});
