/* Leonida Platinum — offline GTA 6 trophy tracker.
   Loads app/data/trophies.json (same folder, no network), keeps progress in
   localStorage, and renders the checklist, the platinum roadmap and the
   missable list. No request ever leaves the browser. */

var STORAGE_KEY = "leonida-platinum-v1";
var DATA_URL = "data/trophies.json";
var DEMO_EARNED = [2, 3, 8, 16, 20, 21, 28, 35, 42, 44, 46, 53, 15];

var trophies = [];
var earned = {};
var spoilerOn = false;
var kindFilter = "all";
var gradeFilter = "all";
var statusFilter = "all";
var searchText = "";
var currentView = "checklist";
var selectedId = null;

var STAGES = [
  { n: 1, title: "Stage 1 — Play the story", text: "Chapters 1 to 4 and every named story mission, in order. Finish each mission trophy as the story offers it, and keep a separate save before the final mission." },
  { n: 2, title: "Stage 2 — Side stories", text: "The five character finales, the stranger strands and the one-off world moments. Clear these before the story finale so nothing is left behind." },
  { n: 3, title: "Stage 3 — Activities, races and combat", text: "Shooting Range golds, races, stunts, challenges and the robbery trophies. Grind these while you still enjoy driving around Leonida." },
  { n: 4, title: "Stage 4 — Collectibles and cleanup", text: "Cards, WAiNK spots, vehicles, areas, garages and the money trophies, then 100% completion and the platinum." }
];

function $(id) { return document.getElementById(id); }

function loadProgress() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) earned = JSON.parse(raw) || {};
  } catch (e) { earned = {}; }
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earned)); } catch (e) { /* storage full or blocked; progress stays in memory */ }
}

function readUrlParams() {
  var q = new URLSearchParams(window.location.search);
  var view = q.get("view");
  if (view === "roadmap" || view === "missables" || view === "checklist") currentView = view;
  var open = parseInt(q.get("open") || "", 10);
  if (open) selectedId = open;
  if (q.get("spoiler") === "1") spoilerOn = true;
  if (q.get("demo") === "1") {
    DEMO_EARNED.forEach(function (id) { earned[id] = true; });
    saveProgress();
  }
}

function trophyById(id) {
  for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
  return null;
}

function isEarned(t) { return !!earned[t.id]; }

function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

function kindLabel(k) {
  var labels = { story: "Story", side: "Side story", collectible: "Collectible", activity: "Activity", combat: "Combat", exploration: "Exploration", misc: "World" };
  return labels[k] || k;
}

function spoilerHides(t) {
  return spoilerOn && t.kind === "story" && !isEarned(t);
}

function visibleName(t) {
  return spoilerHides(t) ? "Hidden story trophy — earn it to reveal" : t.name;
}

function visibleDescription(t) {
  return spoilerHides(t) ? "Spoiler hidden. Turn the spoiler setting off, or earn this trophy, to see its official description." : t.description;
}

function matchesFilters(t) {
  if (kindFilter === "missable") { if (!t.missable) return false; }
  else if (kindFilter !== "all" && t.kind !== kindFilter) return false;
  if (gradeFilter !== "all" && t.grade !== gradeFilter) return false;
  if (statusFilter === "earned" && !isEarned(t)) return false;
  if (statusFilter === "remaining" && isEarned(t)) return false;
  if (searchText) {
    var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    if (hay.indexOf(searchText) === -1) return false;
  }
  return true;
}

function renderProgress() {
  var total = trophies.length;
  var count = trophies.filter(isEarned).length;
  $("earnedCount").textContent = count;
  $("progressFill").style.width = total ? Math.round(count / total * 100) + "%" : "0%";
  $("progressLabel").textContent = (total ? Math.round(count / total * 100) : 0) + "% to the platinum";
  var grades = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  trophies.forEach(function (t) {
    grades[t.grade][1]++;
    if (isEarned(t)) grades[t.grade][0]++;
  });
  $("gradeLine").textContent = "Platinum " + grades.platinum[0] + "/" + grades.platinum[1] +
    " · Gold " + grades.gold[0] + "/" + grades.gold[1] +
    " · Silver " + grades.silver[0] + "/" + grades.silver[1] +
    " · Bronze " + grades.bronze[0] + "/" + grades.bronze[1];
}

function trophyCard(t) {
  var card = document.createElement("article");
  card.className = "trophy-card" + (isEarned(t) ? " earned" : "") + (selectedId === t.id ? " selected" : "");
  card.tabIndex = 0;

  var check = document.createElement("button");
  check.type = "button";
  check.className = "trophy-check";
  check.textContent = "✓";
  check.setAttribute("aria-label", (isEarned(t) ? "Mark not earned: " : "Mark earned: ") + t.name);
  check.addEventListener("click", function (ev) { ev.stopPropagation(); toggleEarned(t.id); });
  card.appendChild(check);

  var body = document.createElement("div");
  body.className = "trophy-body";
  var name = document.createElement("p");
  name.className = "trophy-name";
  name.textContent = visibleName(t);
  body.appendChild(name);
  var desc = document.createElement("p");
  desc.className = "trophy-desc";
  desc.textContent = visibleDescription(t);
  body.appendChild(desc);

  var tags = document.createElement("div");
  tags.className = "trophy-tags";
  tags.appendChild(tag("grade-" + t.grade, gradeLabel(t.grade)));
  tags.appendChild(tag("", kindLabel(t.kind)));
  if (t.missable) tags.appendChild(tag("missable", "⚠ Missable"));
  if (t.target) tags.appendChild(tag("", "Target: " + t.target.toLocaleString()));
  if (spoilerHides(t)) tags.appendChild(tag("spoiler-hidden", "Spoiler hidden"));
  body.appendChild(tags);
  card.appendChild(body);

  card.addEventListener("click", function () { selectTrophy(t.id); });
  card.addEventListener("keydown", function (ev) { if (ev.key === "Enter") selectTrophy(t.id); });
  return card;
}

function tag(cls, text) {
  var el = document.createElement("span");
  el.className = "tag " + cls;
  el.textContent = text;
  return el;
}

function renderChecklist() {
  var root = $("viewRoot");
  root.innerHTML = "";
  var list = trophies.filter(matchesFilters);
  var earnedHere = list.filter(isEarned).length;
  $("listMeta").textContent = list.length + " trophies shown (" + earnedHere + " earned)" +
    (spoilerOn ? " — spoiler setting on: unearned story trophies are hidden." : "");
  if (!list.length) {
    var empty = document.createElement("p");
    empty.textContent = "No trophies match these filters. Clear the search or pick another filter.";
    root.appendChild(empty);
    return;
  }
  list.forEach(function (t) { root.appendChild(trophyCard(t)); });
}

function renderRoadmap() {
  var root = $("viewRoot");
  root.innerHTML = "";
  $("listMeta").textContent = "Four stages, in the order to play them. A stage is done when every trophy in it is earned.";
  STAGES.forEach(function (stage) {
    var members = trophies.filter(function (t) { return t.stage === stage.n; });
    var done = members.filter(isEarned).length;
    var box = document.createElement("section");
    box.className = "roadmap-stage";
    var h = document.createElement("h2");
    h.textContent = stage.title;
    box.appendChild(h);
    var p = document.createElement("p");
    p.textContent = stage.text;
    box.appendChild(p);
    var count = document.createElement("p");
    count.innerHTML = "";
    var strong = document.createElement("span");
    strong.className = "stage-count";
    strong.textContent = done + " / " + members.length + " earned";
    count.appendChild(strong);
    box.appendChild(count);
    members.forEach(function (t) { box.appendChild(trophyCard(t)); });
    root.appendChild(box);
  });
}

function renderMissables() {
  var root = $("viewRoot");
  root.innerHTML = "";
  var list = trophies.filter(function (t) { return t.missable; });
  var done = list.filter(isEarned).length;
  $("listMeta").textContent = list.length + " missable trophies flagged (" + done + " earned).";
  var note = document.createElement("div");
  note.className = "missable-note";
  var p = document.createElement("p");
  p.innerHTML = "<span class='warn-banner'>How to read this list:</span> a trophy is flagged missable when its official description ties it to one named story mission, a character finale, or a single-attempt moment. The game may let you retry missions from a replay menu — check it before you pass the moment. Keep a separate save before each flagged mission.";
  note.appendChild(p);
  root.appendChild(note);
  list.forEach(function (t) { root.appendChild(trophyCard(t)); });
}

function renderDetail() {
  var pane = $("detailPane");
  pane.innerHTML = "";
  var t = selectedId ? trophyById(selectedId) : null;
  if (!t) {
    var empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = "Select a trophy to read its guide and sources.";
    pane.appendChild(empty);
    return;
  }
  var h = document.createElement("h2");
  h.textContent = spoilerHides(t) ? "Hidden story trophy" : t.name;
  pane.appendChild(h);
  var off = document.createElement("p");
  off.className = "official";
  off.textContent = "Official: “" + visibleDescription(t) + "” — " + gradeLabel(t.grade);
  pane.appendChild(off);
  var guideH = document.createElement("h3");
  guideH.textContent = "Guide";
  pane.appendChild(guideH);
  var guide = document.createElement("p");
  guide.textContent = spoilerHides(t) ? "Spoilers are hidden for this story trophy. Turn the spoiler setting off to read its guide." : t.guide;
  pane.appendChild(guide);
  var srcH = document.createElement("h3");
  srcH.textContent = "Sources";
  pane.appendChild(srcH);
  var ul = document.createElement("ul");
  (t.sources || []).forEach(function (s) {
    var li = document.createElement("li");
    li.textContent = s;
    ul.appendChild(li);
  });
  pane.appendChild(ul);
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "earn-btn" + (isEarned(t) ? " earned" : "");
  btn.textContent = isEarned(t) ? "✓ Earned — click to undo" : "Mark as earned";
  btn.addEventListener("click", function () { toggleEarned(t.id); });
  pane.appendChild(btn);
}

function renderAll() {
  renderProgress();
  if (currentView === "roadmap") renderRoadmap();
  else if (currentView === "missables") renderMissables();
  else renderChecklist();
  renderDetail();
  document.querySelectorAll("#tabs .tab").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === currentView);
  });
  document.querySelectorAll("#kindFilters .chip").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-kind") === kindFilter);
  });
}

function selectTrophy(id) {
  selectedId = id;
  renderAll();
  var pane = $("detailPane");
  if (pane && window.innerWidth < 900) pane.scrollIntoView({ behavior: "smooth" });
}

function toggleEarned(id) {
  if (earned[id]) delete earned[id];
  else earned[id] = true;
  saveProgress();
  renderAll();
}

function exportProgress() {
  var data = { app: "leonida-platinum", exportedAt: new Date().toISOString(), earned: Object.keys(earned).map(Number) };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

function importProgress(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      var ids = data.earned || data;
      var next = {};
      ids.forEach(function (id) { if (trophyById(Number(id))) next[Number(id)] = true; });
      earned = next;
      saveProgress();
      renderAll();
      alert("Progress imported: " + Object.keys(earned).length + " trophies earned.");
    } catch (e) {
      alert("That file could not be read as trophy progress. Export from this guide first, then import that file.");
    }
  };
  reader.readAsText(file);
}

function bindControls() {
  $("searchBox").addEventListener("input", function (ev) { searchText = ev.target.value.trim().toLowerCase(); renderAll(); });
  $("kindFilters").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-kind]");
    if (!b) return;
    kindFilter = b.getAttribute("data-kind");
    renderAll();
  });
  $("gradeFilter").addEventListener("change", function (ev) { gradeFilter = ev.target.value; renderAll(); });
  $("statusFilter").addEventListener("change", function (ev) { statusFilter = ev.target.value; renderAll(); });
  $("spoilerToggle").addEventListener("change", function (ev) { spoilerOn = ev.target.checked; renderAll(); });
  $("tabs").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-view]");
    if (!b) return;
    currentView = b.getAttribute("data-view");
    renderAll();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importFile").addEventListener("change", function (ev) {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = "";
  });
  $("resetBtn").addEventListener("click", function () {
    if (window.confirm("Clear all earned trophies in this browser?")) {
      earned = {};
      saveProgress();
      renderAll();
    }
  });
}

function boot() {
  loadProgress();
  readUrlParams();
  $("spoilerToggle").checked = spoilerOn;
  bindControls();
  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      trophies = data.trophies || data;
      renderAll();
    })
    .catch(function () {
      $("listMeta").textContent = "Could not load app/data/trophies.json. Serve the app/ folder with a static server and reload.";
    });
}

document.addEventListener("DOMContentLoaded", boot);
