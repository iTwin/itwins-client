# Getting Started with iTwins Client

This guide will help you get up and running with the iTwins Client library, from installation through your first API calls.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Authentication Setup](#authentication-setup)
- [Your First iTwin Query](#your-first-itwin-query)
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Testing Setup](#testing-setup)
- [Next Steps](#next-steps)

## Prerequisites

Before getting started, ensure you have:

- **Node.js 18+** and a package manager (npm, yarn, or pnpm)
- **TypeScript 4.5+** (if using TypeScript)
- **Valid iTwin Platform credentials** - see [iTwin Developer Portal](https://developer.bentley.com/tutorials/create-and-query-itwins-guide/#1-register-an-application)

## Installation

Install the iTwins Client:

```bash
# Using npm
npm install @itwin/itwins-client

# Using yarn
yarn add @itwin/itwins-client

# Using pnpm
pnpm add @itwin/itwins-client
```

## Authentication Setup

The iTwins Client requires an access token string. You'll need to set up authentication with the iTwin Platform:

1. **Register your application** at the [iTwin Developer Portal](https://developer.bentley.com/tutorials/create-and-query-itwins-guide/#1-register-an-application)
2. **Get your client credentials** (client ID, client secret, redirect URIs)
3. **Implement authentication flow** using one of the iTwin.js authentication packages

### Basic Authentication Example

```typescript
import { TestUtility } from "@itwin/oidc-signin-tool";

// For testing/development - use appropriate auth for production
const userCredentials = {
  email: "your-test-email@example.com",
  password: "your-password",
};

const accessToken: string = await TestUtility.getAccessToken(userCredentials);
```

## Your First iTwin Query

Once you have authentication set up, making your first API call is straightforward:

```typescript
import { ITwinsClient } from "@itwin/itwins-client";
import type { BentleyAPIResponse, MultiITwinMinimalResponse } from "@itwin/itwins-client";

async function getMyITwins(): Promise<void> {
  // Initialize the client
  const client = new ITwinsClient();

  // Get your access token (implementation depends on your auth setup)
  const accessToken: string = await getAccessToken(); // Your auth implementation

  // Make your first API call
  const response: BentleyAPIResponse<MultiITwinMinimalResponse> =
    await client.getITwins(accessToken, {
      subClass: "Project",
      top: 10
    });

  // Check for errors
  if (response.error) {
    console.error("API Error:", response.error.message);
    return;
  }

  // Success! Use the data
  const iTwins = response.data!.iTwins;
  console.log(`Found ${iTwins.length} iTwins:`);

  iTwins.forEach(itwin => {
    console.log(`- ${itwin.displayName} (${itwin.id})`);
  });
}

// Run your first query
getMyITwins().catch(console.error);
```

## Environment Configuration

The iTwins Client supports different deployment environments (development, QA, production):

### Using Global Configuration

```typescript
// Development environment
globalThis.IMJS_URL_PREFIX = "dev-";

// QA environment
globalThis.IMJS_URL_PREFIX = "qa-";

// Production (default)
globalThis.IMJS_URL_PREFIX = undefined;

// Now all client instances will use the configured environment
const client = new ITwinsClient();
```

### Using Custom URLs

```typescript
// Custom base URL for specific deployments
const client = new ITwinsClient("https://your-custom-api.bentley.com/itwins");
```

### Environment Variables (Node.js)

```typescript
// Bridge from process.env in Node.js applications
globalThis.IMJS_URL_PREFIX = process.env.IMJS_URL_PREFIX;
```

## Development Setup

If you're contributing to the iTwins Client or building from source:

### Clone and Build

```bash
git clone https://github.com/iTwin/itwins-client.git
cd itwins-client
pnpm install
pnpm build
```

### Development Commands

```bash
# Build the library
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Build API documentation
pnpm docs

# Clean build artifacts
pnpm clean
```

## Testing Setup

For integration testing, you'll need to configure test credentials and environments.

### Environment File Setup For Bentley Developers

```bash
az login  # Authenticate with Azure CLI

./setup-env.ps1 # Set up .env file with required variables

```

### Environment File Setup For Non-Bentley Developers

Create a `.env` file in the root directory with the following variables:

```bash
# Environment Configuration
IMJS_URL_PREFIX=""                    # Environment must be empty

# OIDC Configuration (required for authentication)
IMJS_OIDC_BROWSER_TEST_CLIENT_ID="spa-your-client-id-here"
IMJS_OIDC_BROWSER_TEST_REDIRECT_URI="http://localhost:3000/signin-callback"
IMJS_OIDC_BROWSER_TEST_SCOPES="itwin-platform"
IMJS_OIDC_AUTHING_BROWSER_TEST_SCOPES="itwin-platform"

# Test User Authentication (for testing only)
IMJS_ITWIN_TEST_USER="your-test-email@example.com"
IMJS_ITWIN_TEST_USER_PASSWORD="your-test-password"

# Test Data (required for integration tests)
IMJS_TEST_PROJECT_ID="your-test-project-itwin-id"
IMJS_TEST_ASSET_ID="your-test-asset-itwin-id"
```

### Test User Requirements

Your test user must have appropriate permissions:

- **Project Administrator** or **ITwin Owner** role on test iTwins
- **Connect Services Admin** role for creating iTwins (if testing CRUD operations)
- Access to both **Project** and **Asset** level iTwins for comprehensive testing

### Running Tests

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run integration tests
pnpm test
```

For more details about testing, see the [test documentation](./src/test/README.md) and existing test files in `src/test/integration/`.

## Next Steps

Now that you have the basics working, explore these areas:

### Documentation

- **[Complete Examples](./docs/EXAMPLES.md)** - Comprehensive usage examples
- **[Migration Guide](./MIGRATION-GUIDE-v1-to-v2.md)** - If upgrading from v1.x

### Additional Resources

- [iTwin Developer Portal](https://developer.bentley.com/) - Platform documentation
- [iTwins API Reference](https://developer.bentley.com/apis/itwins/) - REST API details
- [iTwin.js Platform](https://www.itwinjs.org/) - Complete iTwin ecosystem
- [GitHub Repository](https://github.com/iTwin/itwins-client) - Source code and issues

---

## Troubleshooting

### Common Issues

#### Authentication Errors (401)

- Verify your access token is valid and not expired
- Check that your application has the correct scopes
- Ensure you're using the right environment (dev/qa/prod)

#### Not Found Errors (404)

- Verify iTwin IDs are correct and accessible to your user
- Check that you have permissions to access the requested resources
- Ensure you're targeting the correct environment

#### Validation Errors (422)

- Review the `error.details` array for specific validation failures
- Check required fields and data types in your requests
- Verify enum values match the expected API constants

#### Network/Timeout Issues

- Check your internet connection and firewall settings
- Verify the API endpoint URLs are accessible
- Consider implementing retry logic for transient failures

### Getting Help

- **Check the [GitHub Issues](https://github.com/iTwin/itwins-client/issues)** for known problems
- **Review the [Examples](./docs/EXAMPLES.md)** for working code patterns
- **See the [Contributing Guide](./CONTRIBUTING.md)** for support resources
- **Visit the [iTwin Developer Portal](https://developer.bentley.com/)** for platform support

---

*Ready to build amazing iTwin applications? Start with the [examples](./docs/EXAMPLES.md)