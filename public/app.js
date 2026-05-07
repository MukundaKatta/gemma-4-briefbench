const form = document.querySelector("#brief-form");
const provider = document.querySelector("#provider");
const model = document.querySelector("#model");
const notes = document.querySelector("#notes");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const loadSample = document.querySelector("#load-sample");
const copy = document.querySelector("#copy");

let lastMarkdown = "";

const defaults = {
  demo: "gemma-4-31b-it",
  google: "gemma-4-31b-it",
  openrouter: "google/gemma-4-31b-it"
};

provider.addEventListener("change", () => {
  model.value = defaults[provider.value] || defaults.demo;
  status.textContent = provider.value === "demo"
    ? "Ready in demo mode."
    : "Ready. Make sure the matching API key is set on the server.";
});

loadSample.addEventListener("click", async () => {
  status.textContent = "Loading sample notes...";
  const response = await fetch("/api/sample");
  const data = await response.json();
  notes.value = data.sample;
  status.textContent = "Sample loaded.";
});

copy.addEventListener("click", async () => {
  if (!lastMarkdown) {
    status.textContent = "Run an analysis before copying.";
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = lastMarkdown;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  status.textContent = copied
    ? "Copied Markdown brief."
    : "Copy was blocked by the browser. The Markdown is still rendered in the brief.";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true);
  status.textContent = "Asking Gemma 4 for a structured brief...";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: provider.value,
        model: model.value,
        notes: notes.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");
    render(data);
    status.textContent = `Generated with ${data.provider} using ${data.model}.`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    setBusy(false);
  }
});

function setBusy(isBusy) {
  form.querySelectorAll("button, input, select, textarea").forEach((element) => {
    element.disabled = isBusy;
  });
}

function render(data) {
  const analysis = data.analysis;
  const sections = [
    textSection("Summary", analysis.summary),
    textSection("Model rationale", analysis.modelRationale),
    listSection("Risks", analysis.risks, "risks"),
    listSection("Build plan", analysis.buildPlan, "plan"),
    listSection("User experience", analysis.userExperience, "ux"),
    textSection("DEV post angle", analysis.devPostAngle, "angle"),
    listSection("Assumptions", analysis.assumptions)
  ];

  results.innerHTML = sections.join("");
  lastMarkdown = toMarkdown(data);
}

function textSection(title, value, className = "") {
  return `<section class="section ${className}">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(value || "No output.")}</p>
  </section>`;
}

function listSection(title, items = [], className = "") {
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<section class="section ${className}">
    <h3>${escapeHtml(title)}</h3>
    <ul>${list || "<li>No output.</li>"}</ul>
  </section>`;
}

function toMarkdown(data) {
  const a = data.analysis;
  return `# Gemma 4 BriefBench Decision Brief

Generated with ${data.provider} using ${data.model}.

## Summary
${a.summary}

## Model Rationale
${a.modelRationale}

## Risks
${(a.risks || []).map((item) => `- ${item}`).join("\n")}

## Build Plan
${(a.buildPlan || []).map((item) => `- ${item}`).join("\n")}

## User Experience
${(a.userExperience || []).map((item) => `- ${item}`).join("\n")}

## DEV Post Angle
${a.devPostAngle}

## Assumptions
${(a.assumptions || []).map((item) => `- ${item}`).join("\n")}
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
