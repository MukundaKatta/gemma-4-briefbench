# IBM x UNSA Hackathon Submission

## Project Title

AidBriefBench

## Tagline

AI decision briefs for small nonprofits working on UN SDG field operations.

## Demo

Live demo: https://gemma-4-briefbench.vercel.app

Source code: https://github.com/MukundaKatta/gemma-4-briefbench

Screenshots:

- `assets/screenshots/briefbench-start.png`
- `assets/screenshots/briefbench-analysis.png`

## Inspiration

Small nonprofit teams often coordinate real-world services through messy notes, chat messages, spreadsheets, and changing constraints. A food pantry, clinic, shelter, or volunteer group might have the will to act, but not the time to turn scattered context into a clear plan.

AidBriefBench was built to help those teams move from rough field notes to an action-ready decision brief while keeping assumptions, risks, and human review visible.

## What It Does

AidBriefBench lets a coordinator paste messy operational notes and generate a structured brief with:

- a concise summary
- a model rationale
- key risks
- a build or action plan
- user experience notes
- a communication/story angle
- assumptions to review

The included sample uses a volunteer food pantry routing scenario. The same pattern can support other SDG-aligned field workflows where small teams need to plan under constraints.

## How It Supports UN SDGs

AidBriefBench aligns most directly with:

- **SDG 2: Zero Hunger**: the demo scenario helps food pantry teams coordinate pickups, dropoffs, driver availability, and cold-storage risks.
- **SDG 10: Reduced Inequalities**: it gives small community teams a lightweight planning assistant without requiring enterprise tooling.
- **SDG 11: Sustainable Cities and Communities**: it supports local service coordination and volunteer operations.

## How We Built It

The project is intentionally lightweight:

- Node.js server
- static HTML/CSS/JavaScript frontend
- Vercel deployment
- `/api/analyze` endpoint
- `/api/sample` endpoint
- Gemma 4 integration path through Google AI Studio or OpenRouter
- demo mode for judges who do not have an API key

The core design choice is to ask the model for strict JSON instead of a long freeform answer. That lets the UI render clear sections that a human coordinator can review.

## How AI Is Used

Gemma 4 is used as the reasoning layer that turns unstructured notes into an inspectable decision brief. The model reads context, preserves constraints, identifies risks, and produces structured sections.

For the prototype, the app defaults to a `gemma-4-31b-it` reasoning path because the task benefits from long-context synthesis and tradeoff analysis. For production nonprofit deployments, smaller Gemma 4 models could be used locally on modest hardware when privacy, latency, and cost are more important than rich prose.

## Challenges

The biggest product challenge was making the AI output useful without pretending it is final truth. Field operations need human review, so the app makes risks and assumptions first-class UI sections.

The biggest implementation challenge was keeping the project easy to judge. The app works in demo mode immediately, while still leaving real Gemma 4 provider paths for Google AI Studio and OpenRouter.

## Accomplishments

- Built and deployed a working end-to-end app.
- Added a sample SDG-aligned field scenario.
- Created structured model output instead of a generic chatbot response.
- Published the source code and live demo.
- Preserved a local-first production path for privacy-sensitive nonprofit use.

## What We Learned

Good AI tools should make decisions easier to inspect, not harder. For social-good workflows, it is not enough to generate text. The tool has to show what assumptions it made, where the plan could fail, and what information is missing.

## What's Next

Next steps:

- add CSV and PDF upload for donor lists and route notes
- add local Gemma inference through Ollama or llama.cpp
- add a driver-message export template
- add side-by-side comparison between Gemma 4 model sizes
- add saved briefs for recurring nonprofit operations

## Built With

- Node.js
- JavaScript
- HTML
- CSS
- Vercel
- Gemma 4
- Google AI Studio/OpenRouter integration path
