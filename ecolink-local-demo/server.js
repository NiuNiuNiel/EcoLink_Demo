const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const publicDir = path.join(root, "public");
const seedPath = path.join(root, "data", "seed.json");
const portPath = path.join(root, ".server-port");

loadEnv(path.join(root, ".env.local"));
loadEnv(path.join(root, ".env"));

let state = loadSeed();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: "Internal server error", details: error.message });
  }
});

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

function loadSeed() {
  return JSON.parse(fs.readFileSync(seedPath, "utf8"));
}

function serveStatic(req, res, url) {
  let filePath = url.pathname === "/" ? path.join(publicDir, "index.html") : path.join(publicDir, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(publicDir, "index.html");
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      app: "EcoLink AI Local Demo",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      mode: process.env.GEMINI_API_KEY ? "live Gemini with fallback" : "seeded fallback"
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    sendJson(res, 200, withDerivedState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/demo/reset") {
    state = loadSeed();
    sendJson(res, 200, withDerivedState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/intake/extract") {
    const body = await readJson(req);
    const actorType = normalizeActorType(body.actorType || "mentor");
    const rawText = String(body.rawText || "");
    const result = await extractProfiles(actorType, rawText);
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/intake/confirm") {
    const body = await readJson(req);
    const profiles = Array.isArray(body.profiles) ? body.profiles : [body.profile].filter(Boolean);
    const saved = profiles.map(saveProfile);
    sendJson(res, 200, { saved, state: withDerivedState() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/cohorts") {
    const body = await readJson(req);
    const cohort = createCohort(body);
    state.cohorts.unshift(cohort);
    sendJson(res, 200, { cohort, state: withDerivedState() });
    return;
  }

  const matchPath = url.pathname.match(/^\/api\/match\/([^/]+)$/);
  if (req.method === "POST" && matchPath) {
    const body = await readJson(req);
    const cohortId = decodeURIComponent(matchPath[1]);
    const candidateType = normalizeActorType(body.candidateType || "mentor");
    const targetCompanyId = body.targetCompanyId || pickFirstCompanyForCohort(cohortId);
    const result = await recommendMatches(cohortId, candidateType, targetCompanyId);
    sendJson(res, 200, result);
    return;
  }

  const reusePath = url.pathname.match(/^\/api\/reuse\/([^/]+)$/);
  if (req.method === "GET" && reusePath) {
    const cohortId = decodeURIComponent(reusePath[1]);
    sendJson(res, 200, { cohortId, candidates: getReuseCandidates(cohortId) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/relationships/confirm") {
    const body = await readJson(req);
    const relationship = confirmRelationship(body);
    sendJson(res, 200, { relationship, state: withDerivedState() });
    return;
  }

  const outcomePath = url.pathname.match(/^\/api\/relationships\/([^/]+)\/outcome$/);
  if (req.method === "POST" && outcomePath) {
    const body = await readJson(req);
    const relationship = state.relationships.find((item) => item.relationship_id === decodeURIComponent(outcomePath[1]));
    if (!relationship) {
      sendJson(res, 404, { error: "Relationship not found" });
      return;
    }
    relationship.status = "completed";
    relationship.outcome_score = Number(body.outcome_score || 4.5);
    relationship.outcome_notes = String(body.outcome_notes || "");
    sendJson(res, 200, { relationship, state: withDerivedState() });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function withDerivedState() {
  return {
    ...state,
    metrics: {
      actors: state.actors.length,
      relationships: state.relationships.length,
      active: state.relationships.filter((item) => item.status === "active").length,
      completed: state.relationships.filter((item) => item.status === "completed").length,
      reusable: state.relationships.filter((item) => Number(item.outcome_score || 0) >= 4.5).length
    }
  };
}

async function extractProfiles(actorType, rawText) {
  const fallback = fallbackExtract(actorType, rawText);
  if (!process.env.GEMINI_API_KEY || rawText.trim().length < 8) {
    return { source: "fallback", ...fallback };
  }

  const prompt = [
    "You are extracting structured innovation ecosystem actor profiles for EcoLink AI.",
    "Return strict JSON only. Do not wrap in markdown.",
    "If information is missing, use \"unknown\" and add it to missing_fields. Do not invent facts.",
    `Actor type: ${actorType}`,
    "Return this shape: {\"profiles\":[{\"actor_type\":\"mentor|company|partner|service_provider\",\"name\":\"string\",\"country\":\"string\",\"city\":\"string\",\"domain\":\"string\",\"skills\":[\"string\"],\"stage_focus\":[\"string\"],\"availability\":\"string\",\"confidence_score\":0.0,\"missing_fields\":[\"string\"],\"tags\":[\"string\"]}]}",
    "Raw input:",
    rawText
  ].join("\n\n");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    const parsed = parseJsonLoose(text);
    const profiles = normalizeProfiles(parsed.profiles || [], actorType);
    if (!profiles.length) throw new Error("Gemini returned no profiles");
    return { source: "gemini", profiles, rawModelOutput: parsed };
  } catch (error) {
    return {
      source: "fallback",
      warning: `Live Gemini unavailable, using deterministic extraction: ${error.message}`,
      ...fallback
    };
  }
}

function parseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    return JSON.parse(match[0]);
  }
}

function fallbackExtract(actorType, rawText) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const usefulLines = lines.filter((line) => !/^name\s*,/i.test(line)).slice(0, 8);
  const profiles = (usefulLines.length ? usefulLines : [sampleLine(actorType)]).map((line, index) => {
    const cells = line.split(",").map((cell) => cell.trim()).filter(Boolean);
    const name = cells[0] || `${titleActorType(actorType)} ${index + 1}`;
    const joined = line.toLowerCase();
    const tags = inferTags(joined);
    const domain = cells[1] || inferDomain(joined);
    return {
      actor_type: actorType,
      name,
      country: inferCountry(joined),
      city: cells[4] || "Kuala Lumpur",
      domain,
      skills: unique([...(cells[2] ? splitTerms(cells[2]) : []), ...tags.slice(0, 4)]).slice(0, 6),
      stage_focus: inferStages(joined),
      availability: cells[3] || (actorType === "company" ? "active cohort candidate" : "3 hours/week"),
      confidence_score: Math.min(0.92, 0.68 + tags.length * 0.04),
      missing_fields: cells.length < 3 ? ["availability", "stage_focus"] : [],
      tags
    };
  });
  return { profiles: normalizeProfiles(profiles, actorType) };
}

function saveProfile(profile) {
  const actorType = normalizeActorType(profile.actor_type || profile.actorType || "mentor");
  const idBase = slugify(profile.name || `${actorType}_${Date.now()}`);
  const actor = {
    actor_id: uniqueActorId(`${actorType}_${idBase}`),
    actor_type: actorType,
    name: profile.name || "Unnamed Actor",
    country: profile.country || "Malaysia",
    city: profile.city || "Kuala Lumpur",
    domain: profile.domain || "unknown",
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    stage_focus: Array.isArray(profile.stage_focus) ? profile.stage_focus : [],
    availability: profile.availability || "unknown",
    tags: Array.isArray(profile.tags) ? profile.tags : [],
    past_outcome_average: Number(profile.past_outcome_average || 0)
  };
  if (actorType === "company") {
    actor.industry = actor.domain;
    actor.stage = actor.stage_focus[0] || "seed";
    actor.needs = actor.skills;
    actor.growth_goals = profile.growth_goals || [];
  }
  if (actorType === "partner") {
    actor.partner_type = profile.partner_type || "ecosystem partner";
    actor.capabilities = actor.skills;
    actor.country_coverage = [actor.country];
  }
  if (actorType === "service_provider") {
    actor.service_categories = actor.skills;
    actor.specializations = actor.tags;
    actor.country_coverage = [actor.country];
  }
  state.actors.unshift(actor);
  return actor;
}

function createCohort(body) {
  const programmeId = body.programme_id || state.programmes[0]?.programme_id || "programme_ai_scale";
  return {
    cohort_id: uniqueCohortId(`cohort_${slugify(body.name || "new_cohort")}`),
    programme_id: programmeId,
    name: body.name || "New Cohort",
    country: body.country || "Malaysia",
    industry_focus: body.industry_focus || body.industryFocus || "fintech",
    stage_focus: body.stage_focus || body.stageFocus || "seed",
    support_needs: Array.isArray(body.support_needs) ? body.support_needs : splitTerms(body.support_needs || body.supportNeeds || "fundraising, go-to-market"),
    start_date: body.start_date || body.startDate || "2026-07-01",
    end_date: body.end_date || body.endDate || "2026-09-30"
  };
}

async function recommendMatches(cohortId, candidateType, targetCompanyId) {
  const cohort = state.cohorts.find((item) => item.cohort_id === cohortId);
  if (!cohort) return { cohortId, recommendations: [], error: "Cohort not found" };
  const candidates = state.actors.filter((actor) => actor.actor_type === candidateType);
  const scored = candidates.map((actor) => scoreCandidate(actor, cohort, targetCompanyId)).sort((a, b) => b.fit_score - a.fit_score).slice(0, 6);

  const fallback = {
    source: "deterministic",
    cohort,
    targetCompanyId,
    recommendations: scored
  };

  if (!process.env.GEMINI_API_KEY || scored.length === 0) return fallback;

  const compact = scored.map((item) => ({
    actor_id: item.actor_id,
    name: item.name,
    deterministic_score: item.fit_score,
    reason: item.reason,
    risks: item.risks,
    reuse_signal: item.reuse_signal
  }));

  const prompt = [
    "You are helping an ecosystem administrator review AI match recommendations.",
    "Return strict JSON only. Keep actor IDs unchanged. Do not invent actor IDs.",
    "Improve only the reason text and confidence score using the provided evidence.",
    `Cohort: ${JSON.stringify(cohort)}`,
    `Candidates: ${JSON.stringify(compact)}`,
    "Return: {\"recommendations\":[{\"actor_id\":\"string\",\"confidence_score\":0.0,\"reason\":\"string\",\"risks\":[\"string\"],\"reuse_signal\":\"string\"}]}"
  ].join("\n\n");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    const parsed = parseJsonLoose(text);
    const byId = new Map((parsed.recommendations || []).map((item) => [item.actor_id, item]));
    return {
      ...fallback,
      source: "gemini-assisted",
      recommendations: scored.map((item) => ({ ...item, ...(byId.get(item.actor_id) || {}) }))
    };
  } catch (error) {
    return { ...fallback, warning: `Live Gemini unavailable, using deterministic match scoring: ${error.message}` };
  }
}

function scoreCandidate(actor, cohort, targetCompanyId) {
  const targetCompany = state.actors.find((item) => item.actor_id === targetCompanyId);
  const profileTerms = termsForActor(actor);
  const needs = normalizeTerms([cohort.industry_focus, cohort.stage_focus, ...(cohort.support_needs || []), ...(targetCompany?.needs || [])]);
  const overlap = [...new Set(profileTerms.filter((term) => needs.includes(term)))];
  const domainMatch = normalizeTerm(actor.domain) === normalizeTerm(cohort.industry_focus) || actor.tags?.map(normalizeTerm).includes(normalizeTerm(cohort.industry_focus));
  const countryMatch = normalizeTerm(actor.country) === normalizeTerm(cohort.country) || actor.country_coverage?.map(normalizeTerm).includes(normalizeTerm(cohort.country));
  const stageMatch = (actor.stage_focus || []).map(normalizeTerm).includes(normalizeTerm(cohort.stage_focus));
  const pastRelationships = state.relationships.filter((rel) => rel.source_actor_id === actor.actor_id && Number(rel.outcome_score || 0) >= 4.4);
  const conflict = hasConflict(actor.actor_id, cohort);

  let score = 35;
  score += domainMatch ? 18 : 0;
  score += countryMatch ? 10 : 0;
  score += stageMatch ? 10 : 0;
  score += Math.min(24, overlap.length * 6);
  score += Math.min(10, pastRelationships.length * 4);
  score += Number(actor.past_outcome_average || 0) >= 4.6 ? 6 : 0;
  score -= conflict ? 12 : 0;
  score = Math.max(20, Math.min(98, Math.round(score)));

  const risks = [];
  if (conflict) risks.push("Overlapping active cohort dates");
  if (!countryMatch) risks.push("Cross-border fit requires admin review");
  if (overlap.length < 2) risks.push("Limited direct support-need overlap");

  return {
    actor_id: actor.actor_id,
    actor_type: actor.actor_type,
    name: actor.name,
    fit_score: score,
    confidence_score: Math.min(0.97, Math.max(0.55, score / 100)),
    reason: buildReason(actor, cohort, overlap, domainMatch, countryMatch, pastRelationships),
    risks,
    reuse_signal: pastRelationships.length
      ? `${pastRelationships.length} strong previous relationship${pastRelationships.length > 1 ? "s" : ""}, best outcome ${Math.max(...pastRelationships.map((rel) => Number(rel.outcome_score || 0))).toFixed(1)}/5`
      : "No prior confirmed relationship in the graph yet",
    conflict_detected: conflict,
    relationship_type: relationshipTypeFor(actor.actor_type),
    target_actor_id: targetFor(actor.actor_type, cohort, targetCompanyId)
  };
}

function buildReason(actor, cohort, overlap, domainMatch, countryMatch, pastRelationships) {
  const pieces = [];
  if (domainMatch) pieces.push(`matches the ${cohort.industry_focus} focus`);
  if (overlap.length) pieces.push(`covers ${overlap.slice(0, 3).join(", ")}`);
  if (countryMatch) pieces.push(`has ${cohort.country} coverage`);
  if (pastRelationships.length) pieces.push("has positive reusable history");
  if (!pieces.length) pieces.push("has adjacent ecosystem experience");
  return `${actor.name} ${pieces.join(", ")}.`;
}

function confirmRelationship(body) {
  const cohort = state.cohorts.find((item) => item.cohort_id === body.cohort_id) || state.cohorts[0];
  const sourceActorId = body.source_actor_id || body.actor_id;
  const source = state.actors.find((item) => item.actor_id === sourceActorId);
  const targetActorId = body.target_actor_id || targetFor(source?.actor_type || "mentor", cohort, body.targetCompanyId);
  const relationship = {
    relationship_id: uniqueRelationshipId(),
    relationship_type: body.relationship_type || relationshipTypeFor(source?.actor_type || "mentor"),
    source_actor_id: sourceActorId,
    target_actor_id: targetActorId,
    programme_id: cohort.programme_id,
    cohort_id: cohort.cohort_id,
    status: "active",
    ai_confidence_score: Number(body.ai_confidence_score || body.confidence_score || 0.82),
    human_approved: true,
    approved_by: "Demo Admin",
    created_at: new Date().toISOString(),
    start_date: cohort.start_date,
    end_date: cohort.end_date,
    outcome_score: null,
    outcome_notes: "",
    reuse_count: countPriorStrongRelationships(sourceActorId),
    explanation: body.explanation || body.reason || "Admin confirmed this AI-recommended relationship."
  };
  state.relationships.unshift(relationship);
  return relationship;
}

function getReuseCandidates(cohortId) {
  const cohort = state.cohorts.find((item) => item.cohort_id === cohortId);
  if (!cohort) return [];
  const candidates = new Map();
  for (const rel of state.relationships) {
    if (Number(rel.outcome_score || 0) < 4.4) continue;
    const historicalCohort = state.cohorts.find((item) => item.cohort_id === rel.cohort_id);
    if (!historicalCohort) continue;
    const similar = normalizeTerm(historicalCohort.industry_focus) === normalizeTerm(cohort.industry_focus)
      || overlapCount(historicalCohort.support_needs || [], cohort.support_needs || []) > 0
      || normalizeTerm(historicalCohort.country) === normalizeTerm(cohort.country);
    if (!similar) continue;
    const actor = state.actors.find((item) => item.actor_id === rel.source_actor_id);
    if (!actor) continue;
    const existing = candidates.get(actor.actor_id);
    const payload = {
      actor,
      relationship_id: rel.relationship_id,
      previous_cohort: historicalCohort.name,
      previous_outcome: rel.outcome_score,
      relationship_type: rel.relationship_type,
      reason: `${actor.name} worked in ${historicalCohort.name} with outcome ${rel.outcome_score}/5.`
    };
    if (!existing || Number(payload.previous_outcome) > Number(existing.previous_outcome)) {
      candidates.set(actor.actor_id, payload);
    }
  }
  return [...candidates.values()].slice(0, 6);
}

function hasConflict(actorId, cohort) {
  return state.relationships.some((rel) => {
    if (rel.source_actor_id !== actorId || rel.status !== "active") return false;
    if (rel.cohort_id === cohort.cohort_id) return false;
    return datesOverlap(rel.start_date, rel.end_date, cohort.start_date, cohort.end_date);
  });
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) <= new Date(bEnd) && new Date(bStart) <= new Date(aEnd);
}

function pickFirstCompanyForCohort(cohortId) {
  const assigned = state.relationships.find((rel) => rel.cohort_id === cohortId && rel.relationship_type === "ASSIGNED_TO");
  if (assigned) return assigned.source_actor_id;
  return state.actors.find((actor) => actor.actor_type === "company")?.actor_id;
}

function targetFor(actorType, cohort, targetCompanyId) {
  if (actorType === "partner") return cohort.programme_id;
  if (actorType === "company") return cohort.cohort_id;
  return targetCompanyId || pickFirstCompanyForCohort(cohort.cohort_id);
}

function relationshipTypeFor(actorType) {
  if (actorType === "partner") return "PARTNERED_WITH";
  if (actorType === "service_provider") return "PROVIDES_SERVICE_TO";
  if (actorType === "company") return "ASSIGNED_TO";
  return "MENTORS";
}

function countPriorStrongRelationships(actorId) {
  return state.relationships.filter((rel) => rel.source_actor_id === actorId && Number(rel.outcome_score || 0) >= 4.4).length;
}

function termsForActor(actor) {
  return normalizeTerms([
    actor.domain,
    actor.industry,
    actor.stage,
    ...(actor.skills || []),
    ...(actor.tags || []),
    ...(actor.stage_focus || []),
    ...(actor.needs || []),
    ...(actor.capabilities || []),
    ...(actor.service_categories || []),
    ...(actor.specializations || [])
  ]);
}

function inferTags(text) {
  const vocabulary = [
    "fintech", "payments", "fundraising", "go-to-market", "AI governance", "bank partnerships",
    "healthtech", "clinical validation", "regulatory strategy", "climate", "impact measurement",
    "grant strategy", "carbon markets", "logistics", "operations", "unit economics", "edtech",
    "partnerships", "analytics", "security", "compliance", "legal", "contracts"
  ];
  return vocabulary.filter((term) => text.includes(term.toLowerCase()));
}

function inferDomain(text) {
  if (text.includes("fintech") || text.includes("bank") || text.includes("payment")) return "fintech";
  if (text.includes("health") || text.includes("clinical")) return "healthtech";
  if (text.includes("climate") || text.includes("carbon")) return "climate tech";
  if (text.includes("logistics") || text.includes("supply")) return "logistics";
  if (text.includes("education") || text.includes("learning")) return "edtech";
  if (text.includes("legal")) return "legal";
  if (text.includes("compliance") || text.includes("security")) return "cloud compliance";
  return "startup ecosystem";
}

function inferCountry(text) {
  if (text.includes("singapore")) return "Singapore";
  if (text.includes("indonesia") || text.includes("jakarta")) return "Indonesia";
  if (text.includes("thailand")) return "Thailand";
  return "Malaysia";
}

function inferStages(text) {
  const stages = [];
  for (const stage of ["idea", "seed", "growth", "scale"]) {
    if (text.includes(stage)) stages.push(stage);
  }
  return stages.length ? stages : ["seed"];
}

function sampleLine(actorType) {
  if (actorType === "company") return "PayNusa Analytics, fintech, fundraising and AI governance, seed, Kuala Lumpur";
  if (actorType === "partner") return "BankHub Malaysia, fintech, bank pilot access and regulatory sandbox, Malaysia";
  if (actorType === "service_provider") return "Cloud Compliance Studio, cloud compliance, AI governance and PDPA readiness, Malaysia";
  return "Aisha Rahman, fintech, fundraising and go-to-market for seed startups, 4 hours/week, Kuala Lumpur";
}

function normalizeProfiles(profiles, actorType) {
  return profiles.map((profile) => ({
    actor_type: normalizeActorType(profile.actor_type || actorType),
    name: String(profile.name || "Unnamed Actor"),
    country: String(profile.country || "Malaysia"),
    city: String(profile.city || "Kuala Lumpur"),
    domain: String(profile.domain || "startup ecosystem"),
    skills: Array.isArray(profile.skills) ? profile.skills.map(String) : splitTerms(profile.skills || ""),
    stage_focus: Array.isArray(profile.stage_focus) ? profile.stage_focus.map(String) : splitTerms(profile.stage_focus || "seed"),
    availability: String(profile.availability || "unknown"),
    confidence_score: clamp(Number(profile.confidence_score || 0.75), 0, 1),
    missing_fields: Array.isArray(profile.missing_fields) ? profile.missing_fields.map(String) : [],
    tags: Array.isArray(profile.tags) ? profile.tags.map(String) : []
  }));
}

function normalizeActorType(value) {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized.includes("service")) return "service_provider";
  if (["mentor", "company", "partner", "service_provider"].includes(normalized)) return normalized;
  return "mentor";
}

function titleActorType(value) {
  return normalizeActorType(value).split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function splitTerms(value) {
  return String(value).split(/[;,|]/).map((term) => term.trim()).filter(Boolean);
}

function normalizeTerms(values) {
  return values.flatMap((value) => splitTerms(value)).map(normalizeTerm).filter(Boolean);
}

function normalizeTerm(value) {
  return String(value || "").toLowerCase().trim();
}

function overlapCount(left, right) {
  const l = new Set(normalizeTerms(left));
  return normalizeTerms(right).filter((term) => l.has(term)).length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50) || "item";
}

function uniqueActorId(base) {
  let candidate = base;
  let index = 2;
  while (state.actors.some((actor) => actor.actor_id === candidate)) {
    candidate = `${base}_${index++}`;
  }
  return candidate;
}

function uniqueCohortId(base) {
  let candidate = base;
  let index = 2;
  while (state.cohorts.some((cohort) => cohort.cohort_id === candidate)) {
    candidate = `${base}_${index++}`;
  }
  return candidate;
}

function uniqueRelationshipId() {
  return `rel_${String(state.relationships.length + 1).padStart(3, "0")}_${Date.now().toString(36)}`;
}

const requestedPort = Number(process.env.PORT || 5173);
listen(requestedPort);

function listen(port) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
      listen(port + 1);
      return;
    }
    throw error;
  });
  server.listen(port, () => {
    fs.writeFileSync(portPath, String(port));
    console.log(`EcoLink AI local demo running at http://localhost:${port}`);
  });
}

