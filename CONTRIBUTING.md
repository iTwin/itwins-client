# Contributing

This project accepts contributions from other teams at Bentley.

## Table of Contents

- [Creating Issues and Enhancements](#creating-issues-and-enhancements)
    - [Writing Good Bug Reports and Feature Requests](#writing-good-bug-reports-and-feature-requests)
    - [Final Checklist](#final-checklist)
- [Pull Requests](#pull-requests)
    - [Submitting Pull Requests](#submitting-pull-requests)
- [File Headers](#file-headers)
- [Editor Config](#editor-config)
    - [VS Code](#vs-code)
    - [Visual Studio](#visual-studio)

## Creating Issues and Enhancements

Have you identified a reproducible problem in this code? Have a feature requests? Please enter a Bug or Product Backlog Item, but first make sure that you search the work items to make sure that it has not been entered yet. If you find your issue already exists, make relevant comments.

All work in this repository and every pull request must have a linked work item.

### Writing Good Bug Reports and Feature Requests

File a single issue per problem and feature request. Do not enumerate multiple bugs or feature requests in the same issue.

Do not add your issue as a comment to an existing issue unless it's for the identical input. Many issues look similar, but have different causes.

The more information you can provide, the more likely someone will be successful at reproducing the issue and finding a fix.

Please include the following with each issue:

* Version of the code
* Your operating system
* Reproducible steps (1... 2... 3...) that cause the issue
* What you expected to see, versus what you actually saw
* Images, animations, or a link to a video showing the issue occurring
* A code snippet that demonstrates the issue or a link to a code repository the developers can easily pull down to recreate the issue locally

### Final Checklist

Please remember to do the following:

* [ ] Search work items to ensure your report is a new issue
* [ ] Simplify your code around the issue to better isolate the problem

## Pull Requests

We follow a [feature branch and pull request workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) to ensure that all code changes in this repository are code reviewed and all tests pass. This means that there will be a number of reviewers that formally review and sign off for changes. Reviewers should check for redundancy, optimization, stylization, and standardization in each changeset. While we will try to keep this repository as collaborative and open-source as possible, it must also be reliable.

Every change must be tested with proper unit tests. Integration tests are highly encouraged in libraries with critical workflows to ensure end-to-end consistency.

### Submitting Pull Requests

- **DO** ensure you have added unit tests for your changes.
- **DO** run all unit tests before you submit your pull request.
- **DO** link the pull request to a Work Item.
- **DO** ensure submissions pass all Continuous Integration and are merge conflict free.
- **DO** follow the [.editorconfig](http://editorconfig.org/) settings for each directory.
- **DON'T** submit large code formatting changes without discussing with the team first.
- **DON'T** surprise us with big pull requests. Instead, file an issue and start a discussion so we can agree on a direction before you invest a large amount of time.
- **DON'T** fix merge conflicts using a merge commit. Prefer `git rebase`.
- **DON'T** mix independent, unrelated changes in one PR.

If you are unfamiliar with creating pull requests, please read [PULL_REQUESTS.md](PULL_REQUESTS.md).

These two blogs posts on contributing code to open source projects are good too: [Open Source Contribution Etiquette](http://tirania.org/blog/archive/2010/Dec-31.html) by Miguel de Icaza and [Don’t “Push” Your Pull Requests](https://www.igvita.com/2011/12/19/dont-push-your-pull-requests/) by Ilya Grigorik.

## File Headers

The following file headers are used in this project. Please use it for new files.

```typescript
/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
```

## Editor Config

This project uses an `.editorconfig` file to maintain a consistent style standard (braces, tabs, etc.) across all files in the solution. For more information or to find extensions for code editors other than VS Code and Visual Studio, see the [EditorConfig](https://editorconfig.org/) website.

### VS Code

Download the [EditorConfig for VSCode](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) to override your user/workspace settings with settings found in this repository's `.editorconfig` files.

### Visual Studio

Visual Studio 2017 and newer comes with EditorConfig support built in. Older versions of Visual Studio will need to install the [EditorConfig extension](https://marketplace.visualstudio.com/items?itemName=EditorConfigTeam.EditorConfig).
