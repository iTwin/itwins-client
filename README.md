# iTwins Client Library

[![npm version](https://badge.fury.io/js/@itwin%2Fitwins-client.svg)](https://badge.fury.io/js/@itwin%2Fitwins-client)

A comprehensive TypeScript library for Bentley Systems' iTwins API, providing type-safe access to infrastructure digital twins, repositories, exports, and image management.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Development](#️development)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

Get up and running with iTwins Client in just a few steps:

```bash
npm install @itwin/itwins-client
```

```typescript
import { ITwinsClient } from "@itwin/itwins-client";

const client = new ITwinsClient();
const accessToken = "your-access-token-string";
const response = await client.getITwins(accessToken, { subClass: "Project" });
console.log(`Found ${response.data!.iTwins.length} iTwins`);
```

## Installation

```bash
# Using npm
npm install @itwin/itwins-client

# Using yarn
yarn add @itwin/itwins-client

# Using pnpm
pnpm add @itwin/itwins-client
```

## Basic Usage

### Authentication

All API methods require an access token string. See the [iTwin Platform documentation](https://developer.bentley.com/tutorials/create-and-query-itwins-guide/#1-register-an-application) for authentication setup.

### Environment Configuration

Configure different deployment environments using `globalThis.IMJS_URL_PREFIX`:

```typescript
// Development environment
globalThis.IMJS_URL_PREFIX = "dev-";

// QA environment
globalThis.IMJS_URL_PREFIX = "qa-";

// Production (default)
globalThis.IMJS_URL_PREFIX = undefined;
```

## Documentation

### Core Documentation

| Document | Purpose |
|----------|---------|
| **[Getting Started Guide](./GETTINGSTARTED.md)** | Complete setup and first steps |
| **[API Examples](./docs/EXAMPLES.md)** | Comprehensive usage examples |
| **[Migration Guide v1→v2](./MIGRATION-GUIDE-v1-to-v2.md)** | Upgrading from v1.x to v2.x |
| **[Contributing Guide](./CONTRIBUTING.md)** | Development and contribution workflow |
| **[AI Coding Instructions](./.github/copilot-instructions.md)** | Guidelines for AI assistants |

## API Reference

### Core Classes

- **`ITwinsClient`** - Main client for all iTwins operations
- **`BaseITwinsApiClient`** - Base client with common HTTP functionality

### Key Features

- ✅ **Complete CRUD operations** for iTwins and repositories
- ✅ **HAL specification compliance** for navigation links
- ✅ **Image upload and processing** capabilities
- ✅ **Export functionality** for bulk data operations

### Quick Reference

```typescript
import { ITwinsClient } from "@itwin/itwins-client";
import type {
  BentleyAPIResponse,
  ITwinMinimal,
  MultiITwinMinimalResponse
} from "@itwin/itwins-client";

const client = new ITwinsClient();
const accessToken = "your-access-token-string";

// Get iTwins
const response = await client.getITwins(accessToken, {
  subClass: "Project",
  top: 10,
  resultMode: "minimal"
});

// Create iTwin
const newITwin = await client.createITwin(accessToken, {
  displayName: "My New iTwin",
  subClass: "Asset",
  class: "Thing"
});

// Work with repositories
const repos = await client.getRepositories(accessToken, iTwinId);
```

## About this Repository

The **@itwin/itwins-client** package provides a modern, type-safe interface to Bentley Systems' iTwins platform APIs. It manages infrastructure digital twins (iTwins), repositories, exports, images, and related resources.

For more information about the iTwins platform and APIs, visit:

- [iTwin Developer Portal](https://developer.bentley.com/)
- [iTwins API Documentation](https://developer.bentley.com/apis/itwins/)
- [iTwin.js Platform](http://www.itwinjs.org)

## Development

### Prerequisites

- Node.js 18+ and pnpm
- TypeScript 4.5+
- Valid iTwin Platform credentials

### Building from Source

```bash
git clone https://github.com/iTwin/itwins-client.git
cd itwins-client
pnpm install
pnpm build
```

### Running Tests
.env file setup is required for tests view [Getting Started](./GETTINGSTARTED.md) for more information.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- How to submit issues and feature requests
- Development workflow and coding standards
- Pull request process and review guidelines
- Testing requirements and conventions
- How to use changesets for versioning

### Versioning

This project uses [Changesets](https://github.com/changesets/changesets) for version management. For more information view [Contributing Guide](./CONTRIBUTING.md).

## License

Copyright © Bentley Systems, Incorporated. All rights reserved.

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

---

