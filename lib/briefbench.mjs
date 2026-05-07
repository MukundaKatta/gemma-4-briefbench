export const systemPrompt = `You are Gemma 4 running inside BriefBench, a local-first project brief analyzer.
Turn messy notes into useful, compact, submission-quality planning output.
Return strict JSON with these keys:
summary: string
modelRationale: string
risks: array of strings
buildPlan: array of strings
userExperience: array of strings
devPostAngle: string
assumptions: array of strings`;

export function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model response did not contain JSON.");
  return JSON.parse(match[0]);
}

export function demoAnalysis(notes, model) {
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

export function buildUserPrompt(notes, model) {
  return `Chosen Gemma 4 model: ${model}

Messy notes:
${notes}

Create a concise decision brief. Be specific, practical, and honest about assumptions.`;
}

export async function callGoogle({ notes, model, apiKey = process.env.GEMINI_API_KEY }) {
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

export async function callOpenRouter({ notes, model, apiKey = process.env.OPENROUTER_API_KEY }) {
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://gemma-4-briefbench.vercel.app",
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

export async function analyzeBrief({ notes, provider, model }) {
  const cleanNotes = String(notes || "").trim();
  const selectedProvider = String(provider || process.env.GEMMA_PROVIDER || "demo").toLowerCase();
  const selectedModel = String(
    model ||
    (selectedProvider === "openrouter" ? process.env.GEMMA_OPENROUTER_MODEL : process.env.GEMMA_GOOGLE_MODEL) ||
    (selectedProvider === "openrouter" ? "google/gemma-4-31b-it" : "gemma-4-31b-it")
  );

  if (cleanNotes.length < 40) {
    const error = new Error("Please add at least a few sentences of notes.");
    error.statusCode = 400;
    throw error;
  }

  const analysis =
    selectedProvider === "google" ? await callGoogle({ notes: cleanNotes, model: selectedModel }) :
    selectedProvider === "openrouter" ? await callOpenRouter({ notes: cleanNotes, model: selectedModel }) :
    demoAnalysis(cleanNotes, selectedModel);

  return {
    provider: selectedProvider,
    model: selectedModel,
    generatedAt: new Date().toISOString(),
    analysis
  };
}
