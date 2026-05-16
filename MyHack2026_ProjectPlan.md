# EcoLink AI - Detailed Project Plan
### Build With AI MyHack 2026 KL | 16-17 May 2026

---

## 1. Executive Summary

**Solution name:** EcoLink AI

**Tagline:** Treat ecosystem relationships as first-class entities. Define them once, govern them properly, and reuse them across future programmes.

**One-sentence pitch:** EcoLink AI is an AI-enabled relationship management platform for innovation ecosystems that uses Gemini and a graph database to automate participant verification, mentor matching, company-to-programme assignment, partner linkage, and relationship reuse across cohorts, countries, and initiatives.

**Core idea:** The problem is not just "matching mentors." The deeper problem is that ecosystem platforms do not model relationships as reusable system objects. EcoLink AI solves this by turning every important linkage into a governed, searchable, reusable relationship entity.

**Primary users:**
- Programme owners
- Ecosystem administrators
- Mentors
- Companies/startups
- Partners
- Service providers

**Main outcome:** Reduce manual coordination work, improve matching consistency, and let future programmes learn from previous ecosystem engagements.

---

## 2. Problem Statement Alignment

### Official Problem Theme

**Automating Ecosystem Linkages Instead of Manual Coordination**

Innovation ecosystem platforms still depend on manual coordination to:
- verify participants
- match mentors
- assign companies to programmes
- manage partner linkages
- track engagement outcomes
- reuse relationship history across future initiatives

### Root Cause

Current platforms treat ecosystem linkages as one-off assignments. They do not treat relationships as first-class entities that can be:
- defined
- automated
- governed
- reused
- improved over time
- shared across programmes, countries, and actor types

### EcoLink AI Response

EcoLink AI directly addresses this by creating a persistent relationship graph where:
- actors are represented as reusable nodes
- linkages are represented as reusable relationship entities
- Gemini extracts and structures participant data
- Gemini explains and ranks possible matches
- graph history improves future recommendations
- admins approve, govern, and reuse relationships instead of rebuilding them manually

---

## 3. Judging Rubric Strategy

The plan is designed around the MyHack 2026 rubric.

| Rubric Area | Points | How EcoLink AI Scores |
|---|---:|---|
| Google Technology Integration | 15 | Gemini powers extraction, reasoning, ranking, and explanation. Firebase and Cloud Run support identity and deployment. |
| AI Implementation Quality | 10 | AI is essential to intake, matching, confidence scoring, and relationship reuse. Human approval and validation reduce AI risk. |
| Working Demonstration and UI/UX | 10 | Demo follows one complete admin workflow: intake -> match -> approve -> graph -> reuse. |
| AI Model Performance | 5 | Structured JSON output, schema validation, confidence scores, cached responses, and benchmark data prove reliability. |
| Originality and Creativity | 10 | Relationship-as-entity model is more differentiated than a simple matching tool. |
| Problem-Solution Fit | 15 | Directly matches the problem statement actors, linkages, and scalability challenge. |
| Scalability | 10 | Graph model supports new actors, countries, programmes, and relationship types without redesign. |
| Deployment Readiness | 5 | Containerized backend/frontend, Cloud Run path, environment variables, and seeded demo data. |
| Presentation and Pitching | 20 | Clear story: manual pain -> relationship entity insight -> AI workflow -> measurable impact. |

---

## 4. Product Scope

### In Scope for Hackathon MVP

The MVP must prove the full relationship lifecycle:

1. **Create actor profiles**
   - Admin can add mentors, companies, partners, and service providers.
   - Admin can paste messy text or upload CSV-style data.
   - Gemini extracts structured profile fields.
   - Admin reviews and confirms the extracted profile.

2. **Create programmes and cohorts**
   - Admin can create a programme.
   - Admin can create a cohort under a programme.
   - Cohort includes date range, country, industry focus, company stage, and support needs.

3. **Generate AI match recommendations**
   - Admin selects a cohort.
   - System retrieves candidate mentors, partners, or service providers.
   - Gemini ranks candidates with fit score and explanation.
   - System shows confidence, reason, and possible conflicts.

4. **Confirm reusable relationships**
   - Admin confirms a recommended match.
   - System writes a persistent relationship edge to the graph.
   - Relationship includes metadata, status, confidence, programme, cohort, and outcome fields.

5. **Reuse past relationships**
   - When a new cohort is created, system surfaces warm candidates from similar past programmes.
   - Admin can re-invite or re-link a previous actor.
   - Reuse count and history are visible.

6. **Explore the ecosystem graph**
   - Admin can view a graph of actors, programmes, cohorts, and relationships.
   - Admin can filter by actor type, country, domain, programme, cohort, and relationship type.
   - Clicking a node shows relationship history.

7. **Track outcome feedback**
   - Admin can add a simple outcome score and note after engagement.
   - Future recommendations can use previous outcome scores as a signal.

### Out of Scope for Hackathon MVP

These are useful but not required for the demo:

- full production multi-tenant billing
- complex role-based permissions
- real email delivery beyond a simulated invite action
- full CRM replacement
- real-time calendar integrations
- payment workflows
- legal contract workflows
- advanced analytics dashboards
- mobile app
- production-grade audit/compliance console

### Nice-to-Have Polish if Time Allows

- Firebase Auth login screen
- mock email invitation preview
- AI-generated relationship summary
- CSV export of recommended matches
- simple admin dashboard metrics
- PDF pitch report export
- loading states and fallback cached demo responses

---

## 5. Demo-First MVP Definition

The prototype is successful if the judges can clearly see this flow:

1. Admin starts with messy ecosystem data.
2. Gemini converts it into structured actor profiles.
3. Admin creates a new cohort with needs.
4. EcoLink AI recommends suitable mentors, partners, or service providers.
5. Admin confirms one relationship.
6. The relationship appears in the graph as a reusable entity.
7. Admin creates a second similar cohort.
8. EcoLink AI reuses relationship history to recommend warm candidates.

This path matters more than implementing every possible feature.

---

## 6. User Roles and Jobs To Be Done

### Programme Owner

**Goal:** Launch and run cohorts faster.

**Jobs:**
- create programme and cohort records
- understand which companies need which support
- assign mentors or service providers
- reuse successful past linkages
- monitor relationship outcomes

### Ecosystem Administrator

**Goal:** Maintain cross-programme visibility.

**Jobs:**
- manage actor profiles
- review AI-extracted data
- approve AI recommendations
- resolve conflicts
- explore relationship history
- standardize how relationships are created

### Mentor

**Goal:** Avoid repeated onboarding and get matched with relevant companies.

**Jobs:**
- provide profile once
- verify extracted skills and availability
- participate in relevant cohorts
- build reusable relationship history

### Company / Startup

**Goal:** Get connected to relevant support faster.

**Jobs:**
- provide company needs
- receive suitable mentor/partner/service-provider matches
- maintain continuity across programmes
- benefit from previous engagement history

### Partner / Service Provider

**Goal:** Be reusable across programmes where their services fit.

**Jobs:**
- maintain capability profile
- be recommended to relevant companies/cohorts
- track past engagements and outcomes

---

## 7. Core Concept: Relationship as a First-Class Entity

EcoLink AI should make the relationship itself visible and governable, not just the people or organizations.

### Relationship Entity Fields

Every relationship should include:

| Field | Purpose |
|---|---|
| `relationship_id` | Unique ID for reuse and audit |
| `relationship_type` | Examples: `MENTORS`, `ASSIGNED_TO`, `PARTNERED_WITH`, `PROVIDES_SERVICE_TO` |
| `source_actor_id` | Actor creating/providing the relationship |
| `target_actor_id` | Actor receiving/participating in the relationship |
| `programme_id` | Programme context |
| `cohort_id` | Cohort context |
| `status` | `proposed`, `active`, `completed`, `archived`, `rejected` |
| `ai_confidence_score` | Model confidence or fit score |
| `human_approved` | Whether an admin approved the relationship |
| `approved_by` | Admin who approved it |
| `created_at` | Relationship creation timestamp |
| `start_date` | Engagement start |
| `end_date` | Engagement end |
| `outcome_score` | Post-engagement success rating |
| `outcome_notes` | Human feedback |
| `reuse_count` | Number of times this actor/linkage pattern has been reused |
| `explanation` | Gemini reasoning shown to the admin |

### Relationship Lifecycle

```text
AI recommended -> Admin reviewed -> Active relationship -> Outcome recorded -> Reusable history
```

### Lifecycle Statuses

- `proposed`: AI suggested the relationship.
- `active`: admin approved and engagement is ongoing.
- `completed`: engagement finished and outcome was recorded.
- `archived`: historical relationship retained for context.
- `rejected`: admin declined the recommendation.

---

## 8. Solution Architecture

```text
                         EcoLink AI

  Messy Text / CSV
         |
         v
  Gemini Extraction
         |
         v
  Profile Review UI --------------+
         |                        |
         v                        |
  Actor Profile Store             |
         |                        |
         v                        |
  Neo4j Relationship Graph <------+
         |
         +--> Graph Query: candidates, conflicts, history
         |
         v
  Gemini Match Reasoning
         |
         v
  Ranked Recommendations
         |
         v
  Admin Approval
         |
         v
  Reusable Relationship Entity
         |
         v
  Graph Explorer + Reuse Panel
```

### Architecture Principles

- Gemini handles extraction, reasoning, summarization, and explanation.
- Neo4j handles relationship memory and graph traversal.
- The admin remains the final decision-maker.
- All AI output is validated before saving.
- Demo data is seeded so the product works even if live API calls fail.

---

## 9. Technology Stack

| Layer | Technology | Role |
|---|---|---|
| AI extraction | Gemini 2.5 Flash | Fast structured extraction from messy text/CSV |
| AI reasoning | Gemini 2.5 Pro or Gemini 2.5 Flash | Candidate ranking and explanation |
| Embeddings | `gemini-embedding-001` or Vertex AI embeddings | Semantic similarity between cohort needs and actor capabilities |
| Frontend | Next.js + TailwindCSS | Admin dashboard, forms, recommendations, graph explorer |
| Backend | FastAPI | API endpoints, Gemini calls, graph queries, validation |
| Graph database | Neo4j Aura or local Neo4j | Actor and relationship graph |
| Authentication | Firebase Auth | Optional login and identity layer |
| Private data store | Firestore or backend store | Contact details and private profile data |
| Hosting | Google Cloud Run | Deployment-ready container hosting |
| Secrets | Google Secret Manager or `.env` for MVP | API keys and database credentials |
| Demo graph UI | `react-force-graph`, `vis-network`, or similar | Visual graph exploration |

### Google Technology Integration

The Google technologies are not included just for points. Each has a clear role:

- **Gemini** is central to profile extraction, relationship recommendation, match explanation, and summarization.
- **Gemini/Vertex embeddings** improve matching beyond simple keyword search.
- **Firebase Auth** gives actor/admin identity and supports future role-based access.
- **Cloud Run** provides a realistic deployment path for the prototype.
- **Secret Manager** supports safer handling of credentials in production.

---

## 10. Data Model

### Node Types

#### `Actor`

Generic base concept for people and organizations.

Common fields:
- `actor_id`
- `actor_type`
- `name`
- `country`
- `city`
- `domain`
- `tags`
- `created_at`
- `updated_at`

#### `Mentor`

Fields:
- `mentor_id`
- `name`
- `skills`
- `industry_experience`
- `stage_focus`
- `availability`
- `country`
- `languages`
- `past_outcome_average`

#### `Company`

Fields:
- `company_id`
- `name`
- `industry`
- `stage`
- `country`
- `needs`
- `programme_history`
- `growth_goals`

#### `Partner`

Fields:
- `partner_id`
- `name`
- `partner_type`
- `capabilities`
- `country_coverage`
- `past_programmes`

#### `ServiceProvider`

Fields:
- `provider_id`
- `name`
- `service_categories`
- `specializations`
- `country_coverage`
- `availability`

#### `Programme`

Fields:
- `programme_id`
- `name`
- `owner`
- `country`
- `focus_area`
- `start_date`
- `end_date`

#### `Cohort`

Fields:
- `cohort_id`
- `programme_id`
- `name`
- `country`
- `industry_focus`
- `stage_focus`
- `support_needs`
- `start_date`
- `end_date`

### Relationship Types

| Relationship | Source -> Target | Meaning |
|---|---|---|
| `MENTORS` | Mentor -> Company | Mentor supports a company |
| `ASSIGNED_TO` | Company -> Programme/Cohort | Company participates in a programme/cohort |
| `PARTNERED_WITH` | Partner -> Programme | Partner supports a programme |
| `PROVIDES_SERVICE_TO` | ServiceProvider -> Company | Service provider supports a company |
| `PARTICIPATED_IN` | Actor -> Programme/Cohort | Actor joined a programme/cohort |
| `SIMILAR_TO` | Cohort -> Cohort | Used for reuse recommendations |
| `RECOMMENDED_FOR` | Actor -> Cohort | AI-suggested relationship before approval |

### Minimum Demo Dataset

Seed enough data to make the graph feel real:

- 20 mentors
- 10 companies
- 5 partners/service providers
- 3 programmes
- 4 cohorts
- 30 historical relationships
- 5 completed relationships with outcome scores
- 3 deliberate conflicts for conflict detection demo

---

## 11. Feature Scope and Acceptance Criteria

### Feature 1: AI-Powered Intake and Profile Generation

**Priority:** P0 - Must have

**User story:** As an ecosystem admin, I want to paste messy participant data so the system can generate clean, reusable profiles.

**Inputs:**
- free-text profile
- CSV-style rows
- actor type: mentor, company, partner, service provider

**AI task:**
- extract structured fields
- normalize skills/tags
- identify missing fields
- produce confidence score

**Output:**
- structured JSON profile
- warnings for missing/uncertain fields
- admin review screen

**Acceptance criteria:**
- Admin can paste messy text and receive structured profile output.
- Output follows a fixed schema.
- Admin can edit fields before saving.
- Saved profile appears in the graph.
- Invalid AI output does not get saved silently.

**Demo moment:** Paste messy mentor CSV and show Gemini turning it into clean profile cards.

---

### Feature 2: Programme and Cohort Management

**Priority:** P0 - Must have

**User story:** As a programme owner, I want to create cohorts with support needs so the system can recommend suitable actors.

**Inputs:**
- programme name
- cohort name
- country
- start/end date
- industry focus
- stage focus
- support needs

**Acceptance criteria:**
- Admin can create a cohort.
- Cohort is linked to a programme.
- Cohort fields are used by the match engine.
- Cohort appears as a node in the graph.

**Demo moment:** Create "AI Scale Malaysia Cohort 2026" with fintech, seed-stage, fundraising, and go-to-market needs.

---

### Feature 3: AI Match Engine

**Priority:** P0 - Must have

**User story:** As an ecosystem admin, I want the system to recommend the best mentors, partners, or providers for a cohort and explain why.

**Inputs:**
- cohort profile
- candidate actor profiles
- relationship history
- outcome scores
- availability/conflict data

**AI task:**
- rank candidates
- explain match reason
- identify gaps or risks
- return fit score and confidence

**Output:**
- ranked recommendations
- score
- explanation
- conflict warning
- "Confirm relationship" action

**Acceptance criteria:**
- Recommendations are ranked.
- Each recommendation includes a clear reason.
- Admin can confirm one recommendation.
- Confirmed recommendation creates a graph relationship.
- Gemini response is cached for demo safety.

**Demo moment:** Show why one mentor is better than another because of domain fit, stage experience, availability, and past outcomes.

---

### Feature 4: Relationship Graph Engine

**Priority:** P0 - Must have

**User story:** As an ecosystem admin, I want every confirmed linkage to become a reusable graph relationship.

**Core graph operations:**
- create actor node
- create programme node
- create cohort node
- create relationship edge
- query history by actor
- query candidates by cohort
- query similar past cohorts

**Acceptance criteria:**
- Confirmed relationships are stored with metadata.
- Admin can view actor relationship history.
- Past relationships affect future recommendations.
- Graph queries support reuse panel and explorer.

**Demo moment:** Confirm a mentor-company relationship and immediately show it in the graph.

---

### Feature 5: Conflict Detection

**Priority:** P1 - Should have

**User story:** As an admin, I want to know if a mentor or provider is already committed to an overlapping cohort.

**Logic:**
- Check active relationships for the same actor.
- Compare cohort date ranges.
- Flag possible overlap.
- Do not block admin approval.

**Acceptance criteria:**
- Conflicts appear as visible warnings.
- Admin can still approve with awareness.
- Conflict reason is understandable.

**Demo moment:** Show one high-scoring mentor with an availability conflict and another slightly lower-scoring mentor with no conflict.

---

### Feature 6: Reuse Panel

**Priority:** P0 - Must have for differentiation

**User story:** As an admin, I want the system to surface previously successful actors when I create a similar cohort.

**Signals used:**
- same/similar industry
- same/similar stage
- country coverage
- previous outcome score
- relationship status
- reuse count

**Acceptance criteria:**
- New cohort screen shows warm recommendations.
- Recommendations mention prior programme context.
- Admin can re-link or re-invite a previous actor.

**Demo moment:** Create a second similar cohort and show "3 warm mentors from previous fintech programme."

---

### Feature 7: Graph Explorer

**Priority:** P1 - Should have

**User story:** As an ecosystem admin, I want to visually inspect ecosystem relationships across actors and programmes.

**Views:**
- full ecosystem graph
- programme-level graph
- cohort-level graph
- actor history view

**Filters:**
- actor type
- country
- domain
- programme
- cohort
- relationship type
- status

**Acceptance criteria:**
- Graph renders without blocking the demo.
- Graph is limited to manageable node count.
- Clicking a node opens details.
- Relationships have visible labels or legend.

**Demo moment:** Show a company connected to programme, mentor, and service provider across multiple cohorts.

---

### Feature 8: Outcome Feedback Loop

**Priority:** P1 - Should have

**User story:** As a programme owner, I want to record relationship outcomes so future recommendations improve.

**Inputs:**
- outcome score from 1 to 5
- short notes
- completion status

**Acceptance criteria:**
- Admin can mark relationship as completed.
- Outcome score is stored on the relationship.
- Future recommendations can reference past positive outcomes.

**Demo moment:** Show "previous outcome score: 4.8/5" as a reason for reuse.

---

## 12. AI Design

### AI Task 1: Profile Extraction

**Model:** Gemini 2.5 Flash

**Why:** Fast, cost-effective, strong enough for structured extraction.

**Prompt goal:** Convert messy text or CSV rows into strict JSON.

**Output schema example:**

```json
{
  "actor_type": "mentor",
  "name": "string",
  "country": "string",
  "domain": "string",
  "skills": ["string"],
  "stage_focus": ["idea", "seed", "growth"],
  "availability": "string",
  "confidence_score": 0.0,
  "missing_fields": ["string"],
  "needs_human_review": true
}
```

**Validation rules:**
- response must be valid JSON
- required fields cannot be empty
- confidence score must be between 0 and 1
- unknown values should be marked as `unknown`, not invented
- admin must approve before saving

### AI Task 2: Match Recommendation

**Model:** Gemini 2.5 Flash for speed, Gemini 2.5 Pro if deeper reasoning is needed.

**Prompt goal:** Rank candidate actors for a cohort based on profile fit, relationship history, availability, and outcome data.

**Output schema example:**

```json
{
  "cohort_id": "string",
  "recommendations": [
    {
      "actor_id": "string",
      "fit_score": 0.0,
      "confidence_score": 0.0,
      "reason": "string",
      "risks": ["string"],
      "reuse_signal": "string",
      "conflict_detected": false
    }
  ]
}
```

**Validation rules:**
- actor IDs must exist in the database
- scores must be numeric and bounded
- recommendation reason must reference actual profile fields
- conflict status should come from graph query, not model guess

### AI Task 3: Relationship Summary

**Model:** Gemini 2.5 Flash

**Prompt goal:** Summarize a node or relationship history in plain language.

**Example output:** "This mentor has supported 3 fintech cohorts in Malaysia, with strong outcomes in fundraising and go-to-market support."

### Hallucination Reduction

- Use strict JSON schemas.
- Validate all IDs against the graph.
- Show extracted fields to humans before saving.
- Keep conflict detection deterministic through graph queries.
- Cache Gemini responses during demo.
- Ask the model to return `unknown` when data is missing.
- Do not allow Gemini to create actors or relationships without admin confirmation.

### Bias and Fairness

- Show reasoning instead of only scores.
- Allow admin override.
- Avoid protected attributes in match scoring.
- Include diverse candidate pools.
- Track why candidates are recommended or rejected.

### AI Performance Metrics

For the demo/pitch, collect small benchmark numbers:

| Metric | Target |
|---|---:|
| Profile extraction time for 10 records | Under 30 seconds |
| Required JSON fields parsed correctly | 90%+ in demo dataset |
| Manual onboarding time reduced | From about 45 minutes to under 5 minutes |
| Match recommendation generation | Under 15 seconds for 20 candidates |
| Human review required | Always before final save |

---

## 13. Backend API Scope

### Intake APIs

`POST /api/intake/extract`
- input: raw text/CSV and actor type
- output: structured profile draft

`POST /api/intake/confirm`
- input: reviewed profile
- output: saved actor node

### Programme APIs

`POST /api/programmes`
- create programme

`POST /api/cohorts`
- create cohort

`GET /api/cohorts/{cohort_id}`
- get cohort details

### Matching APIs

`POST /api/match/{cohort_id}`
- generate ranked recommendations

`POST /api/relationships/confirm`
- approve recommendation and create relationship

`POST /api/relationships/{relationship_id}/outcome`
- update outcome score and notes

### Graph APIs

`GET /api/graph/overview`
- return nodes and edges for graph explorer

`GET /api/graph/actor/{actor_id}`
- return actor details and relationship history

`GET /api/reuse/{cohort_id}`
- return warm candidates from previous similar cohorts

### Demo/Fallback APIs

`POST /api/demo/seed`
- seed demo dataset

`GET /api/demo/status`
- show API, database, and Gemini connectivity

---

## 14. Frontend Screen Scope

### Screen 1: Dashboard

Purpose:
- show programme/cohort overview
- show number of actors, relationships, and reusable warm links

Key components:
- metrics row
- recent relationships
- quick actions
- demo health indicator

### Screen 2: AI Intake

Purpose:
- paste messy text or CSV
- run Gemini extraction
- review and save structured profiles

Key components:
- actor type selector
- text area/upload field
- extract button
- profile review table/cards
- confidence and missing field badges

### Screen 3: Cohort Builder

Purpose:
- create a programme/cohort
- define support needs
- show warm reuse candidates

Key components:
- cohort form
- support needs tags
- date range fields
- reuse panel

### Screen 4: Match Recommendations

Purpose:
- show AI-ranked candidates
- explain recommendations
- confirm relationships

Key components:
- candidate ranking table/cards
- fit score
- confidence score
- Gemini explanation
- conflict badge
- confirm button

### Screen 5: Graph Explorer

Purpose:
- visualize ecosystem relationships
- prove that relationships are reusable entities

Key components:
- graph visualization
- filters
- selected node drawer
- relationship details panel

### Screen 6: Relationship Detail

Purpose:
- inspect one relationship as a governed entity

Key components:
- relationship status
- participants
- programme/cohort context
- AI reason
- approval metadata
- outcome score
- reuse count

---

## 15. Demo Script

Total target time: 8 minutes.

| Time | Segment | What To Show | Rubric Signal |
|---|---|---|---|
| 0:00-0:45 | Problem | Spreadsheet/manual coordination pain | Problem fit |
| 0:45-1:15 | Insight | Relationships should be first-class entities | Originality |
| 1:15-2:15 | Intake | Paste messy mentor/company data -> Gemini extracts profiles | AI quality |
| 2:15-3:15 | Cohort | Create a new cohort with support needs | UX/demo |
| 3:15-4:30 | Matching | Show ranked AI recommendations with reasons | AI essential |
| 4:30-5:15 | Approval | Confirm a relationship and create graph edge | Working prototype |
| 5:15-6:00 | Graph | Show actor/company/programme relationship network | Visual engagement |
| 6:00-6:45 | Reuse | Create similar cohort and show warm recommendations | Differentiation |
| 6:45-7:30 | Architecture | Gemini + graph + Google Cloud deployment | Technical architecture |
| 7:30-8:00 | Impact | Time saved, scalability, business model | Business viability |

### Demo Data Story

Use a concrete story:

- Programme: "Malaysia AI Scale Programme"
- Cohort: "Fintech Growth Cohort 2026"
- Company: "PayNusa Analytics"
- Need: go-to-market, fundraising, AI governance
- Mentor: "Aisha Rahman"
- Partner: "Cradle Ecosystem Partner"
- Service provider: "Cloud Compliance Studio"

The story should show mentor matching plus at least one partner/service-provider linkage so the solution does not look too narrow.

---

## 16. Development Timeline

### Hour 0-1: Final Scope Lock

Deliverables:
- confirm MVP flow
- confirm tech stack
- define demo data
- create repository structure

Success criteria:
- team agrees P0/P1/P2 priorities
- no new features added after scope lock unless P0 is stable

### Hour 1-3: Project Scaffold

Deliverables:
- frontend app scaffold
- backend app scaffold
- environment variables template
- health check endpoint
- basic UI shell

Success criteria:
- frontend runs locally
- backend runs locally
- health check returns OK

### Hour 3-5: Data Model and Seed Data

Deliverables:
- graph schema decisions
- seed actors, programmes, cohorts, relationships
- graph query helpers

Success criteria:
- seeded graph includes mentors, companies, partners, service providers, programmes, cohorts, and historical relationships
- graph overview API returns nodes and edges

### Hour 5-8: AI Intake

Deliverables:
- intake UI
- Gemini extraction endpoint
- JSON validation
- profile review and save flow

Success criteria:
- pasted messy text becomes structured profile
- profile can be edited before saving
- saved profile appears in graph data

### Hour 8-11: Cohort Builder and Reuse Panel

Deliverables:
- programme/cohort forms
- support needs fields
- reuse candidate query
- warm recommendation panel

Success criteria:
- admin can create a cohort
- warm candidates appear for similar cohort contexts

### Hour 11-15: Match Engine

Deliverables:
- candidate query
- Gemini match prompt
- ranked recommendation UI
- confirm relationship action

Success criteria:
- admin can generate ranked recommendations
- recommendation includes score, reason, confidence, and conflict indicator
- confirmed relationship is written to graph

### Hour 15-17: Conflict and Outcome Features

Deliverables:
- overlapping date conflict query
- relationship status fields
- outcome score update

Success criteria:
- conflict warning appears for seeded conflict case
- outcome score can be added to completed relationship

### Hour 17-20: Graph Explorer

Deliverables:
- graph visualization
- filters
- node details drawer
- relationship detail panel

Success criteria:
- graph loads quickly
- judges can see reusable relationships visually
- selected node shows history

### Hour 20-22: Polish and Demo Resilience

Deliverables:
- loading states
- error states
- cached Gemini responses
- seeded fallback mode
- UI copy cleanup
- README draft

Success criteria:
- demo works without relying on a perfect live network/API moment
- UI is understandable without verbal over-explaining

### Hour 22-23: Pitch Deck and Demo Video

Deliverables:
- final slides
- architecture diagram
- impact numbers
- short backup demo recording

Success criteria:
- 8-minute pitch can be completed smoothly
- deck follows problem -> solution -> AI -> impact story

### Hour 23-24: Submission

Deliverables:
- GitHub repo pushed
- README complete
- demo URL or setup instructions
- final submission form completed before deadline

Success criteria:
- all required links work
- final demo path tested end to end

---

## 17. Priority Plan

### P0 - Must Be Done

- seeded demo data
- AI intake extraction
- profile review and save
- cohort creation
- AI recommendation ranking
- relationship confirmation
- graph storage
- reuse panel
- basic graph explorer
- README and pitch deck

### P1 - Strong Scoring Polish

- conflict detection
- outcome feedback loop
- relationship detail view
- graph filters
- cached Gemini responses
- demo health check
- business model slide
- benchmark numbers

### P2 - Only If Ahead

- Firebase Auth login
- real email invite
- CSV file upload instead of paste-only
- advanced analytics dashboard
- export reports
- advanced role permissions
- full Cloud Run deployment

---

## 18. Business Model and Scalability

### Target Customers

- national innovation agencies
- startup accelerators
- government-backed entrepreneurship programmes
- university innovation hubs
- corporate venture builders
- ecosystem platform operators

Examples in Malaysia/regional context:
- Cradle
- MDEC
- MRANTI
- MaGIC-style accelerator operators
- corporate innovation programmes

### Revenue Model

- SaaS subscription: RM 2,000-RM 5,000/month per programme operator
- Enterprise deployment: custom annual contract for large ecosystem owners
- Usage-based AI processing: pass-through AI cost with margin
- White-label deployment: hosted in customer-owned Google Cloud project

### Scalability Argument

EcoLink AI scales because:
- graph model naturally supports many actor and relationship types
- new countries are added as properties, not new systems
- new relationship types can be added without redesigning the product
- Cloud Run can scale backend usage
- Gemini handles variable unstructured input
- historical relationships improve future recommendations

### Cost Considerations

Cost controls:
- cache AI responses
- batch candidate matching
- limit graph explorer node count
- use Gemini Flash for most tasks
- use Gemini Pro only for complex reasoning moments
- avoid repeated extraction for already confirmed profiles

---

## 19. Deployment Readiness

### Local Development

Expected services:
- frontend: Next.js
- backend: FastAPI
- graph database: Neo4j Aura or local Neo4j
- AI: Gemini API key

### Environment Variables

```text
GEMINI_API_KEY=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
FIREBASE_PROJECT_ID=
GOOGLE_CLOUD_PROJECT=
```

### Production Path

1. Dockerize frontend and backend.
2. Store credentials in Secret Manager.
3. Deploy backend to Cloud Run.
4. Deploy frontend to Cloud Run or Firebase Hosting.
5. Use Neo4j Aura for hosted graph database.
6. Configure GitHub Actions or Cloud Build for CI/CD.

### Demo Safety

The demo should work even if one external service is slow:

- seed data available
- cached Gemini extraction examples
- cached match recommendation examples
- local fallback graph data
- backup demo video

---

## 20. Security, Privacy, and Governance

### Privacy Design

- Store user identity in Firebase Auth.
- Store private profile/contact details outside the graph where possible.
- Store graph nodes with actor IDs and non-sensitive matching metadata.
- Avoid exposing emails and phone numbers in graph explorer.
- Require human review before AI-generated data is saved.

### Governance Design

- Every AI recommendation must be approved by an admin.
- Every relationship has status and approval metadata.
- Rejected recommendations are kept for audit and future improvement.
- Outcome notes help future admins understand past decisions.

### Ethical AI Position

EcoLink AI is decision-support, not automated decision-making.

Humans remain responsible for:
- verifying extracted profile data
- approving relationships
- resolving conflicts
- interpreting recommendations
- recording outcome quality

---

## 21. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---:|---|
| Scope too large for 24 hours | High | High | Build P0 demo path first. Push P1/P2 only after core flow works. |
| Gemini API latency/rate limit | Medium | High | Cache demo responses and use seed data fallback. |
| Neo4j setup delay | Medium | Medium | Keep local/static graph JSON fallback. |
| Graph visualization takes too long | Medium | Medium | Limit graph to 50 nodes and use simple force graph. |
| AI returns invalid JSON | Medium | Medium | Use schema validation and retry prompt. |
| Demo appears mentor-only | Medium | High | Include company-programme and partner/service-provider linkage in demo. |
| Privacy story feels weak | Medium | Medium | Clearly separate identity/private data from graph metadata. |
| Pitch exceeds 8 minutes | Medium | Medium | Practice with timed demo script and backup screenshots. |

---

## 22. Pitch Deck Outline

### Slide 1: Title

EcoLink AI  
AI-powered reusable relationship infrastructure for innovation ecosystems.

### Slide 2: Problem

Manual coordination is slowing ecosystem growth. Programmes rebuild the same relationships every cohort.

### Slide 3: Key Insight

The issue is not just matching. The issue is that relationships are not first-class, reusable, governed entities.

### Slide 4: Solution

EcoLink AI turns actors and linkages into a persistent relationship graph, powered by Gemini.

### Slide 5: Live Demo Flow

Intake -> Extract -> Match -> Approve -> Graph -> Reuse.

### Slide 6: AI Architecture

Gemini extraction, Gemini matching, embeddings, validation, human approval.

### Slide 7: Product Differentiation

Not a one-off matching tool. It is relationship memory for ecosystem operators.

### Slide 8: Impact

Manual onboarding drops from about 45 minutes to under 5 minutes. Matching drops from days to minutes. Relationship reuse increases from zero system memory to searchable history.

### Slide 9: Scalability and Business Model

SaaS for innovation agencies, accelerators, and ecosystem platforms. Cloud Run + graph architecture supports regional scale.

### Slide 10: Closing

EcoLink AI helps ecosystems stop rebuilding relationships from scratch and start compounding their network intelligence.

---

## 23. README Checklist

The GitHub README should include:

- project name and tagline
- problem statement summary
- solution overview
- architecture diagram
- Google technologies used
- setup instructions
- environment variables
- how to seed demo data
- how to run frontend/backend
- demo script
- screenshots
- ethical AI notes
- scalability notes
- team members

---

## 24. Final Submission Checklist

Before submission:

- [ ] P0 demo flow tested end to end
- [ ] GitHub repo pushed
- [ ] README complete
- [ ] screenshots added
- [ ] demo video recorded
- [ ] pitch deck exported to PDF
- [ ] Google technologies clearly explained
- [ ] AI safety/ethics clearly explained
- [ ] business model included
- [ ] fallback demo data ready
- [ ] submission form completed before deadline

---

## 25. Final Positioning

EcoLink AI should be positioned as:

> A relationship intelligence layer for innovation ecosystems.

Avoid positioning it as only:

> An AI mentor matching app.

The broader positioning is stronger because the official problem statement is about ecosystem linkages across companies, mentors, partners, service providers, programmes, countries, and initiatives.

The winning story is:

1. Ecosystems currently forget their own relationship history.
2. EcoLink AI gives them reusable relationship memory.
3. Gemini makes intake and matching fast.
4. The graph makes relationships persistent and governable.
5. Every future programme becomes easier because the ecosystem learns from the last one.
