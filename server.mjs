import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

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

const systemPrompt = `You are Gemma 4 running inside BriefBench, a local-first project brief analyzer.
Turn messy notes into useful, compact, submission-quality planning output.
Return strict JSON with these keys:
summary: string
modelRationale: string
risks: array of strings
buildPlan: array of strings
userExperience: array of strings
devPostAngle: string
assumptions: array of strings`;

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

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model response did not contain JSON.");
  return JSON.parse(match[0]);
}

function demoAnalysis(notes, model) {
  const lower = notes.toLowerCase();
  const privacy = lower.includes("privacy") || lower.includes("sensitive") || lower.includes("local");
  const mobile = lower.includes("phone") || lower.includes("raspberry") || lower.includes("edge");
  const logistics = lower.includes("route") || lower.includes("driver") || lower.includes("dispatch");

  return {
    summary: "BriefBench found a practical local-AI workflow: convert scattered operational notes into a clear plan, surface missing information, and produce a coordinator-friendly message.",
    modelRationale: mobile
      ? `${model} is a good default for the richer analysis path, while Gemma 4 E2B or E4B would be the edge deployment target when the workflow moves onto phones or a Raspberry Pi.`
      : `${model} fits the prototype because the notes benefit from Gemma 4's long-context synthesis and structured reasoning.`,
    risks: [
      privacy ? "Sensitive fields should be redacted before any hosted API call; local Gemma 4 deployment is the preferred production path." : "The project should define what data can leave the device before real users try it.",
      logistics ? "Route recommendations need human review because traffic, cold storage, and volunteer constraints change quickly." : "The app should keep a visible assumptions section so users can audit the model's reasoning.",
      "The submission needs a short demo dataset and screenshots so judges can understand the workflow quickly."
    ],
    buildPlan: [
      "Keep the first version focused on one input box, one sample note, and one structured brief.",
      "Use Gemma 4 to emit JSON sections instead of freeform prose so the UI can stay scannable.",
      "Add a provider switch for demo, Google AI Studio, and OpenRouter so the project remains easy to judge.",
      "Document why the chosen Gemma 4 model is the right tradeoff for the scenario."
    ],
    userExperience: [
      "Show provider, model, and privacy posture before analysis starts.",
      "Make risks and assumptions visually distinct from the summary.",
      "Let users copy the generated brief as Markdown for DEV or GitHub."
    ],
    devPostAngle: "A strong DEV post can frame this as a tiny tool for making model choice legible: Gemma 4 is not hidden behind a chat box, it is used to turn messy context into a reviewable decision brief.",
    assumptions: [
      "The current response is demo mode unless a Gemma API key is configured.",
      "Human users remain responsible for operational decisions.",
      "The project is optimized for challenge review, not production dispatch."
    ]
  };
}

function buildUserPrompt(notes, model) {
  return `Chosen Gemma 4 model: ${model}

Messy notes:
${notes}

Create a concise decision brief. Be specific, practical, and honest about assumptions.`;
}

async function callGoogle({ notes, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(notes, model) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.35 }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Google API request failed.");
  return extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
}

async function callOpenRouter({ notes, model }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4174",
      "X-Title": "Gemma 4 BriefBench"
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(notes, model) }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenRouter request failed.");
  return extractJson(data.choices?.[0]?.message?.content || "");
}

async function handleAnalyze(request, response) {
  try {
    const body = await readRequestBody(request);
    const notes = String(body.notes || "").trim();
    const provider = String(body.provider || process.env.GEMMA_PROVIDER || "demo").toLowerCase();
    const model = String(
      body.model ||
      (provider === "openrouter" ? process.env.GEMMA_OPENROUTER_MODEL : process.env.GEMMA_GOOGLE_MODEL) ||
      (provider === "openrouter" ? "google/gemma-4-31b-it" : "gemma-4-31b-it")
    );

    if (notes.length < 40) {
      sendJson(response, 400, { error: "Please add at least a few sentences of notes." });
      return;
    }

    const analysis =
      provider === "google" ? await callGoogle({ notes, model }) :
      provider === "openrouter" ? await callOpenRouter({ notes, model }) :
      demoAnalysis(notes, model);

    sendJson(response, 200, {
      provider,
      model,
      generatedAt: new Date().toISOString(),
      analysis
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
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
