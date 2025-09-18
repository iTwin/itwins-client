import "dotenv/config";
import { URLSearchParams } from 'url';

// Load environment variables from .env file
// Global test configuration
global.console = {
  ...console,
};

// Polyfill URLSearchParams for jsdom compatibility with OIDC client
if (typeof globalThis.URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = URLSearchParams as any;
}