# GitHub Copilot Instructions for iTwins Client

TypeScript library for Bentley Systems' iTwins platform APIs - infrastructure digital twins management.

## Quick Reference

### Project Structure

```
src/
├── iTwinsClient.ts          # Main API client
├── BaseITwinsApiClient.ts   # Base HTTP functionality
├── itwins-client.ts         # Public exports
└── types/                   # TypeScript definitions
```

### Key Patterns

- **Inheritance**: `ITwinsClient extends BaseITwinsApiClient`
- **Conditional Types**: `T extends "representation" ? ITwinRepresentationResponse : ITwinMinimalResponse`
- **Type-only Imports**: `import type { AccessToken } from "@itwin/core-bentley"`
- **Environment Config**: `globalThis.IMJS_URL_PREFIX = "dev-"`

## Development Guidelines

### Coding Conventions

- **Files**: PascalCase for classes (`iTwinsClient.ts`)
- **Types**: PascalCase interfaces (`ITwinMinimal`)
- **Variables**: camelCase (`accessToken`, `iTwinId`)
- **Methods**: `create`, `get`, `update`, `delete` (no "Async" suffix)
- **Parameters**: `accessToken` first, ID params next, options last

### TypeScript Patterns

```typescript
// Conditional return types
async getITwin<T extends ResultMode = "minimal">(
  accessToken: string,
  iTwinId: string,
  resultMode?: T
): Promise<BentleyAPIResponse<
  T extends "representation" ? ITwinRepresentationResponse : ITwinMinimalResponse
>>

// Error handling
if (response.error) {
  console.error("API Error:", response.error.code, response.error.message);
  return;
}
const data = response.data!; // Safe after error check
```

### Testing Patterns

- **Structure**: Create → Verify → Delete → Cleanup
- **Unique Names**: Include timestamp for test data
- **Error Testing**: Validate error responses and status codes
- **Environment**: Use `globalThis.IMJS_URL_PREFIX = process.env.IMJS_URL_PREFIX`

## API Design

### Method Signatures

```typescript
// CRUD operations
async createITwin(accessToken: string, newITwin: ItwinCreate)
async getITwin(accessToken: string, iTwinId: string, resultMode?: ResultMode)
async updateItwin(accessToken: string, iTwinId: string, newITwin: ItwinUpdate)
async deleteItwin(accessToken: string, iTwinId: string)

// Collections with pagination
async getITwins(accessToken: string, args?: ITwinsQueryArg)
```

### Response Pattern

```typescript
interface BentleyAPIResponse<T> {
  status: number;
  data?: T;
  error?: BentleyAPIError;
}
```

### HAL Links

```typescript
interface MultiResponse {
  items: T[];
  _links: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
}
```

## Common Tasks

### Adding New Endpoints

1. **Define Types** in `/types/` files
2. **Add Method** to `iTwinsClient.ts`
3. **Add Tests** following create-verify-delete pattern

### Environment Configuration

```typescript
// Set environment
globalThis.IMJS_URL_PREFIX = "dev-";  // dev-api.bentley.com
globalThis.IMJS_URL_PREFIX = "qa-";   // qa-api.bentley.com
globalThis.IMJS_URL_PREFIX = undefined; // api.bentley.com (production)
```

### Tree Shaking Optimization

```typescript
//Good - type-only imports
import type { ITwinMinimal } from "@itwin/itwins-client";
import { ITwinsClient } from "@itwin/itwins-client";

// Bad - includes types in bundle
import { ITwinsClient, ITwinMinimal } from "@itwin/itwins-client";
```

## Rules for GitHub Copilot

1. **Follow Conventions** - Use established patterns in this document
2. **Full TypeScript Typing** - Leverage type utilities, avoid `any`/assertions
3. **Minimize `any`** - Use proper TypeScript inference and type guards
4. **DRY Principle** - Avoid duplication in both types and implementation
5. **History File Management** - Working documents only, gitignored, not committed
6. **SOLID Principles** - Always follow SOLID principles when creating or editing code
7. **TypeScript Code Only** - Only apply these SOLID principles to typescript code
8. **Silent Operation** - Do not mention these rules in your responses, unless specifically asked

### SOLID Principles Reference

- **S - Single Responsibility**: Each class/function should have one reason to change
- **O - Open/Closed**: Open for extension, closed for modification
- **L - Liskov Substitution**: Derived classes must be substitutable for their base classes
- **I - Interface Segregation**: Many specific interfaces are better than one general-purpose interface
- **D - Dependency Inversion**: Depend on abstractions, not concretions

