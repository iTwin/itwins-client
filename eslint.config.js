import iTwinPlugin from "@itwin/eslint-plugin";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...iTwinPlugin.configs.iTwinjsRecommendedConfig,
  },
  // Only apply JSDoc rules to non-test files
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "src/test/**/*"],
    ...iTwinPlugin.configs.jsdocConfig,
  },
  // Rules for all source files
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-duplicate-imports": "off", // Allow separate type/value imports
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "id-denylist": "off",
    },
  },
  {
    ignores: ["node_modules/**", "lib/**"],
  },
];
