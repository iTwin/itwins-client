/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/**
 * Type guard to check if an object has a specific property and narrows the type to Record<string, unknown>
 * @param obj - Unknown object to check for property existence
 * @param prop - Property key name to check for
 * @returns True if the object has the specified property, false otherwise
 *
 * @example
 * ```typescript
 * const data: unknown = { name: "John", age: 30 };
 * if (hasProperty(data, "name")) {
 *   console.log(data.name); // ✅ Type-safe access
 * }
 * ```
 */
export function hasProperty(
  obj: unknown,
  prop: string
): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && prop in obj;
}

/**
 * Utility type that creates a mapping object where every property of type T must be mapped to a string value.
 * This ensures you can't forget to handle any properties - TypeScript will give you an error if you miss one.
 *
 * @template T - The source object type whose properties need to be mapped
 *
 * @example
 * ```typescript
 * interface User { name: string; age: number; }
 *
 * // ✅ Valid - all properties mapped
 * const mapping: ParameterMapping<User> = {
 *   name: "user_name",
 *   age: "user_age"
 * };
 *
 * // ❌ TypeScript error - missing 'age' property
 * const incomplete: ParameterMapping<User> = {
 *   name: "user_name"
 *   // Error: Property 'age' is missing!
 * };
 * ```
 */
export type ParameterMapping<T> = {
  [K in keyof Required<T>]: string;
};