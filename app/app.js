// Leonida Platinum — GTA 6 trophy tracker.
// Loads app/data/trophies.json, renders the checklist, roadmap and missables,
// and saves progress in localStorage. No network at run time beyond its own files.

const STORE_KEY = "leonida-platinum-v1";
const DATA_URL = "data/trophies.json";

const STAGES = [
  { n: 1, title: "Story first", body: "Play the story in order: the opening mission, Chapters 1–4, the named missions and the finale. This unlocks the map, the characters and the activities the later stages need — and earns the chapter, mission and finale trophies on the way." },
  { n: 2, title: "Side strands & one-off moments", body: "Finish the character strands (Andy, Kenton, Billy, Randy, Tyrone, Bret) and the 8 stranger strands, then clear the missable trophies while partners and story moments are still available: the partner robberies, the airport departure, the showroom smash, the Ocean Beach cocktail and the stealth jewelry job." },
  { n: 3, title: "Collectibles & exploring", body: "Cover Leonida: all 52 areas, 100 vehicles discovered (10 registered to Scooter Bros), all 8 garages bought, 18 meditation spots, 3 card sets finished and WAiNK It at 100 locations." },
  { n: 4, title: "Activities, combat & money", body: "The long counts: 250 stunts, 42 gold Shooting Range medals, 14 drone-race wins, 20 different race wins, 50 challenges, 5 bank vaults, one armored truck, one illegal operation per gang, 5 enemies in one Combat Focus, $250,000 laundered and $100,000 spent." },
  { n: 5, title: "Cleanup & the platinum", body: "Sweep what is left — 100% completion for the gold, then the platinum pops on its own. Check the game's stats screen for the last few percent; the official description does not list the 100% checklist." },
];

const $ = (id) => document.getElementById(id);
const els = {
  list: $("trophyList"), missableList: $("missableList"), detail: $("detailPane"),
  earnedCount: $("earnedCount"), fill: $("progressFill"), pct: $("progressPct"),
  search: $("search"), kind: $("kindFilter"), grade: $("gradeFilter"),
  earnedOnly: $("earnedOnly"), missableOnly: $("missableOnly"), spoiler: $("spoilerToggle"),
  empty: $("emptyMsg"), hint: $("listHint"), stages: $("roadmapStages"),
  missableCount: $("missableCount"),
};

let trophies = [];
let state = loadState();
let selectedId = null;
let view = "checklist";

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: {}, spoilers: false };
    const parsed = JSON.parse(raw);
    return { earned: parsed.earned || {}, spoilers: !!parsed.spoilers };
  } catch (e) {
    return { earned: {}, spoilers: false };
  }
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
}

function isEarned(t) { return !!state.earned[t.id]; }
function toggleEarned(t) {
  if (isEarned(t)) delete state.earned[t.id];
  else state.earned[t.id] = true;
  saveState();
  renderAll();
}

function spoilerHidden(t) {
  return !state.spoilers && t.kind === "story" && !isEarned(t);
}

function gradeLabel(t) { return t.grade.charAt(0).toUpperCase() + t.grade.slice(1); }

function trophyRow(t) {
  const li = document.createElement("li");
  li.className = "trophy" + (isEarned(t) ? " earned" : "") + (selectedId === t.id ? " selected" : "") + (spoilerHidden(t) ? " spoiled" : "");
  li.dataset.id = String(t.id);

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = isEarned(t);
  box.setAttribute("aria-label", "Earned: " + t.name);
  box.addEventListener("click", (ev) => { ev.stopPropagation(); toggleEarned(t); });
  li.appendChild(box);

  const body = document.createElement("div");
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = spoilerHidden(t) ? "Hidden story trophy" : t.name;
  body.appendChild(name);
  const desc = document.createElement("div");
  desc.className = "desc";
  desc.textContent = spoilerHidden(t) ? "Earn it to reveal its name and description." : t.description;
  body.appendChild(desc);
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.appendChild(tag("grade-" + t.grade, gradeLabel(t)));
  if (t.kind !== t.grade) meta.appendChild(tag("", t.kind));
  if (t.count) meta.appendChild(tag("", "Target: " + t.count.toLocaleString("en-US")));
  if (t.missable) meta.appendChild(tag("missable", "Missable"));
  if (t.hidden) meta.appendChild(tag("hidden-flag", "Hidden on PSN"));
  body.appendChild(meta);
  li.appendChild(body);

  const status = document.createElement("span");
  status.className = isEarned(t) ? "done" : "todo";
  status.textContent = isEarned(t) ? "✓ Earned" : "Not earned";
  li.appendChild(status);

  li.addEventListener("click", () => { selectedId = t.id; renderAll(); });
  return li;
}

function tag(cls, text) {
  const s = document.createElement("span");
  s.className = "tag " + cls;
  s.textContent = text;
  return s;
}

function visibleTrophies() {
  const q = els.search.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (els.kind.value && t.kind !== els.kind.value) return false;
    if (els.grade.value && t.grade !== els.grade.value) return false;
    if (els.earnedOnly.checked && !isEarned(t)) return false;
    if (els.missableOnly.checked && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList() {
  els.list.replaceChildren();
  const rows = visibleTrophies();
  rows.forEach((t) => els.list.appendChild(trophyRow(t)));
  els.empty.hidden = rows.length > 0;
  els.hint.textContent = rows.length + " of 55 trophies shown. Tick a trophy when you earn it — progress is saved in this browser automatically.";
}

function renderMissables() {
  els.missableList.replaceChildren();
  trophies.filter((t) => t.missable).forEach((t) => els.missableList.appendChild(trophyRow(t)));
}

function renderRoadmap() {
  els.stages.replaceChildren();
  STAGES.forEach((s) => {
    const mine = trophies.filter((t) => t.stage === s.n);
    const done = mine.filter(isEarned).length;
    const li = document.createElement("li");
    const h = document.createElement("h3");
    h.textContent = s.title;
    li.appendChild(h);
    const p = document.createElement("p");
    p.textContent = s.body;
    li.appendChild(p);
    const c = document.createElement("span");
    c.className = "count";
    c.textContent = done + " / " + mine.length + " trophies in this stage";
    li.appendChild(c);
    els.stages.appendChild(li);
  });
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  els.detail.replaceChildren();
  if (!t) {
    const p = document.createElement("p");
    p.className = "detail-empty";
    p.textContent = "Select a trophy to read its guide, its sources and when it can be missed.";
    els.detail.appendChild(p);
    return;
  }
  const h = document.createElement("h2");
  h.textContent = spoilerHidden(t) ? "Hidden story trophy" : t.name;
  els.detail.appendChild(h);
  const flags = document.createElement("div");
  flags.className = "flag-row";
  flags.appendChild(tag("grade-" + t.grade, gradeLabel(t)));
  flags.appendChild(tag("", t.kind));
  if (t.missable) flags.appendChild(tag("missable", "Missable — do it before the finale"));
  if (t.hidden) flags.appendChild(tag("hidden-flag", "Hidden on PSN until earned"));
  els.detail.appendChild(flags);
  const off = document.createElement("p");
  off.className = "official";
  off.textContent = "Official: “" + t.description + "”";
  els.detail.appendChild(off);
  const gh = document.createElement("h3");
  gh.textContent = "Guide";
  els.detail.appendChild(gh);
  const g = document.createElement("p");
  g.className = "guide";
  g.textContent = t.guide;
  els.detail.appendChild(g);
  if (t.count) {
    const cp = document.createElement("p");
    cp.textContent = "PSN progress target: " + t.count.toLocaleString("en-US") + ".";
    els.detail.appendChild(cp);
  }
  const sh = document.createElement("h3");
  sh.textContent = "Sources";
  els.detail.appendChild(sh);
  const s = document.createElement("p");
  s.className = "sources";
  s.textContent = t.sources;
  els.detail.appendChild(s);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = isEarned(t) ? "Mark as not earned" : "Mark as earned";
  btn.addEventListener("click", () => toggleEarned(t));
  els.detail.appendChild(btn);
}

function renderProgress() {
  const done = trophies.filter(isEarned).length;
  const total = trophies.length || 55;
  els.earnedCount.textContent = String(done);
  els.fill.style.width = Math.round((done / total) * 100) + "%";
  els.pct.textContent = Math.round((done / total) * 100) + "% to the platinum";
  els.missableCount.textContent = String(trophies.filter((t) => t.missable).length);
}

function showView(name) {
  view = name;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $("viewChecklist").hidden = name !== "checklist";
  $("viewRoadmap").hidden = name !== "roadmap";
  $("viewMissables").hidden = name !== "missables";
}

function renderAll() {
  renderList();
  renderMissables();
  renderRoadmap();
  renderDetail();
  renderProgress();
}

function exportProgress() {
  const payload = { app: "leonida-platinum", exportedAt: new Date().toISOString(), earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophies-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : (Array.isArray(data) ? data : []);
      const next = {};
      ids.forEach((id) => { if (trophies.some((t) => t.id === Number(id))) next[Number(id)] = true; });
      state.earned = next;
      saveState();
      renderAll();
    } catch (e) {
      alert("That file is not a progress export from this tracker.");
    }
  };
  reader.readAsText(file);
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const seed = Number(params.get("seed"));
  if (seed > 0) {
    trophies.slice(0, Math.min(seed, trophies.length)).forEach((t) => { state.earned[t.id] = true; });
  }
  const open = Number(params.get("open"));
  if (open && trophies.some((t) => t.id === open)) selectedId = open;
  const v = params.get("view");
  if (v === "roadmap" || v === "missables" || v === "checklist") showView(v);
}

async function boot() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies;
  els.spoiler.checked = state.spoilers;
  applyUrlParams();
  renderAll();

  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
  [els.search, els.kind, els.grade, els.earnedOnly, els.missableOnly].forEach((el) => el.addEventListener("input", renderList));
  els.spoiler.addEventListener("change", () => { state.spoilers = els.spoiler.checked; saveState(); renderAll(); });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (ev) => { if (ev.target.files[0]) importProgress(ev.target.files[0]); ev.target.value = ""; });
  $("resetBtn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies? This cannot be undone — export first if you want a backup.")) {
      state.earned = {};
      selectedId = null;
      saveState();
      renderAll();
    }
  });
}

boot();
