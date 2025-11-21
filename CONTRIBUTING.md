# Contributing to iTwins Client

We welcome contributions to the iTwins Client library! This guide will help you get started with contributing code, reporting issues, and understanding our development workflow.

## Table of Contents

- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Changesets & Versioning](#changesets--versioning)
- [Code Standards](#code-standards)
- [File Headers](#file-headers)

## Reporting Issues

Before creating a new issue, please search existing issues to avoid duplicates.

### What to Include

Please provide the following information:

- **Version**: Which version of `@itwin/itwins-client` you're using
- **Environment**: Node.js version, operating system, browser (if applicable)
- **Steps to Reproduce**: Clear, numbered steps that reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Code Sample**: Minimal code that demonstrates the issue
- **Error Messages**: Full error messages and stack traces

### Issue Template

```markdown
## Description
Brief description of the issue

## Version Information
- `@itwin/itwins-client` version: x.x.x
- Node.js version: x.x.x
- Operating System: Windows/macOS/Linux

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Code Sample
```typescript
// Minimal code that reproduces the issue
```

## Error Messages

```text
Paste any error messages here
```

## Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** for similar requests
2. **Describe the use case** - what problem does this solve?
3. **Provide examples** of how the API should work
4. **Consider backwards compatibility** and breaking changes

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/iTwin/itwins-client.git
cd itwins-client

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

For detailed setup instructions, see [GETTINGSTARTED.md](./GETTINGSTARTED.md).

## Pull Request Process

We follow a feature branch workflow with comprehensive code review.

### Before You Start

1. **Create an issue** to discuss significant changes
2. **Check existing PRs** to avoid duplicate work
3. **Review our coding standards** below

### Creating a Pull Request

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Add a changeset** (see below)
7. **Submit a pull request**

### Pull Request Checklist

- [ ] ✅ **Tests pass**: All existing and new tests pass
- [ ] 🧪 **Tests added**: New functionality includes comprehensive tests
- [ ] 📝 **Changeset added**: Version bump and changelog entry created
- [ ] 📚 **Documentation updated**: README, examples, or API docs updated if needed
- [ ] 🎯 **Single concern**: PR addresses one feature or bug
- [ ] 🔗 **Linked to issue**: PR references related GitHub issue
- [ ] 🚀 **No breaking changes**: Or clearly documented with migration path

### Review Process

- All PRs require review from maintainers
- Automated tests must pass
- Code quality and standards are verified
- Documentation completeness is checked

## Changesets & Versioning

This project uses [Changesets](https://github.com/changesets/changesets) to manage package versioning and changelog generation. **Every PR that affects the public API or user experience must include a changeset.**

### When to Add a Changeset

Add a changeset for:

- ✅ **New features** - API additions, new methods, new options
- ✅ **Bug fixes** - Fixes that affect user experience
- ✅ **Breaking changes** - API removals, signature changes, behavior changes
- ✅ **Performance improvements** - Notable performance enhancements

### When to Use `--empty`

Use `pnpm changeset --empty` for:

- 🚫 **Documentation only** - README updates, code comments, examples
- 🚫 **Internal refactoring** - Code reorganization without API changes
- 🚫 **Build/tooling changes** - CI updates, dev dependencies, build scripts
- 🚫 **Tests only** - Adding tests without changing implementation

### Creating a Changeset

```bash
# Add a changeset for your changes
pnpm changeset

# For documentation-only changes
pnpm changeset --empty
```

Follow the prompts to:

1. **Select affected packages** (usually just `@itwin/itwins-client`)
2. **Choose version bump type**:
   - **patch** (1.0.x) - Bug fixes, minor improvements
   - **minor** (1.x.0) - New features, backwards compatible
   - **major** (x.0.0) - Breaking changes
3. **Write a clear summary** of the change

### Changeset Examples

#### New Feature (Minor)

```bash
$ pnpm changeset
🦋  What kind of change is this for @itwin/itwins-client? › minor
🦋  Please enter a summary for this change (this will be in the changelog).
🦋    (submit empty line to open external editor)
🦋  Summary › Add support for iTwin export filtering by date range

🦋  === Summary of changesets ===
🦋  minor:  @itwin/itwins-client
🦋
🦋      Add support for iTwin export filtering by date range
🦋
🦋  Is this correct? › Yes
```

#### Bug Fix (Patch)

```bash
$ pnpm changeset
🦋  What kind of change is this for @itwin/itwins-client? › patch
🦋  Summary › Fix repository deletion not handling 404 responses gracefully
```

#### Breaking Change (Major)

```bash
$ pnpm changeset
🦋  What kind of change is this for @itwin/itwins-client? › major
🦋  Summary › Remove deprecated createItwin method, use createITwin instead
```

#### Documentation Only (Empty)

```bash
$ pnpm changeset --empty
🦋  Summary › Update README with new authentication examples
```

### Changeset File Format

Changesets create files in `.changeset/` directory:

```markdown
---
"@itwin/itwins-client": minor
---

Add support for iTwin export filtering by date range

New optional parameters `startDate` and `endDate` allow filtering exports by creation time:

```typescript
const exports = await client.getITwinExports(accessToken, iTwinId, {
  startDate: "2024-01-01",
  endDate: "2024-12-31"
});
```

This enhancement improves performance for large iTwins with many historical exports.

### Release Process

1. **Changesets accumulate** in `.changeset/` directory
2. **Release PR created automatically** by Changesets GitHub Action
3. **Review release PR** for version bumps and changelog accuracy
4. **Merge release PR** to trigger automated publishing
5. **New version published** to npm automatically

## Code Standards

This project maintains high code quality standards through:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and style enforcement
- **Prettier**: Consistent code formatting

## File Headers

The following file headers are used in this project. Please use it for new files.

```typescript
/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
```
