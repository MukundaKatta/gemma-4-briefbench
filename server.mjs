import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeBrief } from "./lib/briefbench.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");

await loadDotEnv();

const port = Number(process.env.PORT || 4174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

async function loadDotEnv() {
  try {
    const envText = await readFile(join(root, ".env"), "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // A .env file is optional; demo mode works without one.
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function handleAnalyze(request, response) {
  try {
    const body = await readRequestBody(request);
    sendJson(response, 200, await analyzeBrief(body));
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message });
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/analyze") {
    await handleAnalyze(request, response);
    return;
  }

  if (request.method === "GET" && request.url === "/api/sample") {
    const sample = await readFile(join(root, "samples", "civic-tech-note.md"), "utf8");
    sendJson(response, 200, { sample });
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405);
    response.end("Method not allowed");
    return;
  }

  await serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`Gemma 4 BriefBench running at http://localhost:${port}`);
});
