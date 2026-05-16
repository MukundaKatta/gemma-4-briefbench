# Gemma 4 BriefBench

BriefBench is a local-first challenge project for the DEV Gemma 4 Challenge. It turns messy project notes into a structured decision brief using Gemma 4 at the center of the workflow.

The app is designed for builders who need to decide which Gemma 4 model fits a project, explain that choice, and turn rough notes into a clear implementation plan.

## Why Gemma 4

BriefBench is intentionally shaped around the challenge criteria:

- Gemma 4 does real work: it reads long, messy notes and produces structured sections.
- Model choice is visible: users can choose 31B for richer reasoning or 26B MoE for faster throughput.
- Local-first scenarios are first-class: demo text and prompts focus on privacy-sensitive, edge-friendly workflows.
- The output is submission-ready: it includes model rationale, risks, build steps, and a story angle.

## Run

```bash
npm start
```

Open `http://localhost:4174`.

Run the production checks:

```bash
npm run ci
```

Public links:

- Demo: `https://gemma-4-briefbench.vercel.app`
- Code: `https://github.com/MukundaKatta/gemma-4-briefbench`

By default the app runs in demo mode, so judges can try it immediately. To use Gemma 4 through an API, copy `.env.example` to `.env` and set one of:

```bash
GEMMA_PROVIDER=google
GEMINI_API_KEY=...
GEMMA_GOOGLE_MODEL=gemma-4-31b-it
```

or:

```bash
GEMMA_PROVIDER=openrouter
OPENROUTER_API_KEY=...
GEMMA_OPENROUTER_MODEL=google/gemma-4-31b-it
```

You can also choose the provider and model from the UI. Environment variables keep API keys on the server.

## Submission Assets

- App: `public/index.html`
- Server: `server.mjs`
- Vercel API: `api/analyze.js`, `api/sample.js`
- Sample notes: `samples/civic-tech-note.md`
- DEV post draft: `docs/dev-submission.md`

## Challenge Category

Submit this under **Build With Gemma 4**. If you also publish the article as a separate writing entry, make it materially different from the build post.
