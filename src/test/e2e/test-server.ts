/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization,content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

function writeResponse(
  res: ServerResponse,
  status: number,
  headers: Record<string, string>,
  body?: string
) {
  res.writeHead(status, headers);
  res.end(body);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? "/";

  if (req.method === "OPTIONS") {
    writeResponse(res, 204, corsHeaders);
    return;
  }

  if (url.startsWith("/lib/esm/BaseBentleyAPIClient.js")) {
    const filePath = resolve(process.cwd(), "lib/esm/BaseBentleyAPIClient.js");
    const body = await readFile(filePath, "utf-8");
    writeResponse(res, 200, {
      ...corsHeaders,
      "content-type": "application/javascript",
    }, body);
    return;
  }

  if (url === "/" || url.startsWith("/index.html")) {
    const body = "<!doctype html><html><head><meta charset=\"utf-8\" /></head><body>itwins-client e2e</body></html>";
    writeResponse(res, 200, {
      ...corsHeaders,
      "content-type": "text/html",
    }, body);
    return;
  }

  if (url.startsWith("/redirect")) {
    writeResponse(res, 302, {
      ...corsHeaders,
      location: "https://api.bentley.com/final",
    });
    return;
  }

  if (url.startsWith("/final")) {
    const body = JSON.stringify({ ok: true });
    writeResponse(res, 200, {
      ...corsHeaders,
      "content-type": "application/json",
    }, body);
    return;
  }

  writeResponse(res, 404, corsHeaders);
}

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export async function createTestServer(): Promise<TestServer> {
  const server = createServer((req, res) => {
    handleRequest(req, res).catch(() => {
      writeResponse(res, 500, corsHeaders);
    });
  });

  await new Promise<void>((resolvePromise) => {
    server.listen(0, "127.0.0.1", () => resolvePromise());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolvePromise) => server.close(() => resolvePromise())),
  };
}
