/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
// @ts-check
/** @type {import("beachball").BeachballConfig } */
module.exports = {
  bumpDeps: false,
  access: "public",
  tag: "latest",
  registry: "https://pkgs.dev.azure.com/bentleycs/_packaging/Packages/npm/registry/",
  ignorePatterns: [
    ".nycrc",
    ".eslintrc.json",
    ".mocharc.json",
    "tsconfig.*",
    ".*ignore",
    ".github/**",
    ".vscode/**",
    "pnpm-lock.yaml",
  ],
  changehint: "Run 'pnpm change' to generate a change file",
  changelog: {
    customRenderers: {
      renderEntry: (entry) => {
        const commitLink = `https://github.com/iTwin/itwins-client/commit/${entry.commit}`;
        return `- ${entry.comment} ([commit](${commitLink}))`;
      },
    },
  },
  verbose: true,
};