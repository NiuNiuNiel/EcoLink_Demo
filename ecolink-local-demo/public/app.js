const app = {
  state: null,
  health: null,
  view: "dashboard",
  selectedCohortId: "cohort_fintech_growth_2026",
  selectedCompanyId: "company_paynusa",
  candidateType: "mentor",
  extraction: null,
  recommendations: [],
  graphFilter: "all",
  graphMode: "focus",
  selectedNodeId: null,
  graphTransform: { x: 0, y: 0, scale: 1 },
  graphDrag: null,
  graphSuppressClick: false
};

const titles = {
  dashboard: ["Dashboard", "Reusable relationship memory for innovation ecosystems."],
  intake: ["AI Intake", "Extract clean actor profiles from messy ecosystem data."],
  cohorts: ["Cohorts", "Create programme cohorts and surface warm relationship history."],
  match: ["Match", "Rank candidates, explain fit, and confirm reusable relationships."],
  graph: ["Graph", "Inspect actors, programmes, cohorts, and governed relationship entities."],
  relationships: ["Relationships", "Track status, approvals, outcomes, and reuse signals."]
};

const sampleInputs = {
  mentor: `Name, Domain, Skills, Availability, City
Aisha Rahman, fintech, fundraising; go-to-market; bank partnerships; AI governance, 4 hours/week, Kuala Lumpur
Maya Chen, AI, responsible AI; data strategy; product analytics; MLOps, 4 hours/week, Kuala Lumpur
Farid Iskandar, fintech, payments; risk scoring; financial inclusion, 2 hours/week, Jakarta`,
  company: `PayNusa Analytics, fintech, fundraising; go-to-market; AI governance; bank partnerships, seed, Kuala Lumpur
GreenGrid Carbon, climate tech, impact measurement; grant strategy; carbon markets, seed, Kuching`,
  partner: `BankHub Malaysia, fintech, bank pilot access; regulatory sandbox guidance; payments ecosystem, Malaysia
Impact ASEAN Network, impact, impact investors; cross-border introductions; market access, Malaysia`,
  service_provider: `Cloud Compliance Studio, cloud compliance, AI governance; PDPA readiness; cloud architecture, Malaysia
GrowthOps Studio, growth marketing, go-to-market; analytics; sales enablement, Malaysia`
};

document.addEventListener("DOMContentLoaded", async () => {
  bindNavigation();
  await refreshHealth();
  await loadState();
  render();
});

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("[data-view-link]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewLink));
  });
  document.getElementById("resetDemoButton").addEventListener("click", resetDemo);
}

async function refreshHealth() {
  app.health = await fetchJson("/api/health");
  document.getElementById("healthDot").classList.toggle("ok", Boolean(app.health?.ok));
  document.getElementById("healthMode").textContent = app.health?.mode || "Unavailable";
}

async function loadState() {
  app.state = await fetchJson("/api/state");
  if (!app.selectedCohortId || !findCohort(app.selectedCohortId)) {
    app.selectedCohortId = app.state.cohorts[0]?.cohort_id;
  }
  if (!app.selectedCompanyId || !findActor(app.selectedCompanyId)) {
    app.selectedCompanyId = companies()[0]?.actor_id;
  }
}

async function resetDemo() {
  await fetchJson("/api/demo/reset", { method: "POST", body: {} });
  app.extraction = null;
  app.recommendations = [];
  app.selectedNodeId = null;
  await loadState();
  render();
  toast("Demo data reset.");
}

function setView(view) {
  app.view = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  render();
}

function render() {
  const [title, subtitle] = titles[app.view];
  document.getElementById("viewTitle").textContent = title;
  document.getElementById("viewSubtitle").textContent = subtitle;
  const view = document.getElementById("appView");
  const renderers = {
    dashboard: renderDashboard,
    intake: renderIntake,
    cohorts: renderCohorts,
    match: renderMatch,
    graph: renderGraph,
    relationships: renderRelationships
  };
  view.innerHTML = renderers[app.view]();
  bindViewEvents();
}

function renderDashboard() {
  const metrics = app.state.metrics;
  const recent = app.state.relationships.slice(0, 5);
  const reusable = app.state.relationships
    .filter((rel) => Number(rel.outcome_score || 0) >= 4.5)
    .slice(0, 5);

  return `
    <div class="metric-grid">
      ${metric("Actors", metrics.actors)}
      ${metric("Relationships", metrics.relationships)}
      ${metric("Active", metrics.active)}
      ${metric("Completed", metrics.completed)}
      ${metric("Reusable", metrics.reusable)}
    </div>
    <div class="grid two">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Demo Path</h2>
            <p>Intake, cohort, AI match, approval, graph, and reuse.</p>
          </div>
          <button class="primary-button" data-view-link="intake">Start Intake</button>
        </div>
        <div class="record-list">
          ${stepCard("1", "Extract profiles", "Paste messy mentor, company, partner, or provider data and review structured profiles.")}
          ${stepCard("2", "Create cohort", "Define industry, stage, support needs, and dates for programme context.")}
          ${stepCard("3", "Confirm relationship", "Rank candidates, show AI reasoning, check conflicts, and approve the linkage.")}
          ${stepCard("4", "Reuse memory", "Show warm actors from past successful relationships in similar cohorts.")}
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Reusable History</h2>
            <p>High-outcome relationships available for future programmes.</p>
          </div>
        </div>
        <div class="record-list">
          ${reusable.map(relationshipCard).join("") || empty("No reusable relationships yet.")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>Recent Relationship Activity</h2>
          <p>Every approved match becomes a governed relationship entity.</p>
        </div>
      </div>
      <div class="table-wrap">
        ${relationshipsTable(recent)}
      </div>
    </section>
  `;
}

function renderIntake() {
  const rows = app.extraction?.profiles || [];
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Profile Extraction</h2>
            <p>${escapeHtml(app.health?.mode || "Seeded fallback")}</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="actorType">Actor type</label>
            <select id="actorType">
              ${actorTypeOptions("mentor")}
            </select>
          </div>
          <div class="field">
            <label for="rawInput">Raw ecosystem data</label>
            <textarea id="rawInput">${escapeHtml(sampleInputs.mentor)}</textarea>
          </div>
          <div class="button-row">
            <button class="secondary-button" id="loadSampleButton">Load Sample</button>
            <button class="primary-button" id="extractButton">Extract Profiles</button>
            ${rows.length ? `<button class="plain-button" id="saveProfilesButton">Save ${rows.length} Profile${rows.length > 1 ? "s" : ""}</button>` : ""}
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Extraction Review</h2>
            <p>${app.extraction ? `Source: ${escapeHtml(app.extraction.source)}` : "Run extraction to generate reviewable profiles."}</p>
          </div>
        </div>
        ${app.extraction?.warning ? `<div class="badge amber">${escapeHtml(app.extraction.warning)}</div>` : ""}
        <div class="record-list" style="margin-top:12px">
          ${rows.map(profileCard).join("") || empty("No extracted profiles yet.")}
        </div>
      </section>
    </div>
  `;
}

function renderCohorts() {
  const selected = findCohort(app.selectedCohortId) || app.state.cohorts[0];
  const reuse = selected ? reuseCandidates(selected.cohort_id) : [];
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Cohort Builder</h2>
            <p>New cohorts immediately query relationship history.</p>
          </div>
        </div>
        <div class="form-grid two">
          <div class="field">
            <label for="cohortName">Cohort name</label>
            <input id="cohortName" value="Fintech Expansion Sprint 2026">
          </div>
          <div class="field">
            <label for="programmeId">Programme</label>
            <select id="programmeId">${app.state.programmes.map((program) => `<option value="${program.programme_id}">${escapeHtml(program.name)}</option>`).join("")}</select>
          </div>
          <div class="field">
            <label for="country">Country</label>
            <input id="country" value="Malaysia">
          </div>
          <div class="field">
            <label for="industryFocus">Industry focus</label>
            <input id="industryFocus" value="fintech">
          </div>
          <div class="field">
            <label for="stageFocus">Stage focus</label>
            <select id="stageFocus">
              <option>seed</option>
              <option>idea</option>
              <option>growth</option>
              <option>scale</option>
            </select>
          </div>
          <div class="field">
            <label for="dateRange">Dates</label>
            <input id="dateRange" value="2026-07-01 to 2026-09-30">
          </div>
          <div class="field" style="grid-column:1/-1">
            <label for="supportNeeds">Support needs</label>
            <input id="supportNeeds" value="fundraising, go-to-market, AI governance, bank partnerships">
          </div>
        </div>
        <div class="button-row" style="margin-top:12px">
          <button class="primary-button" id="createCohortButton">Create Cohort</button>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Warm Reuse Panel</h2>
            <p>${selected ? escapeHtml(selected.name) : "Select a cohort"}</p>
          </div>
          <select id="reuseCohortSelect">
            ${cohortOptions(app.selectedCohortId)}
          </select>
        </div>
        <div class="record-list">
          ${reuse.map(reuseCard).join("") || empty("No warm candidates for this cohort yet.")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>Current Cohorts</h2>
          <p>${app.state.cohorts.length} cohorts across ${app.state.programmes.length} programmes.</p>
        </div>
      </div>
      <div class="table-wrap">${cohortsTable()}</div>
    </section>
  `;
}

function renderMatch() {
  const selected = findCohort(app.selectedCohortId) || app.state.cohorts[0];
  const recs = app.recommendations || [];
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Recommendation Controls</h2>
            <p>${selected ? escapeHtml(selected.name) : "No cohort selected"}</p>
          </div>
        </div>
        <div class="form-grid two">
          <div class="field">
            <label for="matchCohortSelect">Cohort</label>
            <select id="matchCohortSelect">${cohortOptions(app.selectedCohortId)}</select>
          </div>
          <div class="field">
            <label for="candidateType">Candidate type</label>
            <select id="candidateType">
              ${actorTypeOptions(app.candidateType)}
            </select>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label for="targetCompany">Target company</label>
            <select id="targetCompany">
              ${companies().map((company) => `<option value="${company.actor_id}" ${company.actor_id === app.selectedCompanyId ? "selected" : ""}>${escapeHtml(company.name)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="button-row" style="margin-top:12px">
          <button class="primary-button" id="runMatchButton">Generate Recommendations</button>
        </div>
        ${selected ? `<div class="split-line"></div><div class="badge-row">${tagBadges([selected.country, selected.industry_focus, selected.stage_focus, ...(selected.support_needs || [])])}</div>` : ""}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Match Summary</h2>
            <p>${recs.length ? `${recs.length} ranked candidates` : "Generate recommendations to compare fit."}</p>
          </div>
        </div>
        ${recs.length ? matchSummary(recs) : empty("No recommendations generated yet.")}
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>Ranked Recommendations</h2>
          <p>Conflict detection is deterministic; reasoning can use Gemini when available.</p>
        </div>
      </div>
      <div class="record-list">
        ${recs.map(recommendationCard).join("") || empty("Select a cohort and run matching.")}
      </div>
    </section>
  `;
}

function renderGraph() {
  if (!app.selectedNodeId) {
    app.selectedNodeId = app.selectedCohortId || app.state.cohorts[0]?.cohort_id || app.state.actors[0]?.actor_id;
  }
  const graph = buildGraph();
  const selected = app.selectedNodeId ? graph.nodes.find((node) => node.id === app.selectedNodeId) : graph.nodes[0];
  if (!selected && graph.nodes[0]) {
    app.selectedNodeId = graph.nodes[0].id;
  }

  return `
    <div class="graph-layout">
      <section class="panel graph-panel">
        <div class="panel-header">
          <div>
            <h2>Ecosystem Graph</h2>
            <p>${graph.nodes.length} nodes · ${graph.edges.length} links · Focus: ${escapeHtml(selected?.label || "—")}</p>
          </div>
          <div class="graph-selects">
            <select id="graphMode" aria-label="Graph mode">
              <option value="focus" ${app.graphMode === "focus" ? "selected" : ""}>Focus selected</option>
              <option value="full" ${app.graphMode === "full" ? "selected" : ""}>Full map</option>
            </select>
            <select id="graphFilter" aria-label="Filter by actor type">
              <option value="all" ${app.graphFilter === "all" ? "selected" : ""}>All actors</option>
              <option value="mentor" ${app.graphFilter === "mentor" ? "selected" : ""}>Mentors</option>
              <option value="company" ${app.graphFilter === "company" ? "selected" : ""}>Companies</option>
              <option value="partner" ${app.graphFilter === "partner" ? "selected" : ""}>Partners</option>
              <option value="service_provider" ${app.graphFilter === "service_provider" ? "selected" : ""}>Service providers</option>
            </select>
          </div>
        </div>
        <div class="graph-canvas">
          ${graphLegend()}
          ${graphToolbar()}
          ${graphSvg(graph)}
        </div>
      </section>
      <aside class="panel detail-box">
        ${selected ? nodeDetail(selected, graph) : empty("Select a node in the graph.")}
      </aside>
    </div>
  `;
}

function graphLegend() {
  const items = [
    ["programme", "Programme"],
    ["cohort", "Cohort"],
    ["company", "Company"],
    ["mentor", "Mentor"],
    ["partner", "Partner"],
    ["service_provider", "Service Provider"]
  ];
  return `
    <div class="graph-legend" aria-label="Node legend">
      ${items.map(([key, label]) => `
        <div class="legend-row">
          <span class="legend-dot legend-${key}"></span>
          <span>${label}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function graphToolbar() {
  return `
    <div class="graph-toolbar" aria-label="Graph controls">
      <button class="icon-button" data-graph-action="zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
      <span id="graphZoomLabel" class="zoom-label">${Math.round((app.graphTransform?.scale || 1) * 100)}%</span>
      <button class="icon-button" data-graph-action="zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
      <button class="icon-button" data-graph-action="fit" title="Reset view" aria-label="Reset view">⤢</button>
    </div>
  `;
}

function renderRelationships() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Governed Relationships</h2>
          <p>Approved matches keep status, context, outcome, and reuse metadata.</p>
        </div>
      </div>
      <div class="table-wrap">${relationshipsTable(app.state.relationships)}</div>
    </section>
  `;
}

function bindViewEvents() {
  document.querySelectorAll("[data-view-link]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewLink));
  });

  if (app.view === "intake") {
    const actorType = document.getElementById("actorType");
    const rawInput = document.getElementById("rawInput");
    actorType.addEventListener("change", () => {
      rawInput.value = sampleInputs[actorType.value] || sampleInputs.mentor;
    });
    document.getElementById("loadSampleButton").addEventListener("click", () => {
      rawInput.value = sampleInputs[actorType.value] || sampleInputs.mentor;
    });
    document.getElementById("extractButton").addEventListener("click", extractProfiles);
    document.getElementById("saveProfilesButton")?.addEventListener("click", saveExtractedProfiles);
  }

  if (app.view === "cohorts") {
    document.getElementById("createCohortButton").addEventListener("click", createCohort);
    document.getElementById("reuseCohortSelect").addEventListener("change", (event) => {
      app.selectedCohortId = event.target.value;
      render();
    });
  }

  if (app.view === "match") {
    document.getElementById("matchCohortSelect").addEventListener("change", (event) => {
      app.selectedCohortId = event.target.value;
      app.recommendations = [];
      render();
    });
    document.getElementById("candidateType").addEventListener("change", (event) => {
      app.candidateType = event.target.value;
      app.recommendations = [];
      render();
    });
    document.getElementById("targetCompany").addEventListener("change", (event) => {
      app.selectedCompanyId = event.target.value;
    });
    document.getElementById("runMatchButton").addEventListener("click", runMatch);
    document.querySelectorAll("[data-confirm-rec]").forEach((button) => {
      button.addEventListener("click", () => confirmRecommendation(button.dataset.confirmRec));
    });
  }

  if (app.view === "graph") {
    document.getElementById("graphMode").addEventListener("change", (event) => {
      app.graphMode = event.target.value;
      app.graphTransform = defaultGraphTransform();
      render();
    });
    document.getElementById("graphFilter").addEventListener("change", (event) => {
      app.graphFilter = event.target.value;
      app.graphTransform = defaultGraphTransform();
      render();
    });
    document.querySelectorAll("[data-graph-action]").forEach((button) => {
      button.addEventListener("click", () => updateGraphView(button.dataset.graphAction));
    });
    document.querySelectorAll("[data-node-id]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        if (app.graphSuppressClick) return;
        app.selectedNodeId = node.dataset.nodeId;
        app.graphMode = "focus";
        app.graphTransform = defaultGraphTransform();
        render();
      });
      node.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        app.selectedNodeId = node.dataset.nodeId;
        app.graphMode = "focus";
        app.graphTransform = defaultGraphTransform();
        render();
      });
    });
    bindGraphViewport();
  }

  if (app.view === "relationships") {
    document.querySelectorAll("[data-complete-rel]").forEach((button) => {
      button.addEventListener("click", () => completeRelationship(button.dataset.completeRel));
    });
  }
}

async function extractProfiles() {
  const view = document.getElementById("appView");
  view.classList.add("loading");
  try {
    const actorType = document.getElementById("actorType").value;
    const rawText = document.getElementById("rawInput").value;
    app.extraction = await fetchJson("/api/intake/extract", {
      method: "POST",
      body: { actorType, rawText }
    });
    toast(`Extracted ${app.extraction.profiles.length} profile${app.extraction.profiles.length === 1 ? "" : "s"}.`);
  } finally {
    view.classList.remove("loading");
    render();
  }
}

async function saveExtractedProfiles() {
  if (!app.extraction?.profiles?.length) return;
  await fetchJson("/api/intake/confirm", {
    method: "POST",
    body: { profiles: app.extraction.profiles }
  });
  app.extraction = null;
  await loadState();
  render();
  toast("Profiles saved to graph.");
}

async function createCohort() {
  const dateParts = document.getElementById("dateRange").value.split("to").map((part) => part.trim());
  const response = await fetchJson("/api/cohorts", {
    method: "POST",
    body: {
      name: document.getElementById("cohortName").value,
      programme_id: document.getElementById("programmeId").value,
      country: document.getElementById("country").value,
      industry_focus: document.getElementById("industryFocus").value,
      stage_focus: document.getElementById("stageFocus").value,
      support_needs: splitTerms(document.getElementById("supportNeeds").value),
      start_date: dateParts[0] || "2026-07-01",
      end_date: dateParts[1] || "2026-09-30"
    }
  });
  app.state = response.state;
  app.selectedCohortId = response.cohort.cohort_id;
  render();
  toast("Cohort created.");
}

async function runMatch() {
  const view = document.getElementById("appView");
  view.classList.add("loading");
  try {
    app.selectedCohortId = document.getElementById("matchCohortSelect").value;
    app.candidateType = document.getElementById("candidateType").value;
    app.selectedCompanyId = document.getElementById("targetCompany").value;
    const result = await fetchJson(`/api/match/${encodeURIComponent(app.selectedCohortId)}`, {
      method: "POST",
      body: {
        candidateType: app.candidateType,
        targetCompanyId: app.selectedCompanyId
      }
    });
    app.recommendations = result.recommendations || [];
    toast(result.warning || `Generated ${app.recommendations.length} recommendations.`);
  } finally {
    view.classList.remove("loading");
    render();
  }
}

async function confirmRecommendation(actorId) {
  const rec = app.recommendations.find((item) => item.actor_id === actorId);
  if (!rec) return;
  const response = await fetchJson("/api/relationships/confirm", {
    method: "POST",
    body: {
      cohort_id: app.selectedCohortId,
      source_actor_id: rec.actor_id,
      target_actor_id: rec.target_actor_id,
      relationship_type: rec.relationship_type,
      confidence_score: rec.confidence_score,
      reason: rec.reason,
      targetCompanyId: app.selectedCompanyId
    }
  });
  app.state = response.state;
  app.selectedNodeId = rec.actor_id;
  toast("Relationship confirmed and added to graph.");
  render();
}

async function completeRelationship(relationshipId) {
  const response = await fetchJson(`/api/relationships/${encodeURIComponent(relationshipId)}/outcome`, {
    method: "POST",
    body: {
      outcome_score: 4.7,
      outcome_notes: "Demo completion: strong fit and reusable for similar future cohorts."
    }
  });
  app.state = response.state;
  render();
  toast("Outcome recorded.");
}

function metric(label, value) {
  return `<div class="metric"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${value}</div></div>`;
}

function stepCard(number, title, text) {
  return `
    <div class="record-card">
      <div class="record-top">
        <div>
          <div class="small-label">Step ${number}</div>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <span class="badge blue">P0</span>
      </div>
      <p class="muted">${escapeHtml(text)}</p>
    </div>
  `;
}

function profileCard(profile) {
  return `
    <div class="record-card">
      <div class="record-top">
        <div>
          <h3>${escapeHtml(profile.name)}</h3>
          <p class="muted">${escapeHtml(titleActorType(profile.actor_type))} · ${escapeHtml(profile.country)} · ${escapeHtml(profile.domain)}</p>
        </div>
        <div class="score">${Math.round(Number(profile.confidence_score || 0) * 100)}</div>
      </div>
      <div class="badge-row">${tagBadges([...(profile.skills || []), ...(profile.stage_focus || [])])}</div>
      ${(profile.missing_fields || []).length ? `<div class="badge amber">Missing: ${escapeHtml(profile.missing_fields.join(", "))}</div>` : `<div class="badge green">Ready for review</div>`}
    </div>
  `;
}

function reuseCard(item) {
  return `
    <div class="record-card">
      <div class="record-top">
        <div>
          <h3>${escapeHtml(item.actor.name)}</h3>
          <p class="muted">${escapeHtml(titleActorType(item.actor.actor_type))} · ${escapeHtml(item.previous_cohort)}</p>
        </div>
        <span class="badge green">${Number(item.previous_outcome).toFixed(1)}/5</span>
      </div>
      <p>${escapeHtml(item.reason)}</p>
      <div class="badge-row">${tagBadges([item.relationship_type, item.actor.domain, ...(item.actor.tags || []).slice(0, 3)])}</div>
    </div>
  `;
}

function recommendationCard(rec) {
  return `
    <div class="record-card">
      <div class="record-top">
        <div>
          <h3>${escapeHtml(rec.name)}</h3>
          <p class="muted">${escapeHtml(titleActorType(rec.actor_type))} · ${escapeHtml(rec.relationship_type)}</p>
        </div>
        <div class="score">${rec.fit_score}</div>
      </div>
      <p>${escapeHtml(rec.reason)}</p>
      <div class="badge-row">
        <span class="badge ${rec.conflict_detected ? "red" : "green"}">${rec.conflict_detected ? "Conflict" : "Available"}</span>
        <span class="badge blue">Confidence ${Math.round(Number(rec.confidence_score || 0) * 100)}%</span>
        <span class="badge">${escapeHtml(rec.reuse_signal)}</span>
      </div>
      ${(rec.risks || []).length ? `<p class="muted">Risks: ${escapeHtml(rec.risks.join("; "))}</p>` : ""}
      <div class="button-row">
        <button class="primary-button" data-confirm-rec="${escapeHtml(rec.actor_id)}">Confirm Relationship</button>
      </div>
    </div>
  `;
}

function relationshipCard(rel) {
  const source = findNodeName(rel.source_actor_id);
  const target = findNodeName(rel.target_actor_id);
  return `
    <div class="record-card">
      <div class="record-top">
        <div>
          <h3>${escapeHtml(source)} -> ${escapeHtml(target)}</h3>
          <p class="muted">${escapeHtml(rel.relationship_type)} · ${escapeHtml(rel.status)}</p>
        </div>
        ${rel.outcome_score ? `<span class="badge green">${Number(rel.outcome_score).toFixed(1)}/5</span>` : `<span class="badge amber">Active</span>`}
      </div>
      <p>${escapeHtml(rel.explanation || "No explanation recorded.")}</p>
    </div>
  `;
}

function relationshipsTable(relationships) {
  return `
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Relationship</th>
          <th>Target</th>
          <th>Context</th>
          <th>Status</th>
          <th>Outcome</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${relationships.map((rel) => `
          <tr>
            <td>${escapeHtml(findNodeName(rel.source_actor_id))}</td>
            <td><span class="badge blue">${escapeHtml(rel.relationship_type)}</span></td>
            <td>${escapeHtml(findNodeName(rel.target_actor_id))}</td>
            <td>${escapeHtml(findCohort(rel.cohort_id)?.name || findProgramme(rel.programme_id)?.name || "Unknown")}</td>
            <td><span class="badge ${rel.status === "completed" ? "green" : "amber"}">${escapeHtml(rel.status)}</span></td>
            <td>${rel.outcome_score ? `${Number(rel.outcome_score).toFixed(1)}/5` : "Pending"}</td>
            <td>${rel.status === "active" ? `<button class="plain-button" data-complete-rel="${escapeHtml(rel.relationship_id)}">Record Outcome</button>` : "Done"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function cohortsTable() {
  return `
    <table>
      <thead>
        <tr>
          <th>Cohort</th>
          <th>Programme</th>
          <th>Focus</th>
          <th>Stage</th>
          <th>Support Needs</th>
          <th>Dates</th>
        </tr>
      </thead>
      <tbody>
        ${app.state.cohorts.map((cohort) => `
          <tr>
            <td>${escapeHtml(cohort.name)}</td>
            <td>${escapeHtml(findProgramme(cohort.programme_id)?.name || "Unknown")}</td>
            <td>${escapeHtml(cohort.industry_focus)}</td>
            <td>${escapeHtml(cohort.stage_focus)}</td>
            <td><div class="badge-row">${tagBadges(cohort.support_needs || [])}</div></td>
            <td>${escapeHtml(cohort.start_date)} to ${escapeHtml(cohort.end_date)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function matchSummary(recs) {
  const top = recs[0];
  const conflicts = recs.filter((rec) => rec.conflict_detected).length;
  const warm = recs.filter((rec) => !String(rec.reuse_signal || "").startsWith("No prior")).length;
  return `
    <div class="record-list">
      ${metric("Top score", top.fit_score)}
      ${metric("Warm candidates", warm)}
      ${metric("Conflicts", conflicts)}
    </div>
  `;
}

function actorTypeOptions(selected) {
  return [
    ["mentor", "Mentor"],
    ["company", "Company"],
    ["partner", "Partner"],
    ["service_provider", "Service provider"]
  ].map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

function cohortOptions(selected) {
  return app.state.cohorts.map((cohort) => `<option value="${cohort.cohort_id}" ${cohort.cohort_id === selected ? "selected" : ""}>${escapeHtml(cohort.name)}</option>`).join("");
}

function buildGraph() {
  const nodes = [];
  const edges = [];

  app.state.programmes.forEach((program) => nodes.push({ id: program.programme_id, label: program.name, type: "programme", typeLabel: "Programme", raw: program }));
  app.state.cohorts.forEach((cohort) => {
    nodes.push({ id: cohort.cohort_id, label: cohort.name, type: "cohort", typeLabel: "Cohort", raw: cohort });
    edges.push({ id: `program_${cohort.programme_id}_${cohort.cohort_id}`, source: cohort.programme_id, target: cohort.cohort_id, type: "HAS_COHORT" });
  });
  app.state.actors.forEach((actor) => {
    nodes.push({ id: actor.actor_id, label: actor.name, type: actor.actor_type, typeLabel: titleActorType(actor.actor_type), raw: actor });
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  app.state.relationships.forEach((rel) => {
    if (nodeIds.has(rel.source_actor_id) && nodeIds.has(rel.target_actor_id)) {
      edges.push({ id: rel.relationship_id, source: rel.source_actor_id, target: rel.target_actor_id, type: rel.relationship_type, raw: rel });
    }
    if (nodeIds.has(rel.source_actor_id) && nodeIds.has(rel.cohort_id) && rel.target_actor_id !== rel.cohort_id) {
      edges.push({ id: `${rel.relationship_id}_context`, source: rel.source_actor_id, target: rel.cohort_id, type: "CONTEXT", raw: rel });
    }
  });

  const selectedId = app.selectedNodeId || app.selectedCohortId || nodes[0]?.id;
  const focusedIds = app.graphMode === "focus" ? collectFocusNodeIds(selectedId, edges) : new Set(nodes.map((node) => node.id));

  const filteredNodes = nodes.filter((node) => {
    if (!focusedIds.has(node.id)) return false;
    if (!isActorType(node.type)) return true;
    if (app.graphFilter === "all") return true;
    return node.type === app.graphFilter || node.id === selectedId;
  });
  const filteredIds = new Set(filteredNodes.map((node) => node.id));
  const filteredEdges = dedupeEdges(edges)
    .filter((edge) => filteredIds.has(edge.source) && filteredIds.has(edge.target))
    .map((edge) => ({
      ...edge,
      active: edge.source === selectedId || edge.target === selectedId,
      contextual: edge.type === "CONTEXT" || edge.type === "HAS_COHORT"
    }));

  const graph = { nodes: filteredNodes, edges: filteredEdges, selectedId };
  return app.graphMode === "focus" ? layoutFocusGraph(graph) : layoutFullGraph(graph);
}

function collectFocusNodeIds(selectedId, edges) {
  const ids = new Set([selectedId]);
  edges.forEach((edge) => {
    if (edge.source === selectedId) ids.add(edge.target);
    if (edge.target === selectedId) ids.add(edge.source);
  });
  return ids;
}

function dedupeEdges(edges) {
  const seen = new Set();
  return edges.filter((edge) => {
    const key = `${edge.source}|${edge.target}|${edge.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isActorType(type) {
  return ["mentor", "company", "partner", "service_provider"].includes(type);
}

const GRAPH_COLORS = {
  programme: "#315f9a",
  cohort: "#11786f",
  mentor: "#b66a11",
  company: "#1f7a4f",
  partner: "#7d5796",
  service_provider: "#8a4f37"
};

const GRAPH_TYPE_ORDER = ["programme", "cohort", "company", "mentor", "partner", "service_provider"];

function layoutFullGraph(graph) {
  const width = 920;
  const height = 620;
  const cx = width / 2;
  const cy = height / 2;

  const byType = (type) => graph.nodes.filter((node) => node.type === type);
  const programmes = byType("programme");
  const cohorts = byType("cohort");
  const actors = graph.nodes.filter((node) => isActorType(node.type));

  if (programmes.length === 1) {
    programmes[0].x = cx;
    programmes[0].y = cy;
    programmes[0].radius = 22;
  } else {
    placeOnRing(programmes, cx, cy, 70, 22);
  }

  placeOnRing(cohorts, cx, cy, 175, 18);

  const typesPresent = ["mentor", "company", "partner", "service_provider"].filter((type) =>
    actors.some((actor) => actor.type === type)
  );
  const sectorSize = (Math.PI * 2) / Math.max(1, typesPresent.length);
  const sectorPad = 0.08;

  typesPresent.forEach((type, index) => {
    const sectorStart = -Math.PI / 2 + index * sectorSize;
    const inner = sectorStart + sectorSize * sectorPad;
    const outer = sectorStart + sectorSize * (1 - sectorPad);
    const span = outer - inner;
    const items = actors.filter((actor) => actor.type === type);

    items.forEach((node, i) => {
      const t = items.length === 1 ? 0.5 : i / (items.length - 1);
      const angle = inner + t * span;
      const ringRadius = items.length > 6 && i % 2 === 1 ? 295 : 255;
      node.x = cx + ringRadius * Math.cos(angle);
      node.y = cy + ringRadius * Math.sin(angle);
      node.radius = 14;
      node.angle = angle;
    });

    const labelAngle = inner + span / 2;
    const labelRadius = 312;
    graph.sectorLabels = graph.sectorLabels || [];
    graph.sectorLabels.push({
      type,
      x: cx + labelRadius * Math.cos(labelAngle),
      y: cy + labelRadius * Math.sin(labelAngle),
      angle: labelAngle
    });
  });

  graph.width = width;
  graph.height = height;
  graph.center = { x: cx, y: cy };
  return graph;
}

function layoutFocusGraph(graph) {
  const width = 760;
  const height = 540;
  const cx = width / 2;
  const cy = height / 2;
  const selected = graph.nodes.find((node) => node.id === graph.selectedId) || graph.nodes[0];

  graph.width = width;
  graph.height = height;
  graph.center = { x: cx, y: cy };
  if (!selected) return graph;

  selected.x = cx;
  selected.y = cy;
  selected.radius = 26;
  selected.selected = true;

  const neighbors = graph.nodes
    .filter((node) => node.id !== selected.id)
    .sort((a, b) => GRAPH_TYPE_ORDER.indexOf(a.type) - GRAPH_TYPE_ORDER.indexOf(b.type));

  const ring = neighbors.length > 8 ? 200 : 175;
  const startAngle = -Math.PI / 2;
  neighbors.forEach((node, index) => {
    const angle = startAngle + (index / neighbors.length) * Math.PI * 2;
    const stagger = neighbors.length > 10 && index % 2 === 1 ? 32 : 0;
    const r = ring + stagger;
    node.x = cx + r * Math.cos(angle);
    node.y = cy + r * Math.sin(angle);
    node.radius = 16;
    node.angle = angle;
  });

  graph.edges = graph.edges.map((edge) => ({
    ...edge,
    active: edge.source === selected.id || edge.target === selected.id
  }));
  return graph;
}

function placeOnRing(nodes, cx, cy, radius, nodeRadius) {
  if (!nodes.length) return;
  if (nodes.length === 1) {
    nodes[0].x = cx;
    nodes[0].y = cy - radius;
    nodes[0].radius = nodeRadius;
    return;
  }
  const startAngle = -Math.PI / 2;
  nodes.forEach((node, index) => {
    const angle = startAngle + (index / nodes.length) * Math.PI * 2;
    node.x = cx + radius * Math.cos(angle);
    node.y = cy + radius * Math.sin(angle);
    node.radius = nodeRadius;
    node.angle = angle;
  });
}

function graphSvg(graph) {
  const width = graph.width || 800;
  const height = graph.height || 580;
  const transform = app.graphTransform || { x: 0, y: 0, scale: 1 };
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const selectedId = app.selectedNodeId;

  const edgeMarkup = graph.edges.map((edge) => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) return "";
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = Math.min(40, len * 0.12);
    const nx = -dy / len * curve;
    const ny = dx / len * curve;
    const className = [
      "graph-edge",
      edge.contextual ? "context" : "",
      edge.active ? "active" : "muted-edge"
    ].filter(Boolean).join(" ");
    return `<path class="${className}" d="M ${source.x} ${source.y} Q ${mx + nx} ${my + ny} ${target.x} ${target.y}"></path>`;
  }).join("");

  const sectorMarkup = (graph.sectorLabels || []).map((label) => `
    <text class="graph-sector-label" x="${label.x}" y="${label.y}" text-anchor="middle" dominant-baseline="middle">
      ${escapeHtml(titleActorType(label.type))}s
    </text>
  `).join("");

  const nodeMarkup = graph.nodes.map((node) => {
    const isSelected = selectedId === node.id;
    const isNeighbor = !isSelected && graph.edges.some((edge) =>
      edge.active && (edge.source === node.id || edge.target === node.id)
    );
    const fill = GRAPH_COLORS[node.type] || "#62706b";
    const r = node.radius || 16;
    const label = truncate(node.label, 22);
    const showLabel = isSelected || isNeighbor || node.type === "programme" || node.type === "cohort" || app.graphMode === "focus";
    const className = [
      "graph-node",
      `graph-node-${node.type}`,
      isSelected ? "selected" : "",
      isNeighbor ? "neighbor" : ""
    ].filter(Boolean).join(" ");

    const haloMarkup = isSelected
      ? `<circle class="graph-node-halo" cx="${node.x}" cy="${node.y}" r="${r + 9}" fill="none" stroke="${fill}" stroke-width="1.8" opacity="0.32"></circle>`
      : "";

    const labelMarkup = showLabel
      ? `<text x="${node.x}" y="${node.y + r + 16}" text-anchor="middle">${escapeHtml(label)}</text>`
      : "";

    return `
      <g class="${className}" data-node-id="${escapeHtml(node.id)}" tabindex="0" role="button" aria-label="Focus ${escapeHtml(node.label)}">
        <title>${escapeHtml(node.label)} — ${escapeHtml(node.typeLabel)}</title>
        ${haloMarkup}
        <circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${fill}"></circle>
        ${labelMarkup}
      </g>
    `;
  }).join("");

  return `
    <svg id="graphSvg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="EcoLink relationship graph">
      <defs>
        <pattern id="graphDots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="#dde4e1"></circle>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="#fbfcfc"></rect>
      <rect width="${width}" height="${height}" fill="url(#graphDots)"></rect>
      <g id="graphViewport" transform="translate(${transform.x} ${transform.y}) scale(${transform.scale})">
        <g class="graph-edges">${edgeMarkup}</g>
        <g class="graph-sector-labels">${sectorMarkup}</g>
        <g class="graph-nodes">${nodeMarkup}</g>
      </g>
    </svg>
  `;
}

function bindGraphViewport() {
  const svg = document.getElementById("graphSvg");
  if (!svg) return;

  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    const svgPoint = graphPointer(event, svg);
    const oldScale = app.graphTransform.scale;
    const direction = event.deltaY > 0 ? -1 : 1;
    const nextScale = clamp(oldScale * (direction > 0 ? 1.14 : 0.88), 0.45, 2.4);
    zoomGraphAt(nextScale, svgPoint.x, svgPoint.y);
  }, { passive: false });

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest?.(".graph-node")) return;
    const start = graphPointer(event, svg);
    app.graphDrag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: start.x,
      startY: start.y,
      originX: app.graphTransform.x,
      originY: app.graphTransform.y,
      moved: false
    };
    svg.classList.add("dragging");
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (!app.graphDrag) return;
    const viewBox = svg.viewBox.baseVal;
    const dx = (event.clientX - app.graphDrag.startClientX) / svg.getBoundingClientRect().width * viewBox.width;
    const dy = (event.clientY - app.graphDrag.startClientY) / svg.getBoundingClientRect().height * viewBox.height;
    if (Math.abs(dx) + Math.abs(dy) > 3) app.graphDrag.moved = true;
    setGraphTransform({
      x: app.graphDrag.originX + dx,
      y: app.graphDrag.originY + dy,
      scale: app.graphTransform.scale
    });
  });

  svg.addEventListener("pointerup", (event) => endGraphDrag(svg, event));
  svg.addEventListener("pointercancel", (event) => endGraphDrag(svg, event));
}

function endGraphDrag(svg, event) {
  if (!app.graphDrag) return;
  app.graphSuppressClick = app.graphDrag.moved;
  app.graphDrag = null;
  svg.classList.remove("dragging");
  try {
    svg.releasePointerCapture(event.pointerId);
  } catch (_) {
    // Pointer capture can already be released when the pointer leaves the SVG.
  }
  window.setTimeout(() => {
    app.graphSuppressClick = false;
  }, 0);
}

function graphPointer(event, svg) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  return {
    x: (event.clientX - rect.left) / rect.width * viewBox.width,
    y: (event.clientY - rect.top) / rect.height * viewBox.height
  };
}

function updateGraphView(action) {
  const centerX = app.graphMode === "focus" ? 380 : 460;
  const centerY = app.graphMode === "focus" ? 270 : 310;
  if (action === "zoom-in") {
    zoomGraphAt(clamp(app.graphTransform.scale * 1.18, 0.45, 2.4), centerX, centerY);
  }
  if (action === "zoom-out") {
    zoomGraphAt(clamp(app.graphTransform.scale * 0.84, 0.45, 2.4), centerX, centerY);
  }
  if (action === "reset" || action === "fit") {
    setGraphTransform(defaultGraphTransform());
  }
}

function defaultGraphTransform() {
  return { x: 0, y: 0, scale: 1 };
}

function zoomGraphAt(nextScale, pointX, pointY) {
  const current = app.graphTransform;
  const worldX = (pointX - current.x) / current.scale;
  const worldY = (pointY - current.y) / current.scale;
  setGraphTransform({
    x: pointX - worldX * nextScale,
    y: pointY - worldY * nextScale,
    scale: nextScale
  });
}

function setGraphTransform(next) {
  app.graphTransform = {
    x: clamp(next.x, -760, 760),
    y: clamp(next.y, -480, 480),
    scale: clamp(next.scale, 0.45, 2.4)
  };
  const viewport = document.getElementById("graphViewport");
  if (viewport) {
    viewport.setAttribute("transform", `translate(${app.graphTransform.x} ${app.graphTransform.y}) scale(${app.graphTransform.scale})`);
  }
  const zoomLabel = document.getElementById("graphZoomLabel");
  if (zoomLabel) {
    zoomLabel.textContent = `${Math.round(app.graphTransform.scale * 100)}%`;
  }
}

function nodeDetail(node, graph) {
  const linkedRelationships = app.state.relationships.filter((rel) =>
    rel.source_actor_id === node.id || rel.target_actor_id === node.id || rel.cohort_id === node.id || rel.programme_id === node.id
  );
  const active = linkedRelationships.filter((rel) => rel.status === "active").length;
  const completed = linkedRelationships.filter((rel) => rel.status === "completed").length;
  const outcomes = linkedRelationships.map((rel) => Number(rel.outcome_score || 0)).filter((value) => value > 0);
  const avgOutcome = outcomes.length ? (outcomes.reduce((a, b) => a + b, 0) / outcomes.length).toFixed(1) : "—";
  const visibleDegree = graph ? graph.edges.filter((edge) => edge.source === node.id || edge.target === node.id).length : 0;

  return `
    <div class="detail-stack">
      <div class="detail-header">
        <div class="detail-type-chip detail-type-${node.type}">
          <span class="legend-dot legend-${node.type}"></span>
          <span>${escapeHtml(node.typeLabel)}</span>
        </div>
        <h2 class="detail-title">${escapeHtml(node.label)}</h2>
        <div class="badge-row">${tagBadges(detailTags(node))}</div>
      </div>

      <div class="detail-stats">
        <div class="detail-stat">
          <div class="detail-stat-value">${visibleDegree}</div>
          <div class="detail-stat-label">Visible links</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-value">${active}</div>
          <div class="detail-stat-label">Active</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-value">${completed}</div>
          <div class="detail-stat-label">Completed</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-value">${avgOutcome}</div>
          <div class="detail-stat-label">Avg outcome</div>
        </div>
      </div>

      <div class="detail-section">
        <div class="small-label">Relationships</div>
        <div class="record-list">
          ${linkedRelationships.slice(0, 6).map(relationshipCard).join("") || empty("No relationships linked to this node.")}
        </div>
      </div>
    </div>
  `;
}

function detailTags(node) {
  const raw = node.raw;
  if (node.type === "cohort") return [raw.country, raw.industry_focus, raw.stage_focus, ...(raw.support_needs || []).slice(0, 3)];
  if (node.type === "programme") return [raw.country, raw.focus_area, raw.owner];
  return [raw.country, raw.domain, ...(raw.tags || []).slice(0, 4)];
}

function tagBadges(tags) {
  return (tags || []).filter(Boolean).slice(0, 8).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("");
}

function empty(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function reuseCandidates(cohortId) {
  const cohort = findCohort(cohortId);
  if (!cohort) return [];
  const candidates = new Map();
  app.state.relationships.forEach((rel) => {
    if (Number(rel.outcome_score || 0) < 4.4) return;
    const historicalCohort = findCohort(rel.cohort_id);
    const actor = findActor(rel.source_actor_id);
    if (!historicalCohort || !actor) return;
    const sameIndustry = normalize(historicalCohort.industry_focus) === normalize(cohort.industry_focus);
    const sharedNeeds = overlap(historicalCohort.support_needs || [], cohort.support_needs || []) > 0;
    const sameCountry = normalize(historicalCohort.country) === normalize(cohort.country);
    if (!sameIndustry && !sharedNeeds && !sameCountry) return;
    const item = {
      actor,
      relationship_id: rel.relationship_id,
      previous_cohort: historicalCohort.name,
      previous_outcome: rel.outcome_score,
      relationship_type: rel.relationship_type,
      reason: `${actor.name} worked in ${historicalCohort.name} with outcome ${rel.outcome_score}/5.`
    };
    const existing = candidates.get(actor.actor_id);
    if (!existing || Number(item.previous_outcome) > Number(existing.previous_outcome)) {
      candidates.set(actor.actor_id, item);
    }
  });
  return [...candidates.values()].slice(0, 6);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

function findActor(id) {
  return app.state?.actors?.find((actor) => actor.actor_id === id);
}

function findCohort(id) {
  return app.state?.cohorts?.find((cohort) => cohort.cohort_id === id);
}

function findProgramme(id) {
  return app.state?.programmes?.find((program) => program.programme_id === id);
}

function findNodeName(id) {
  return findActor(id)?.name || findCohort(id)?.name || findProgramme(id)?.name || id || "Unknown";
}

function companies() {
  return app.state?.actors?.filter((actor) => actor.actor_type === "company") || [];
}

function splitTerms(value) {
  return String(value).split(/[;,|]/).map((term) => term.trim()).filter(Boolean);
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function overlap(left, right) {
  const leftSet = new Set((left || []).map(normalize));
  return (right || []).map(normalize).filter((value) => leftSet.has(value)).length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleActorType(value) {
  return String(value || "").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length - 1)}.` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
