# EcoLink AI Local Demo

Local hackathon demo for EcoLink AI, an AI-enabled relationship intelligence layer for innovation ecosystems.

## What It Demonstrates

- AI-assisted intake for mentors, companies, partners, and service providers
- Programme and cohort creation
- Match recommendations with fit score, explanation, reuse signal, and conflict warning
- Relationship confirmation as a reusable graph entity
- Warm reuse panel from historical successful relationships
- Graph explorer for actors, programmes, cohorts, and relationships
- Outcome recording for future reuse

## Run Locally

```powershell
cd C:\Users\hokar\Desktop\MyHACK\ecolink-local-demo
node server.js
```

Open the printed local URL, usually:

```text
http://localhost:5173
```

No package install is required. The server uses only Node.js built-in modules.

## Stop the Demo Server

If the server is running in a terminal, press `Ctrl+C`.

If it was started in the background, use Task Manager or run:

```powershell
Get-Process node | Stop-Process
```

## AI Key

The demo reads `GEMINI_API_KEY` from `.env.local`. If Gemini is unavailable or slow, the app automatically uses deterministic seeded fallbacks so the demo path still works.

Do not commit `.env.local`; it is already ignored by `.gitignore`.

## Suggested Demo Path

1. Open Dashboard and show the relationship memory metrics.
2. Go to AI Intake, extract mentor data, and save profiles.
3. Go to Cohorts, create a fintech cohort, and show warm reuse candidates.
4. Go to Match, generate mentor or partner recommendations.
5. Confirm one relationship.
6. Go to Graph and show the new reusable relationship.
7. Go to Relationships and record an outcome.

## Local API

- `GET /api/health`
- `GET /api/state`
- `POST /api/demo/reset`
- `POST /api/intake/extract`
- `POST /api/intake/confirm`
- `POST /api/cohorts`
- `POST /api/match/:cohortId`
- `GET /api/reuse/:cohortId`
- `POST /api/relationships/confirm`
- `POST /api/relationships/:relationshipId/outcome`
