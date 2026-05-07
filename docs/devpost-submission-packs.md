# Devpost Submission Packs

Prepared May 7, 2026.

## Shared Project Links

- Live demo: https://gemma-4-briefbench.vercel.app
- GitHub: https://github.com/MukundaKatta/gemma-4-briefbench
- DEV build post: https://dev.to/mukundakatta/i-built-briefbench-a-gemma-4-tool-that-turns-messy-notes-into-model-decisions-3m5p
- DEV writing post: https://dev.to/mukundakatta/choosing-gemma-4-for-local-ai-apps-a-builders-field-guide-5105

## 1. IBM x UNSA Hackathon

Challenge: https://ibm-unsa-hackathon.devpost.com/

Status: Submissions open May 8-10, 2026. Requires GitHub/source, screenshots/demo, and a 2-3 minute demo video.

Project title: AidBriefBench

Tagline: AI decision briefs for small nonprofits working on UN SDG projects.

Short description:

AidBriefBench helps nonprofit teams turn messy field notes into structured action briefs. A coordinator can paste operational notes about resources, constraints, risks, and beneficiaries, then receive a concise plan with assumptions, missing information, implementation steps, and communication copy.

Problem:

Small nonprofit and volunteer teams often operate with fragmented information: chat threads, rough notes, spreadsheets, and shifting constraints. They need fast planning support, but they also need privacy and human-reviewable reasoning.

Solution:

AidBriefBench uses a Gemma-powered brief analyzer to convert unstructured notes into decision-ready sections. The output makes assumptions and risks visible so teams can review the plan before acting.

SDG alignment:

- SDG 2: Zero Hunger, through the included food pantry routing use case.
- SDG 10: Reduced Inequalities, by helping small community organizations use AI planning tools without heavy infrastructure.
- SDG 11: Sustainable Cities and Communities, by supporting local logistics and service coordination.

Tech stack:

- Node.js
- Static HTML/CSS/JavaScript
- Vercel serverless API
- Gemma 4 integration path via Google AI Studio or OpenRouter
- Demo mode for judges without API keys

Demo script:

1. Open the deployed app.
2. Click "Load sample" to load the food pantry field notes.
3. Click "Analyze".
4. Show the generated summary, model rationale, risks, build plan, UX notes, and assumptions.
5. Explain how the same structure could support other SDG field workflows.

## 2. DevNetwork AI + ML Hackathon 2026

Challenge: https://devnetwork-ai-ml-hack-2026.devpost.com/

Status: Runs May 11-28, 2026. Submissions open soon.

Project title: BriefBench

Tagline: A model-choice and decision-intelligence workbench for AI builders.

Short description:

BriefBench turns rough product notes into structured AI implementation briefs. It helps builders explain which model belongs at the center of a workflow, what constraints matter, what risks remain, and what the next implementation steps should be.

Problem:

AI teams often jump from idea to prototype without documenting why a model was chosen or what assumptions the system is making. This creates fragile demos and unclear product decisions.

Solution:

BriefBench makes model reasoning visible. It takes messy notes and emits structured JSON that the UI renders as a decision brief. This gives teams a reusable way to compare model choices, surface risks, and turn AI output into product UI.

Tech stack:

- Node.js
- Static frontend
- Serverless API
- Gemma 4 API integration path
- Vercel deployment

Judging pitch:

BriefBench is intentionally small, but it targets a real problem in AI product development: decision quality. Instead of another chatbot, it uses AI to create inspectable planning artifacts that humans can review, copy, and act on.

## 3. Google Cloud Rapid Agent Hackathon

Challenge: https://rapid-agent.devpost.com/

Status: Deadline June 11, 2026.

Project title: RapidBrief Agent

Tagline: A Google Cloud agent that turns documents, notes, and project context into deployable action plans.

Recommended next build:

Extend BriefBench into a real agent workflow:

- ingest Markdown notes or uploaded docs
- run a planning pass
- run a risk-review pass
- produce a final implementation brief
- optionally file GitHub issues or generate a README

Why not submit today:

This should use Google Cloud agent tooling to be competitive and honest for the challenge. The current BriefBench app is a good seed, but not yet a Google Cloud Rapid Agent submission.

## 4. Agents Assemble - Healthcare AI Endgame

Challenge: https://agents-assemble.devpost.com/

Status: Deadline May 11, 2026.

Why not submit current app as-is:

This challenge requires use of the Prompt Opinion platform, MCP/A2A/FHIR integration, marketplace publishing, and a demo video under 3 minutes showing the project working within Prompt Opinion.

Possible project title: CareBrief MCP

Valid next build:

Create a healthcare-specific MCP tool that accepts de-identified handoff notes and returns:

- structured care summary
- missing information
- FHIR resource hints
- clinician review checklist
- safety caveats

This needs a separate implementation and Prompt Opinion integration before submission.
