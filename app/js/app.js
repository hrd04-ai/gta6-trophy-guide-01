// Leonida Platinum Road — boot, render, filters, tabs, roadmap, missables.
// Everything runs from local files; the only fetch is data/trophies.json.
import { loadEarned, saveEarned, exportFile, importFile } from './store.js';

const KIND_LABELS = {
  story: 'Story',
  mission: 'Story mission',
  side: 'Strangers & side',
  activity: 'Activity',
  collectible: 'Collectible',
  combat: 'Combat',
  completion: 'Completion',
  platinum: 'Platinum',
};

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1–4 and the final mission. The backbone of the list: 6 chapter and finale trophies plus the 6 named-mission trophies. Play straight through, and grab the one-moment trophies (Trust, Break the Bank, Hi-Jacked and the rest) while each mission is in front of you.' },
  { n: 2, title: 'Stage 2 — Strangers, side & activities', blurb: 'The 8 stranger strands (Andy, Kenton, Billy, Randy, Tyrone and three more), the activity sampler, fishing with Cal, bowling, the arcade, and the partner trophies. This is where the list opens up — do it before the collectible grind, while the map still feels new.' },
  { n: 3, title: 'Stage 3 — Explore & collect', blurb: 'All 52 areas of Leonida, 18 meditation spots, 100 WAiNK locations, card sets, 100 vehicles, 8 garages, drone races at all 14 spots and 20 race wins. One long exploration sweep covers most of it — plan a route region by region instead of criss-crossing the map.' },
  { n: 4, title: 'Stage 4 — The grinds', blurb: '250 stunts, gold in all 42 Shooting Range challenges, 50 challenges, 500 choices, $250,000 laundered and $100,000 spent. Long but honest work — put on a podcast, chip away, and let the counters do the talking.' },
  { n: 5, title: 'Stage 5 — Platinum', blurb: '100% completion for the gold, and the platinum lands with it. The last few percent are almost always one collectible set or one challenge count — filter this page to “Remaining only” and finish what is left.' },
];

const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const DEMO_EARNED = [2, 3, 4, 8, 16, 20, 21, 22, 28, 33, 44, 46, 55];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
let earned = loadEarned();
if (DEMO) earned = new Set(DEMO_EARNED);

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const searchEl = $('search');
const kindEl = $('kindFilter');
const gradeEl = $('gradeFilter');
const missableEl = $('missableOnly');
const remainingEl = $('remainingOnly');
const spoilerEl = $('spoilerToggle');

function save() {
  if (!DEMO) saveEarned(earned);
}

function gradeCounts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] += 1;
  return counts;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  $('earnedCount').textContent = done;
  $('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
  const c = gradeCounts();
  $('gradeBreakdown').textContent =
    `Platinum ${c.platinum}/1 · Gold ${c.gold}/2 · Silver ${c.silver}/6 · Bronze ${c.bronze}/46`;
  $('platinumNote').textContent = done === total
    ? 'Leonida Legend — the platinum is yours.'
    : done >= total - 1
      ? 'One trophy left. The platinum is next.'
      : `${total - done} to go until the platinum.`;
  const next = trophies
    .filter((t) => !earned.has(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id)[0];
  $('nextUp').textContent = next ? `Next up: ${next.name} (Stage ${next.stage})` : 'All 55 earned.';
}

function spoilerHides(t) {
  return spoilerEl.checked && !earned.has(t.id) && (t.kind === 'story' || t.kind === 'mission');
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderAll();
  });
  const body = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('span');
  name.className = 'trophy-name' + (earned.has(t.id) ? ' earned' : '');
  name.textContent = spoilerHides(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
  const grade = document.createElement('span');
  grade.className = `badge ${t.grade}`;
  grade.textContent = t.grade;
  head.append(name, grade);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
  head.append(kind);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'Missable';
    head.append(m);
  }
  body.append(head);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = spoilerHides(t)
    ? 'Spoilers hidden. Tick the box once you have earned it in the game.'
    : `“${t.description}”`;
  body.append(desc);
  if (t.target && !spoilerHides(t)) {
    const target = document.createElement('p');
    target.className = 'trophy-target';
    target.textContent = `PSN tracks this to ${t.target.toLocaleString('en-US')}.`;
    body.append(target);
  }
  if (!spoilerHides(t)) {
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    const label = document.createElement('strong');
    label.textContent = 'Guide: ';
    guide.append(label, document.createTextNode(t.guide));
    body.append(guide);
    const sources = document.createElement('p');
    sources.className = 'trophy-sources';
    sources.textContent = `Sources: ${t.sources.join(' · ')}`;
    body.append(sources);
  }
  li.append(box, body);
  return li;
}

function filteredTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (missableEl.checked && !t.missable) return false;
    if (remainingEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderList() {
  const shown = filteredTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  $('resultCount').textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  $('emptyState').hidden = shown.length !== 0;
}

function renderRoadmap() {
  const stageEl = $('roadmapStages');
  stageEl.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n);
    const done = members.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    li.className = 'stage' + (done === members.length ? ' done' : '');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done}/${members.length} earned`;
    h.append(count);
    const p = document.createElement('p');
    p.textContent = stage.blurb;
    const ul = document.createElement('ul');
    for (const t of members) {
      const item = document.createElement('li');
      if (earned.has(t.id)) item.className = 'earned';
      item.textContent = `${t.name} — ${t.grade}${t.missable ? ' · missable' : ''}`;
      ul.append(item);
    }
    li.append(h, p, ul);
    stageEl.append(li);
  }
}

function renderMissables() {
  const miss = trophies.filter((t) => t.missable);
  $('missableList').replaceChildren(...miss.map(trophyCard));
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
}

function switchView(view) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${view}`);
  }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
}
for (const el of [searchEl, kindEl, gradeEl, missableEl, remainingEl, spoilerEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}
spoilerEl.addEventListener('change', renderAll);

$('exportBtn').addEventListener('click', () => exportFile(earned));
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importFile(file);
    save();
    renderAll();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all 55 ticks? This cannot be undone.')) return;
  earned = new Set();
  save();
  renderAll();
});

if (params.get('view') === 'roadmap' || params.get('view') === 'missables' || params.get('view') === 'about') {
  switchView(params.get('view'));
}
if (params.get('spoilers') === 'on') {
  spoilerEl.checked = true;
}
// Deep links for screenshots and sharing: preselect the kind/grade filters.
if (params.get('kind') && [...kindEl.options].some((o) => o.value === params.get('kind'))) {
  kindEl.value = params.get('kind');
}
if (params.get('grade') && [...gradeEl.options].some((o) => o.value === params.get('grade'))) {
  gradeEl.value = params.get('grade');
}

renderAll();
