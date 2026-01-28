/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { describe, expect, it } from "vitest";
import { hasProperty } from "../../types/typeUtils";

describe("typeUtils", () => {
  describe("hasProperty", () => {
    describe("Valid Objects with Properties", () => {
      it("should return true for object with the specified property", () => {
        const obj = { name: "test", age: 30 };
        expect(hasProperty(obj, "name")).toBe(true);
        expect(hasProperty(obj, "age")).toBe(true);
      });

      it("should return true for nested objects", () => {
        const obj = { user: { profile: { name: "John" } } };
        expect(hasProperty(obj, "user")).toBe(true);
      });

      it("should return true for properties with undefined values", () => {
        const obj = { name: "test", value: undefined };
        expect(hasProperty(obj, "value")).toBe(true);
      });

      it("should return true for properties with null values", () => {
        const obj = { name: "test", value: null };
        expect(hasProperty(obj, "value")).toBe(true);
      });

      it("should return true for properties with falsy values", () => {
        const obj = { flag: false, count: 0, text: "" };
        expect(hasProperty(obj, "flag")).toBe(true);
        expect(hasProperty(obj, "count")).toBe(true);
        expect(hasProperty(obj, "text")).toBe(true);
      });

      it("should work with arrays", () => {
        const arr = [1, 2, 3];
        expect(hasProperty(arr, "0")).toBe(true);
        expect(hasProperty(arr, "length")).toBe(true);
      });

      it("should work with class instances", () => {
        class TestClass {
          public name = "test";
        }
        const instance = new TestClass();
        expect(hasProperty(instance, "name")).toBe(true);
      });
    });

    describe("Missing Properties", () => {
      it("should return false when property does not exist", () => {
        const obj = { name: "test" };
        expect(hasProperty(obj, "age")).toBe(false);
      });

      it("should return false for empty object", () => {
        const obj = {};
        expect(hasProperty(obj, "anyProperty")).toBe(false);
      });
    });

    describe("Non-Object Values", () => {
      it("should return false for null", () => {
        expect(hasProperty(null, "property")).toBe(false);
      });

      it("should return false for undefined", () => {
        expect(hasProperty(undefined, "property")).toBe(false);
      });

      it("should return false for primitives - string", () => {
        expect(hasProperty("string", "property")).toBe(false);
      });

      it("should return false for primitives - number", () => {
        expect(hasProperty(123, "property")).toBe(false);
      });

      it("should return false for primitives - boolean", () => {
        expect(hasProperty(true, "property")).toBe(false);
      });

      it("should return false for symbols", () => {
        const sym = Symbol("test");
        expect(hasProperty(sym, "property")).toBe(false);
      });
    });

    describe("Type Narrowing", () => {
      it("should narrow type to Record<string, unknown> when true", () => {
        const data: unknown = { name: "John", age: 30 };
        
        if (hasProperty(data, "name")) {
          // Type is now Record<string, unknown>
          expect(data.name).toBe("John");
          expect(typeof data.name).toBe("string");
        } else {
          expect.fail("Should have property 'name'");
        }
      });

      it("should allow safe property access after type guard", () => {
        const response: unknown = {
          data: { id: "123", value: "test" },
          status: 200
        };

        if (hasProperty(response, "data")) {
          expect(response.data).toBeDefined();
          
          if (hasProperty(response.data, "id")) {
            expect(response.data.id).toBe("123");
          }
        }
      });

      it("should work with complex nested structures", () => {
        const apiResponse: unknown = {
          iTwins: [
            { id: "1", displayName: "Project A" },
            { id: "2", displayName: "Project B" }
          ],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _links: {
            self: { href: "/api/itwins" }
          }
        };

        if (hasProperty(apiResponse, "iTwins")) {
          expect(Array.isArray(apiResponse.iTwins)).toBe(true);
        }

        if (hasProperty(apiResponse, "_links")) {
          expect(hasProperty(apiResponse._links, "self")).toBe(true);
        }
      });
    });

    describe("Edge Cases", () => {
      it("should handle prototype chain properties", () => {
        const obj = Object.create({ inherited: "value" });
        obj.own = "value";
        
        // 'in' operator checks prototype chain
        expect(hasProperty(obj, "own")).toBe(true);
        expect(hasProperty(obj, "inherited")).toBe(true);
      });

      it("should handle symbols as properties", () => {
        const sym = Symbol("test");
        const obj = { [sym]: "value", normal: "prop" };
        
        expect(hasProperty(obj, "normal")).toBe(true);
        // Symbol properties are not string keys
        expect(hasProperty(obj, sym.toString())).toBe(false);
      });

      it("should handle objects with toString override", () => {
        const obj = {
          toString: () => "custom",
          value: 123
        };
        
        expect(hasProperty(obj, "value")).toBe(true);
        expect(hasProperty(obj, "toString")).toBe(true);
      });

      it("should handle frozen objects", () => {
        const obj = Object.freeze({ name: "frozen" });
        expect(hasProperty(obj, "name")).toBe(true);
      });

      it("should handle sealed objects", () => {
        const obj = Object.seal({ name: "sealed" });
        expect(hasProperty(obj, "name")).toBe(true);
      });
    });

    describe("Real-world API Response Scenarios", () => {
      it("should validate BentleyAPIResponse structure", () => {
        const response: unknown = {
          status: 200,
          data: { iTwin: { id: "123" } }
        };

        expect(hasProperty(response, "status")).toBe(true);
        expect(hasProperty(response, "data")).toBe(true);
        expect(hasProperty(response, "error")).toBe(false);
      });

      it("should validate error response structure", () => {
        const errorResponse: unknown = {
          status: 404,
          error: {
            code: "NotFound",
            message: "Resource not found"
          }
        };

        expect(hasProperty(errorResponse, "status")).toBe(true);
        expect(hasProperty(errorResponse, "error")).toBe(true);
        expect(hasProperty(errorResponse, "data")).toBe(false);
      });

      it("should handle HAL links validation", () => {
        const halResponse: unknown = {
          items: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _links: {
            self: { href: "/api/itwins" },
            next: { href: "/api/itwins?skip=10" }
          }
        };

        if (hasProperty(halResponse, "_links")) {
          expect(hasProperty(halResponse._links, "self")).toBe(true);
          expect(hasProperty(halResponse._links, "next")).toBe(true);
          expect(hasProperty(halResponse._links, "prev")).toBe(false);
        }
      });
    });
  });
});
