"use strict";
const scriptURL = new URL(document.currentScript.src);
const BASE = new URL("../", scriptURL).pathname;
const url = (route = "") => BASE + route + (route ? "/" : "");
const routes = [
  ["", "Home", "↗"],
  ["explorer", "Seer Explorer", "⌕"],
  ["deep", "Deep", "▦"],
  ["futarchy", "Futarchy", "⑂"],
  ["opportunity", "Opportunity", "◇"],
  ["risk", "Risk Pricing", "◉"],
];
const route = location.pathname.slice(BASE.length).split("/")[0] || "";
const app = document.querySelector("#app"),
  modal = document.querySelector("#modal");
const getStore = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem("seer-signal-" + key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem("seer-signal-" + key, JSON.stringify(value));
  } catch {}
};
const state = {
  filter: "All markets",
  query: "",
  sort: "volume",
  watch: getStore("watch", []),
  shortlist: getStore("shortlist", []),
  opFilter: "All submissions",
  deepQuery: "",
  deepSort: "score",
  deepFilter: "All candidates",
  homeLens: "explorer",
  estimates: getStore("draft-forecasts", {}),
  invalidEstimates: {},
  proposal: 0,
  compare: [],
  riskCategory: "All protocols",
  riskQuery: "",
  riskSort: "risk",
  positions: getStore("positions", []),
  tradeChoice: "Yes",
  tradeId: null,
};
document.documentElement.dataset.theme = getStore("theme", "dark");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const number = (n) => new Intl.NumberFormat("en-US").format(n);
const arrow = "↗";
const markets = [
  {
    id: "m1",
    name: "Will the Atlas network upgrade ship before December?",
    type: "Binary",
    group: "Technology",
    outcome: "Yes",
    price: 68,
    change: 4.2,
    volume: 142800,
    liquidity: 38400,
    close: "30 Nov 2026",
    desc: "Resolves Yes if the fictional Atlas network publishes its stable network upgrade before 1 December 2026, 00:00 UTC. Otherwise resolves No.",
    spark: [30, 35, 33, 47, 44, 49, 42, 59, 56, 63, 59, 68],
  },
  {
    id: "m2",
    name: "Which research track will receive the largest grant?",
    type: "Categorical",
    group: "Public goods",
    outcome: "Open tooling",
    price: 42,
    change: 2.6,
    volume: 97400,
    liquidity: 24100,
    close: "14 Dec 2026",
    desc: "One research track is selected by the fictional public-goods review panel. The outcome with the greatest final funding allocation resolves to 1; all others resolve to 0.",
    spark: [38, 32, 35, 34, 40, 36, 38, 39, 42, 40, 41, 42],
  },
  {
    id: "m3",
    name: "Retained contributors if the fellowship passes",
    type: "Conditional",
    group: "Governance",
    outcome: "Contributors",
    price: 140,
    change: 0,
    volume: 86200,
    liquidity: 18600,
    close: "31 Jan 2027",
    desc: "Forecast of retained contributors after 90 days, conditional on the fellowship proposal passing. The alternative branch forecasts the same measure if it does not pass.",
    spark: [112, 116, 114, 120, 124, 123, 128, 130, 128, 136, 134, 140],
  },
  {
    id: "m4",
    name: "How many teams will launch on Atlas this quarter?",
    type: "Scalar",
    group: "Ecosystem",
    outcome: "Teams",
    price: 124,
    change: 0,
    volume: 72800,
    liquidity: 19400,
    close: "31 Dec 2026",
    desc: "Number of unique teams with a verified production launch in the fictional Atlas registry by 31 December 2026. Scalar range: 0–200 teams.",
    spark: [80, 87, 91, 89, 95, 100, 98, 107, 111, 108, 118, 124],
  },
  {
    id: "m5",
    name: "Which community tools will the panel select?",
    type: "Multi-select",
    group: "Opportunity",
    outcome: "Common Ground",
    price: 38,
    change: 1.8,
    volume: 56400,
    liquidity: 15800,
    close: "18 Dec 2026",
    desc: "The panel can select multiple tools. Each submission has an independent Yes/No market; probabilities do not need to sum to 100%.",
    spark: [25, 28, 26, 29, 32, 30, 34, 32, 36, 35, 39, 38],
  },
  {
    id: "m6",
    name: "Expected evaluator score: Open Index",
    type: "Scalar",
    group: "Deep",
    outcome: "Score / 100",
    price: 86,
    change: 0,
    volume: 43800,
    liquidity: 12800,
    close: "15 Dec 2026",
    desc: "Mean score awarded to Open Index by the fictional research review panel, from 0 to 100, using the published rubric.",
    spark: [69, 70, 74, 72, 76, 78, 77, 81, 83, 81, 84, 86],
  },
  {
    id: "m7",
    name: "Annual default estimate for Meridian",
    type: "Scalar",
    group: "Risk",
    outcome: "Annual PD",
    price: 1.8,
    change: 0,
    volume: 31200,
    liquidity: 9400,
    close: "31 Dec 2026",
    desc: "Market forecast of the annualized probability of default assigned by the fictional risk panel. It is a forecast of a risk estimate, not a guarantee of safety.",
    spark: [2.6, 2.4, 2.5, 2.3, 2.2, 2.1, 2.2, 2, 1.9, 2, 1.8, 1.8],
  },
  {
    id: "m8",
    name: "Will the open science archive reach 10,000 records?",
    type: "Binary",
    group: "Science",
    outcome: "Yes",
    price: 74,
    change: -1.3,
    volume: 28600,
    liquidity: 8100,
    close: "31 Dec 2026",
    desc: "Resolves Yes if the fictional Open Science Archive lists at least 10,000 validated records at quarter end. Otherwise resolves No.",
    spark: [80, 78, 79, 77, 79, 76, 78, 75, 76, 73, 75, 74],
  },
];
const grants = [
  [
    "g1",
    "Open Index",
    "Searchable public research",
    "Infrastructure",
    86,
    12800,
  ],
  [
    "g2",
    "Common Ground",
    "Community coordination tools",
    "Coordination",
    81,
    11200,
  ],
  ["g3", "Field Notes", "Open science field records", "Research", 77, 9800],
  [
    "g4",
    "Proof Library",
    "Reusable verification methods",
    "Infrastructure",
    74,
    8700,
  ],
  [
    "g5",
    "Local Signals",
    "Community-led data collection",
    "Research",
    69,
    7600,
  ],
  ["g6", "Mesh Works", "Peer-to-peer collaboration", "Coordination", 65, 6100],
  [
    "g7",
    "Clear Ledger",
    "Transparent grant reporting",
    "Infrastructure",
    62,
    5800,
  ],
  ["g8", "Seed Network", "Researcher mentorship", "Coordination", 58, 4900],
  [
    "g9",
    "Archive Atlas",
    "Long-term research preservation",
    "Research",
    54,
    4200,
  ],
  ["g10", "Open Bench", "Shared evaluation tools", "Infrastructure", 51, 3600],
  [
    "g11",
    "Common Canvas",
    "Participatory research design",
    "Research",
    47,
    2800,
  ],
  [
    "g12",
    "Bridge Lab",
    "Cross-community translation",
    "Coordination",
    43,
    2100,
  ],
].map(([id, name, desc, category, score, liq]) => ({
  id,
  name,
  desc,
  category,
  score,
  liq,
}));
const proposals = [
  {
    id: "AGP-042",
    title: "Launch a contributor fellowship",
    desc: "Fund a 12-week fellowship for 24 contributors, with mentor support and open deliverables.",
    pass: 140,
    fail: 118,
    liquidity: 18600,
    volume: 86200,
    passData: [113, 116, 118, 120, 124, 123, 128, 127, 131, 135, 136, 140],
    failData: [110, 113, 112, 114, 113, 116, 115, 117, 116, 118, 117, 118],
  },
  {
    id: "AGP-043",
    title: "Expand developer documentation",
    desc: "Create task-based documentation and fund six community-maintained learning paths.",
    pass: 132,
    fail: 120,
    liquidity: 12400,
    volume: 53700,
    passData: [113, 115, 119, 117, 121, 123, 120, 124, 126, 128, 130, 132],
    failData: [110, 113, 115, 113, 114, 116, 115, 118, 116, 119, 119, 120],
  },
  {
    id: "AGP-044",
    title: "Sponsor a regional builder tour",
    desc: "Run eight in-person builder workshops with follow-up support for project teams.",
    pass: 122,
    fail: 124,
    liquidity: 3800,
    volume: 19800,
    passData: [114, 120, 118, 123, 119, 125, 120, 124, 121, 124, 120, 122],
    failData: [111, 116, 118, 117, 120, 122, 120, 122, 125, 122, 123, 124],
  },
];
const submissions = [
  {
    id: "o1",
    name: "Common Ground",
    by: "Studio North",
    desc: "A shared workspace for local communities to coordinate open projects.",
    price: 38,
    liq: 15800,
    art: "common",
    sub: "GROUND",
    type: "Coordination",
  },
  {
    id: "o2",
    name: "Field Notes",
    by: "Field Collective",
    desc: "Small, open tools that make field research useful to everyone.",
    price: 31,
    liq: 12400,
    art: "field notes",
    sub: "OBSERVE / SHARE",
    type: "Research",
  },
  {
    id: "o3",
    name: "Open Index",
    by: "Index Works",
    desc: "A searchable map of research, connected to the people behind it.",
    price: 24,
    liq: 9800,
    art: "open index",
    sub: "KNOWLEDGE, CONNECTED",
    type: "Infrastructure",
  },
  {
    id: "o4",
    name: "Mesh Works",
    by: "Mesh Studio",
    desc: "Peer-to-peer collaboration for distributed community teams.",
    price: 19,
    liq: 7200,
    art: "mesh",
    sub: "BETTER, TOGETHER",
    type: "Coordination",
  },
  {
    id: "o5",
    name: "Clear Ledger",
    by: "Clear Labs",
    desc: "Readable grant reporting, from first milestone to final delivery.",
    price: 14,
    liq: 5100,
    art: "clear",
    sub: "FOLLOW THE WORK",
    type: "Infrastructure",
  },
  {
    id: "o6",
    name: "Seed Network",
    by: "Seed Collective",
    desc: "A mentorship network that helps early research take root.",
    price: 9,
    liq: 2400,
    art: "seed",
    sub: "ROOM TO GROW",
    type: "Research",
  },
];
const protocols = [
  {
    id: "r1",
    name: "Meridian",
    ticker: "MRD",
    category: "Lending",
    pd: 1.8,
    prev: 2.1,
    liq: 9400,
    updated: "4 min",
    desc: "Overcollateralized lending markets",
  },
  {
    id: "r2",
    name: "Aster",
    ticker: "AST",
    category: "DEX",
    pd: 2.4,
    prev: 2.2,
    liq: 12300,
    updated: "8 min",
    desc: "Automated liquidity exchange",
  },
  {
    id: "r3",
    name: "Northstar",
    ticker: "NST",
    category: "Staking",
    pd: 3.1,
    prev: 3.6,
    liq: 8100,
    updated: "12 min",
    desc: "Liquid staking infrastructure",
  },
  {
    id: "r4",
    name: "Harbor",
    ticker: "HBR",
    category: "Lending",
    pd: 4.6,
    prev: 4.3,
    liq: 4800,
    updated: "26 min",
    desc: "Cross-collateral lending",
  },
  {
    id: "r5",
    name: "Lattice",
    ticker: "LAT",
    category: "Bridge",
    pd: 6.2,
    prev: 5.4,
    liq: 2600,
    updated: "48 min",
    desc: "Cross-network asset bridge",
  },
  {
    id: "r6",
    name: "Ember",
    ticker: "EMB",
    category: "DEX",
    pd: 8.7,
    prev: 7.9,
    liq: 900,
    updated: "3 hrs",
    desc: "New-chain liquidity exchange",
  },
];
function spark(data, color = "var(--accent-text)", width = 110, height = 35) {
  let min = Math.min(...data),
    max = Math.max(...data);
  let points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${height - 4 - ((v - min) / (max - min || 1)) * (height - 8)}`,
    )
    .join(" ");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Illustrative price trend"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>`;
}
function lineChart(a, b) {
  const w = 620,
    h = 155,
    min = 100,
    max = 160;
  const pts = (data) =>
    data
      .map(
        (v, i) =>
          `${45 + (i / (data.length - 1)) * 560},${h - ((v - min) / (max - min)) * (h - 15)}`,
      )
      .join(" ");
  return `<svg viewBox="0 0 630 195" role="img" aria-label="Sample conditional forecast history. Both branches use the same scale from 100 to 160 contributors.">${[
    100, 120, 140, 160,
  ]
    .map((v) => {
      let y = h - ((v - min) / (max - min)) * (h - 15);
      return `<line x1="45" x2="610" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="0" y="${y + 4}" fill="var(--quiet)" font-size="10" font-family="monospace">${v}</text>`;
    })
    .join(
      "",
    )}<polyline points="${pts(b)}" fill="none" stroke="#898995" stroke-width="2"/><polyline points="${pts(a)}" fill="none" stroke="var(--accent)" stroke-width="3"/><text x="45" y="185" fill="var(--quiet)" font-size="10" font-family="monospace">14 OCT</text><text x="303" y="185" fill="var(--quiet)" font-size="10" font-family="monospace">17 OCT</text><text x="555" y="185" fill="var(--quiet)" font-size="10" font-family="monospace">20 OCT</text></svg>`;
}
function themeButton() {
  return `<button class="icon-btn" data-action="theme" aria-label="Toggle light and dark theme" title="Toggle theme">◐</button>`;
}
function header() {
  return `<header class="home-nav"><a class="wordmark" href="${url()}" aria-label="Seer home">seer</a><nav aria-label="Main navigation"><a href="${url()}#ecosystem">Ecosystem</a><a href="${url()}#approach">How it works</a><a href="${url("design")}">Design notes</a>${themeButton()}<a class="btn small" href="${url("explorer")}">Explore markets ${arrow}</a></nav></header>`;
}
function foot() {
  return `<footer class="footer"><a class="wordmark" href="${url()}">seer</a><span>Signal / An independent design concept by <a href="https://x.com/0xterricola" target="_blank" rel="noopener">@0xterricola</a></span><a href="${url("design")}">Design rationale ${arrow}</a></footer>`;
}

// The homepage demonstrates each product's distinct way of reading a market.
function ecosystemInstrument() {
  const lens = state.homeLens;
  const labels = {
    explorer: [
      "Every kind of question.",
      "Browse the full market landscape without losing the context.",
    ],
    deep: [
      "A field of perspectives.",
      "Compare many candidate forecasts and bring your own estimates.",
    ],
    futarchy: [
      "Two futures. One measure.",
      "Read the same success metric if a proposal passes or does not.",
    ],
    opportunity: [
      "A signal for the shortlist.",
      "Forecast selection while keeping reviewers in charge.",
    ],
    risk: [
      "Risk in relation.",
      "Compare annualized estimates on one common scale.",
    ],
  };
  let visual = "";
  if (lens === "explorer")
    visual = markets
      .slice(0, 4)
      .map(
        (m) =>
          `<div class="instrument-row"><span>${m.type}</span><span class="instrument-spark">${spark(m.spark)}</span><strong>${m.price}${m.type === "Binary" || m.type === "Categorical" ? "%" : " <small>" + m.outcome + "</small>"}</strong></div>`,
      )
      .join("");
  if (lens === "deep")
    visual = grants
      .slice(0, 4)
      .map(
        (g, i) =>
          `<div class="instrument-row"><span>${g.name}</span><span class="instrument-bar"><i style="width:${g.score}%"></i></span><strong>${g.score}<small>/100</small></strong></div>`,
      )
      .join("");
  if (lens === "futarchy")
    visual = `<div class="branch-origin">Contributor fellowship</div><div class="branch-lines" aria-hidden="true"></div><div class="instrument-branches"><div><span class="label accent">If it passes</span><strong>140</strong><small>contributors</small></div><div><span class="label">If it does not</span><strong>118</strong><small>contributors</small></div></div>`;
  if (lens === "opportunity")
    visual =
      submissions
        .slice(0, 3)
        .map(
          (m, i) =>
            `<div class="instrument-row"><span><small class="mono">0${i + 1}</small> &nbsp; ${m.name}</span><span class="instrument-bar"><i style="width:${m.price * 2}%"></i></span><strong>${m.price}%</strong></div>`,
        )
        .join("") +
      '<div class="instrument-note">Independent selections · Panel makes the final choice</div>';
  if (lens === "risk")
    visual = protocols
      .slice(0, 4)
      .map(
        (m) =>
          `<div class="instrument-row"><span>${m.name}</span><span class="instrument-bar"><i style="width:${m.pd * 10}%"></i></span><strong>${m.pd}%</strong></div>`,
      )
      .join("");
  return `<div class="signal-instrument"><div class="instrument-header"><span class="wordmark">seer</span><span class="label">Shared protocol / 05 applications</span></div><div class="instrument-tabs" role="group" aria-label="Explore Seer applications">${routes
    .slice(1)
    .map(
      ([r, n, i]) =>
        `<button data-action="home-lens" data-value="${r}" aria-pressed="${r === lens}" class="${r === lens ? "active" : ""}"><span aria-hidden="true">${i}</span><span>${r === "explorer" ? "Explorer" : r === "opportunity" ? "Opportunity" : r === "risk" ? "Risk" : n}</span></button>`,
    )
    .join(
      "",
    )}</div><div class="instrument-display"><div class="between"><span class="label">${lens === "risk" ? "Annual probability of default" : lens === "deep" ? "Expected evaluator score" : lens === "futarchy" ? "90-day retained contributors" : lens === "opportunity" ? "Probability of panel selection" : "Market forecasts"}</span><span class="label">Sample data</span></div><div class="instrument-viz">${visual}</div></div><div class="instrument-caption"><h3>${labels[lens][0]}</h3><p>${labels[lens][1]}</p><a href="${url(lens)}" class="row-link">Open ${routes.find((r) => r[0] === lens)[1]} ↗</a></div><div class="instrument-base"><span class="live"></span> SAME FOUNDATION. DIFFERENT QUESTIONS.</div></div>`;
}
function draftStats() {
  const entries = Object.entries(state.estimates).filter(([id]) =>
    grants.some((g) => g.id === id),
  );
  const deltas = entries.map(([id, v]) =>
    Math.abs(v - grants.find((g) => g.id === id).score),
  );
  return {
    count: entries.length,
    large: deltas.filter((v) => v >= 5).length,
    mean: deltas.length
      ? (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1)
      : "—",
    thin: entries.filter(([id]) => grants.find((g) => g.id === id).liq < 5000)
      .length,
  };
}
function deepSignalMap() {
  const stats = draftStats();
  return `<div class="signal-map card"><div class="signal-map-head"><div><span class="eyebrow accent">The difference is the starting point</span><h2>Where does your view diverge?</h2></div><div class="signal-legend"><span><i class="market-dot"></i>Market</span><span><i class="draft-dot"></i>Your draft</span></div></div><div class="signal-scale"><span>Candidate</span><div><span>0</span><span>50</span><span>100</span></div><span>Δ points</span></div>${grants
    .map((g) => {
      const v = state.estimates[g.id];
      return `<button class="signal-row" data-action="focus-candidate" data-id="${g.id}" aria-label="Inspect ${g.name}, market ${g.score}${v === undefined ? "" : ", your score " + v + ", difference " + deltaScore(g.id, g.score)}"><span>${g.name}</span><span class="signal-rail"><i class="signal-connector" style="left:${Math.min(g.score, v ?? g.score)}%;width:${Math.abs(g.score - (v ?? g.score))}%"></i><i class="market-dot" style="left:${g.score}%"></i>${v === undefined ? "" : `<i class="draft-dot" style="left:${v}%"></i>`}</span><strong class="mono ${v === undefined ? "muted" : "accent"}">${deltaScore(g.id, g.score)}</strong></button>`;
    })
    .join(
      "",
    )}<div class="signal-map-foot">${stats.count ? `${stats.count} forecasts · ${stats.large} differ by at least 5 points. Differences express disagreement, not certainty.` : "Add scores below or load an example to compare your view with the market."}</div></div>`;
}
function draftSummary() {
  const a = draftStats();
  return `<div class="draft-metrics"><div><strong>${a.count}<small> / 12</small></strong><span>Forecasts ready</span></div><div><strong>${a.mean}</strong><span>Mean absolute gap</span></div></div><div class="key-value"><span>Differences ≥5 points</span><b>${a.large}</b></div><div class="key-value"><span>Markets below $5k liquidity</span><b class="${a.thin ? "warning" : ""}">${a.thin}</b></div>`;
}
function updateDeepInsights() {
  const map = document.querySelector("#deep-signal-map");
  if (map) map.innerHTML = deepSignalMap();
  const summary = document.querySelector("#draft-summary");
  if (summary) summary.innerHTML = draftSummary();
  const bar = document.querySelector("#mobile-draft-count");
  if (bar) bar.textContent = draftStats().count + " forecasts";
  const btn = document.querySelector("#mobile-review-batch");
  if (btn)
    btn.disabled =
      !draftStats().count || Object.keys(state.invalidEstimates).length > 0;
}
function marketContext(m) {
  return `<details class="details market-context"><summary>Resolution & market context</summary><div class="context-grid"><div><span class="label">Market reference</span><strong>DEMO / ${m.id.toUpperCase()}</strong></div><div><span class="label">Sample liquidity</span><strong>${money(m.liquidity)}</strong></div><div><span class="label">Resolution date</span><strong>${m.close}</strong></div><div><span class="label">Market structure</span><strong>${m.type}</strong></div></div><p>${m.desc}</p><p class="hint">Fictional market for interface review. A live market must identify its published resolution source, oracle, and dispute terms before trading.</p></details>`;
}

function home() {
  document.title = "Seer / Signal — A clearer view of what comes next";
  app.innerHTML = `<div class="demo-strip">SEER / SIGNAL · Interactive design concept · All market data is illustrative <a href="${url("design")}">About this entry ${arrow}</a></div>${header()}<main id="main" class="home-wrap"><section class="hero"><div><div class="eyebrow"><span class="live"></span>One protocol. Many perspectives.</div><h1>Better questions.<br><em>Clearer futures.</em></h1><p>Turn what people know into signals everyone can use. Seer is the prediction market protocol connecting ideas, decisions, and the possibilities ahead.</p><div class="flex"><a class="btn" href="${url("explorer")}">Explore the markets <span>↗</span></a><a class="btn ghost" href="#ecosystem">Meet the ecosystem ↓</a></div></div><div id="ecosystem-instrument">${ecosystemInstrument()}</div></section><div class="protocol-line"><p>Shared market infrastructure.<br><strong style="color:var(--text)">Purpose-built ways to see the signal.</strong></p><div class="flex"><span class="label">Open markets</span><span class="label">Transparent rules</span><span class="label">Human judgment</span></div></div><section id="ecosystem" class="home-section"><div class="section-heading"><div><span class="eyebrow">The ecosystem / 01—05</span><h2>A different lens.<br>The same foundation.</h2></div><p>Start with the question you need answered. Each application makes a different kind of market easier to use.</p></div>${[
    [
      "explorer",
      "Seer Explorer",
      "Find, inspect, and trade across the whole Seer ecosystem. Every market type, in one place.",
    ],
    [
      "deep",
      "Deep",
      "Explore large fields of outcomes. Bring your own estimates, or let agents participate at scale.",
    ],
    [
      "futarchy",
      "Futarchy",
      "Compare the same measure of success across two futures: a proposal passing, or not passing.",
    ],
    [
      "opportunity",
      "Opportunity Markets",
      "Find the submissions traders think reviewers will select. A signal for review, with people making the choice.",
    ],
    [
      "risk",
      "Risk Pricing",
      "Compare risk estimates across protocols, alongside liquidity, definitions, and a shared time basis.",
    ],
  ]
    .map(
      ([r, n, d], i) =>
        `<a class="eco-row" href="${url(r)}"><span class="idx mono">0${i + 1}</span><h3>${n}</h3><p>${d}</p><span class="arrow">↗</span></a>`,
    )
    .join(
      "",
    )}</section><section id="approach" class="home-section" style="padding-top:10px"><div class="section-heading"><div><span class="eyebrow">From uncertainty to understanding</span><h2>Markets inform.<br>People decide.</h2></div><p>A useful forecast starts with a well-defined question—and stays connected to its context.</p></div><div class="principles"><div><span class="label accent">01 / Ask clearly</span><h3>Define what matters.</h3><p>Specify the outcome, time horizon, and resolution rules. A shared question gives every participant the same starting point.</p></div><div><span class="label accent">02 / Gather perspectives</span><h3>Make knowledge visible.</h3><p>Traders express their views through markets. Prices change as information and participation evolve.</p></div><div><span class="label accent">03 / Read in context</span><h3>Keep judgment in the loop.</h3><p>Read prices alongside liquidity and market rules. Use the signal to support your decision, with its limits in view.</p></div></div></section><section class="closing"><h2>What do you<br>want to understand?</h2><a class="btn" href="${url("explorer")}">Find your first market ↗</a></section>${foot()}</main>`;
}
function shell(content) {
  let name = routes.find((x) => x[0] === route)?.[1] || "Design notes";
  document.title = `${name} — Seer / Signal`;
  app.innerHTML = `<aside id="ecosystem-nav" class="sidebar" aria-label="Ecosystem navigation"><a class="wordmark" href="${url()}">seer</a><span class="label">The ecosystem</span>${routes.map(([r, n, i]) => `<a class="side-link ${r === route ? "active" : ""}" href="${url(r)}" ${r === route ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${i}</span>${n}${r === route ? '<span class="dot"></span>' : ""}</a>`).join("")}<div class="sidebar-bottom"><span class="badge violet">SIGNAL / EF EDITION</span><p>Different perspectives.<br>One shared protocol.</p><a href="${url("design")}">Design notes & credits ↗</a></div></aside><div class="shell"><header class="topbar"><div class="flex"><button class="icon-btn mobile-toggle" data-action="menu" aria-label="Toggle navigation" aria-controls="ecosystem-nav" aria-expanded="false">☰</button><div class="breadcrumb"><span>Seer ecosystem</span><span>/</span><b>${name}</b></div></div><div class="top-actions"><span class="badge"><span class="live"></span>Interactive concept</span>${themeButton()}<button class="btn secondary small" data-action="portfolio">Demo portfolio <span>↗</span></button></div></header><main id="main" class="app-main">${content}</main></div>`;
}
function pageHead(kicker, title, desc, action = "") {
  return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
}
function demoNote(
  text = "Explore freely. Trades are simulated; no wallet or funds required.",
) {
  return `<div class="intro-note"><span><strong>Sample data</strong> · ${text}</span><span class="mono">SNAPSHOT / 20 OCT 2026</span></div>`;
}
function bottomNote(text) {
  return `<div class="bottom-note"><span>ⓘ</span><span>${text}</span></div>`;
}
function tabs(options, active, action) {
  return `<div class="tabs" role="group" aria-label="Filter options">${options.map((x) => `<button class="${active === x ? "active" : ""}" data-action="${action}" data-value="${x}" aria-pressed="${active === x}">${x}</button>`).join("")}</div>`;
}
function search(id, placeholder, value = "") {
  return `<label class="searchbox"><span aria-hidden="true">⌕</span><span class="visually-hidden">${placeholder}</span><input id="${id}" placeholder="${placeholder}" value="${esc(value)}" autocomplete="off"></label>`;
}
function explorer() {
  shell(
    `${pageHead("01 / The general explorer", "Every market. One clear view.", "Explore the full Seer ecosystem. Find a question, inspect its rules, and take a position.", `<button class="btn secondary" data-action="watch-filter">☆ Watchlist <span class="number">${state.watch.length}</span></button>`)}${demoNote()}<div class="dashboard-grid"><div class="card feature-card"><div class="between"><span class="badge violet">MARKET IN FOCUS</span><span class="small">Technology / Binary</span></div><h2>${markets[0].name}</h2><div class="feature-meta"><div><span class="label">Market estimate</span><strong>68<span class="small">%</span> <small class="positive">+4.2 pp</small></strong><button class="row-link" data-action="trade" data-id="m1">Inspect market ↗</button></div><div><span class="label">Liquidity</span><strong>$38.4k</strong><span class="hint">Illustrative data</span></div></div><div class="mini-chart">${spark(markets[0].spark, "var(--accent)", 260, 75)}</div></div><div class="card stat-stack"><div class="stat"><span class="label">Markets in this demo</span><div class="between"><strong>08</strong><span class="small">5 market types</span></div></div><div class="stat"><span class="label">Sample volume</span><div class="between"><strong>$559.2k</strong><span class="small">Across all markets</span></div></div><div class="stat"><span class="label">Sample liquidity</span><div class="between"><strong>$146.6k</strong><span class="small">Read the signal</span></div></div></div></div><div class="toolbar">${tabs(["All markets", "Binary", "Categorical", "Scalar", "Conditional", "Multi-select", "Watchlist"], state.filter, "market-filter")}<div class="flex">${search("market-search", "Search questions or categories", state.query)}<select id="market-sort" aria-label="Sort markets"><option value="volume">Highest volume</option><option value="liquidity">Highest liquidity</option><option value="name">Question A–Z</option></select></div></div><div class="card"><div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable market data"><table class="table"><thead><tr><th>Market</th><th>Type</th><th>Estimate</th><th>7d trend</th><th>Volume</th><th>Liquidity</th><th><span class="visually-hidden">Watch</span></th></tr></thead><tbody id="market-rows">${marketRows()}</tbody></table></div><div class="table-foot"><span id="market-count">${marketItems().length} markets</span><span>Prices ≠ guarantees · Inspect resolution rules</span></div></div>${bottomNote("This explorer treats each market type on its own terms. Scalar values retain their units; conditional markets link to the decision context; independent selections do not imply a single winner.")}`,
  );
  document.querySelector("#market-sort").value = state.sort;
}
function marketItems() {
  return markets
    .filter(
      (m) =>
        (state.filter === "All markets" ||
          state.filter === m.type ||
          (state.filter === "Watchlist" && state.watch.includes(m.id))) &&
        `${m.name} ${m.group}`
          .toLowerCase()
          .includes(state.query.toLowerCase()),
    )
    .sort((a, b) =>
      state.sort === "name"
        ? a.name.localeCompare(b.name)
        : b[state.sort] - a[state.sort],
    );
}
function marketRows() {
  let items = marketItems();
  return items.length
    ? items
        .map(
          (m) =>
            `<tr><td><button class="market-name" data-action="trade" data-id="${m.id}">${m.name}</button><div class="market-sub"><span>${m.group}</span><span>·</span><span>Closes ${m.close}</span></div></td><td><span class="market-type">${m.type}</span></td><td><div class="prob">${m.price}${["m3", "m4", "m6"].includes(m.id) ? "" : "%"}</div><div class="market-sub">${m.outcome}</div></td><td><div class="spark">${spark(m.spark)}</div></td><td class="number">${money(m.volume)}</td><td class="number">${money(m.liquidity)}</td><td><button class="watch ${state.watch.includes(m.id) ? "saved" : ""}" data-action="watch" data-id="${m.id}" aria-label="${state.watch.includes(m.id) ? "Remove from" : "Add to"} watchlist: ${esc(m.name)}" aria-pressed="${state.watch.includes(m.id)}">${state.watch.includes(m.id) ? "★" : "☆"}</button></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="7"><div class="empty"><h3>${state.filter === "Watchlist" ? "Your watchlist starts here." : "No matching markets."}</h3><p>${state.filter === "Watchlist" ? "Use the star next to any market to save it." : "Try another search or market type."}</p><button class="btn secondary small mt" data-action="reset-markets">Show all markets</button></div></td></tr>`;
}
function updateMarketRows() {
  document.querySelector("#market-rows").innerHTML = marketRows();
  document.querySelector("#market-count").textContent =
    `${marketItems().length} markets`;
}
function deep() {
  shell(`${pageHead("02 / Deep", "A wider field of possibility.", "Explore many outcomes at once. Compare market forecasts with your own estimates, then review a batch.", `<button class="btn secondary" data-action="import">↑ Import forecasts</button>`)}${demoNote("A fictional research round. Scores forecast human evaluation, on a 0–100 scale.")}<div class="round-bar"><div><span class="badge violet">RESEARCH / ROUND 04</span><h2>Which ideas will earn the strongest review?</h2><p class="small">Open research grants · Mean evaluator score · Resolves 15 Dec 2026</p></div><div class="round-stats"><div><strong>12</strong><span class="label">Candidates</span></div><div><strong>0–100</strong><span class="label">Score range</span></div><div><strong>$79.6k</strong><span class="label">Liquidity</span></div></div></div><div class="split deep-workspace"><div><div id="deep-signal-map">${deepSignalMap()}</div><div class="deep-filters">${tabs(["All candidates", "My draft", "Gap ≥5 points"], state.deepFilter, "deep-filter")}</div><p class="hint mb">Drafts save on this device. Scores are independent; they do not need to sum to 100.</p><div class="toolbar">${search("deep-search", "Search candidates", state.deepQuery)}<select id="deep-sort" aria-label="Sort candidates"><option value="score">Highest forecast</option><option value="name">Name A–Z</option><option value="divergence">Largest disagreement</option></select></div><div class="card"><div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable market data"><table class="table"><thead><tr><th>Candidate</th><th>Market score</th><th>Your score</th><th>Difference</th></tr></thead><tbody id="deep-rows">${deepRows()}</tbody></table></div><div class="table-foot"><span id="deep-count">${deepItems().length} candidates</span><span>Independent scores · Not a probability distribution</span></div></div>${bottomNote("Market scores estimate how the review panel will evaluate each candidate. They do not allocate funding. The panel remains responsible for evaluation and selection.")}</div><div class="stack"><div class="card side-panel"><span class="eyebrow accent">Your perspective</span><h2>A forecast, at scale.</h2><p>Add scores in the table or import a batch. Review the difference before simulating submission.</p><div class="divider"></div><div class="key-value"><span>Forecasts entered</span><b id="batch-count">${Object.keys(state.estimates).length} / 12</b></div><div id="draft-summary">${draftSummary()}</div><div class="hint">Score range 0–100 · Draft saved on this device</div><p id="forecast-error" class="error" role="alert">${Object.keys(state.invalidEstimates).length ? "Correct invalid scores before reviewing the batch." : ""}</p><button class="btn full mt" id="review-batch" data-action="batch" ${Object.keys(state.estimates).length && !Object.keys(state.invalidEstimates).length ? "" : "disabled"}>Review forecast batch ↗</button><button class="btn ghost full small" data-action="sample-estimates">Load sample agent forecasts</button><div class="draft-tools"><button class="row-link" data-action="export-draft">Export CSV ↓</button><button class="row-link" data-action="clear-draft">Clear draft</button></div></div><div class="card side-panel"><span class="badge">AGENT-FRIENDLY CONCEPT</span><h3 style="margin:15px 0 10px">Same market. More perspectives.</h3><p>A simple schema lets agents express forecasts alongside human traders.</p><pre class="agent-block mt">{
  "round": "research-04",
  "candidate": "g1",
  "score": 82,
  "scale": [0, 100]
}</pre><button class="row-link mt" data-action="schema">View example schema ↗</button></div></div></div><div class="mobile-batch-bar"><span id="mobile-draft-count">${draftStats().count} forecasts</span><button class="btn small" id="mobile-review-batch" data-action="batch" ${draftStats().count && !Object.keys(state.invalidEstimates).length ? "" : "disabled"}>Review batch ↗</button></div>`);
  document.querySelector("#deep-sort").value = state.deepSort;
}
function deepItems() {
  return grants
    .filter(
      (g) =>
        state.deepFilter === "All candidates" ||
        (state.deepFilter === "My draft" && g.id in state.estimates) ||
        (state.deepFilter === "Gap ≥5 points" &&
          g.id in state.estimates &&
          Math.abs(state.estimates[g.id] - g.score) >= 5),
    )
    .filter((g) =>
      (g.name + " " + g.category)
        .toLowerCase()
        .includes(state.deepQuery.toLowerCase()),
    )
    .sort((a, b) =>
      state.deepSort === "name"
        ? a.name.localeCompare(b.name)
        : state.deepSort === "divergence"
          ? Math.abs((state.estimates[b.id] ?? b.score) - b.score) -
            Math.abs((state.estimates[a.id] ?? a.score) - a.score)
          : b.score - a.score,
    );
}
function deepRows() {
  const items = deepItems();
  return items.length
    ? items
        .map(
          (g) =>
            `<tr><td><div class="row-title"><span class="avatar">${g.name
              .split(" ")
              .map((x) => x[0])
              .join(
                "",
              )}</span><div><button class="market-name" data-action="grant" data-id="${g.id}">${g.name}</button><div class="market-sub">${g.category} · ${money(g.liq)} liq.</div></div></div></td><td><div class="bar-value"><span class="prob">${g.score}</span><span class="bar-track"><i style="width:${g.score}%"></i></span></div></td><td><input class="estimate-input" type="number" min="0" max="100" step="1" inputmode="decimal" data-estimate="${g.id}" value="${esc(state.invalidEstimates[g.id] ?? state.estimates[g.id] ?? "")}" aria-invalid="${g.id in state.invalidEstimates}" aria-describedby="forecast-error" placeholder="—" aria-label="Your forecast score for ${g.name}"></td><td class="number accent" id="delta-${g.id}">${deltaScore(g.id, g.score)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4"><div class="empty">No candidates match your search.</div></td></tr>`;
}
function deltaScore(id, score) {
  let v = state.estimates[id];
  return v === undefined
    ? "—"
    : `${v - score > 0 ? "+" : ""}${Math.round((v - score) * 10) / 10}`;
}
function futarchy() {
  let p = proposals[state.proposal],
    diff = p.pass - p.fail;
  shell(
    `${pageHead("03 / Futarchy", "Compare futures. Decide together.", "Conditional markets forecast the same measure of success in two possible worlds. Governance makes the choice.")} ${demoNote("Fictional Atlas DAO proposals. Each comparison uses the same metric and resolution date.")}<div class="futarchy-layout"><div><div class="between mb"><h3>Atlas DAO</h3><span class="badge">3 proposals</span></div><div class="proposal-list">${proposals.map((q, i) => `<button class="proposal ${state.proposal === i ? "active" : ""}" data-action="proposal" data-value="${i}" aria-pressed="${state.proposal === i}"><div class="between"><span class="number">${q.id}</span><span class="live"></span></div><h3>${q.title}</h3><p>${money(q.liquidity)} liquidity</p><div class="mt small ${q.pass > q.fail ? "accent" : "muted"}">${q.pass - q.fail > 0 ? "+" : ""}${q.pass - q.fail} contributors forecast difference</div></button>`).join("")}</div><div class="callout mt"><strong>Forecast ≠ vote.</strong><br>Prices inform the discussion. Atlas DAO members make the final decision.</div></div><div class="card comparison"><div class="between"><span class="eyebrow">${p.id} / Decision market</span><span class="badge green">Trading open</span></div><h2>${p.title}</h2><p class="small">${p.desc}</p><div class="divider"></div><div class="between"><div><span class="label">Measure of success</span><h3 style="margin-top:8px">90-day retained contributors</h3></div><span class="badge">Higher is better</span></div><p class="hint mt" style="margin-top:10px">Unique contributors active in both the first and final 30 days of the evaluation window.</p><div class="metric-pair"><div class="metric-block pass"><span class="label accent">If proposal passes</span><strong>${p.pass} <small>contributors</small></strong><p>Conditional market forecast</p></div><div class="metric-block"><span class="label">If it does not pass</span><strong>${p.fail} <small>contributors</small></strong><p>Conditional market forecast</p></div></div><div class="chart-wrap"><div class="chart-legend"><span><i></i>Passes</span><span><i class="gray"></i>Does not pass</span><span style="margin-left:auto">7-day sample history</span></div>${lineChart(p.passData, p.failData)}</div><div class="delta"><span>Difference in conditional forecasts</span><strong>${diff > 0 ? "+" : ""}${diff} <small style="font-size:12px">contributors</small></strong></div><div class="key-value"><span>Total liquidity</span><b>${money(p.liquidity)} ${p.liquidity < 5000 ? '<span class="warning">· Thin market</span>' : ""}</b></div><div class="key-value"><span>Metric resolution</span><b>31 Jan 2027</b></div><div class="key-value"><span>Governance decision</span><b>Atlas DAO vote · 31 Oct 2026</b></div><div class="flex mt"><button class="btn" data-action="conditional">Explore conditional positions ↗</button><button class="btn secondary" data-action="proposal-detail">Read proposal</button></div><details class="details"><summary>How to interpret this comparison</summary><p>These are market forecasts conditional on the proposal passing or not passing. The gap is not a guaranteed effect, nor a measure of statistical confidence. Participation, liquidity, and selection effects can influence prices. Both branches use the same metric definition, evaluation window, and 0–200 contributor range.</p><p>In this concept, the realized branch resolves against the observed metric; positions in the unrealized branch are refunded. Exact production settlement rules must be verified for each live market.</p></details></div></div>`,
  );
}
function opportunity() {
  shell(
    `${pageHead("04 / Opportunity Markets", "Good work deserves a closer look.", "See which submissions traders expect reviewers to select. Build a shortlist, inspect the work, and form your own view.", `<button class="btn secondary" data-action="shortlist-filter">☆ Shortlist <span class="number">${state.shortlist.length}</span></button>`)}${demoNote("Fictional open-tools call. Independent selection markets; several entries may be selected.")}<div class="opportunity-banner"><div><span class="eyebrow accent">Open call / Community tools</span><h2>Small tools. Shared possibilities.</h2><p>Support the next generation of open community tools. Forecast which submissions the review panel will select for a pilot.</p><div class="opportunity-meta"><span><b>06</b> submissions</span><span><b>Up to 3</b> selections</span><span><b>18 Dec</b> panel decision</span></div><div class="flow mt"><span>Submissions</span><span>→</span><span class="current">Market trading</span><span>→</span><span>Panel selection</span></div></div><div class="opportunity-art" aria-hidden="true"><div class="tile"><span>IDEA / 01</span><b>◇</b><span>Possibility.</span></div><div class="tile"><span>IDEA / 02</span><b>✳</b><span>Potential.</span></div></div></div><div class="toolbar">${tabs(["All submissions", "My shortlist"], state.opFilter, "op-filter")}<div class="flex"><span class="small">Sorted by market estimate</span><button class="btn ghost small" data-action="selection-rules">Selection rules ⓘ</button></div></div><div class="submission-grid">${opCards()}</div>${bottomNote("Selection probability is a forecast of the panel’s choice, not an assessment of intrinsic quality. The panel selects up to three submissions using its rubric. Independent probabilities need not sum to 100%.")}`,
  );
}
function opCards() {
  let items = submissions.filter(
    (s) => state.opFilter !== "My shortlist" || state.shortlist.includes(s.id),
  );
  return items.length
    ? items
        .map(
          (s) =>
            `<article class="submission-card"><div class="submission-art s${s.id.slice(1)}"><div class="graphic-orbit"></div><div class="art-word">${s.art}<span>${s.sub}</span></div><button class="shortlist-btn ${state.shortlist.includes(s.id) ? "saved" : ""}" data-action="shortlist" data-id="${s.id}" aria-label="${state.shortlist.includes(s.id) ? "Remove" : "Save"} ${s.name} ${state.shortlist.includes(s.id) ? "from" : "to"} shortlist" aria-pressed="${state.shortlist.includes(s.id)}">${state.shortlist.includes(s.id) ? "★" : "☆"}</button></div><div class="submission-content"><span class="label">${s.type} / ${s.by}</span><h3>${s.name}</h3><p>${s.desc}</p><div class="odds-line"><div><span class="label">Selection estimate</span><div class="hint">${money(s.liq)} liquidity</div></div><strong>${s.price}<span class="small">%</span></strong></div><button class="btn secondary full" data-action="submission" data-id="${s.id}">Review submission ↗</button></div></article>`,
        )
        .join("")
    : `<div class="empty card" style="grid-column:1/-1"><h3>Keep promising work in view.</h3><p>Use the star on a submission to add it to your shortlist.</p><button class="btn secondary mt" data-action="op-filter" data-value="All submissions">Browse submissions</button></div>`;
}
function risk() {
  shell(
    `${pageHead("05 / Risk Pricing", "Risk, with a frame of reference.", "Compare market forecasts of annual default estimates. Read the same measure, on the same basis, across protocols.", `<button class="btn secondary" data-action="risk-export">↓ Export data</button>`)}${demoNote("All protocols and estimates here are fictional. This is a design demonstration, not financial guidance.")}<div class="risk-overview"><div class="card risk-summary"><div class="between"><span class="eyebrow">Risk landscape</span><span class="badge violet">Q4 2026 EVALUATION</span></div><div class="big-value">1.8–8.7<span>% annual PD</span></div><p>Range of market-implied estimates across six sample protocols. Use the comparison view to inspect definitions, liquidity, and differences.</p><div class="divider"></div><div class="between"><span class="small">Common basis</span><strong class="small" style="color:var(--text)">Annualized probability of default</strong></div><button class="row-link mt" data-action="risk-method">Read the measurement framework ↗</button></div><div class="risk-chart"><div class="between"><h3>One scale. Different estimates.</h3><span class="label">0–10%</span></div>${protocols.map((p) => `<div class="risk-bar"><span>${p.name}</span><span class="track"><i style="width:${p.pd * 10}%"></i></span><span class="number">${p.pd}%</span></div>`).join("")}<p class="hint">Illustrative estimates · Higher values mean higher forecast risk</p></div></div><div class="toolbar">${tabs(["All protocols", "Lending", "DEX", "Staking", "Bridge"], state.riskCategory, "risk-filter")}<div class="flex">${search("risk-search", "Search protocols", state.riskQuery)}<select id="risk-sort" aria-label="Sort protocols"><option value="risk">Lowest estimate</option><option value="high">Highest estimate</option><option value="liquidity">Highest liquidity</option></select></div></div><div class="card"><div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable market data"><table class="table risk-table"><thead><tr><th>Protocol / Compare</th><th>Category</th><th>Annual PD</th><th>7d change</th><th>Liquidity</th><th>Last activity</th><th></th></tr></thead><tbody id="risk-rows">${riskRows()}</tbody></table></div><div class="table-foot"><span>Select 2–3 protocols to compare</span><span>Common evaluation date: 31 Dec 2026</span></div></div><div id="compare-slot">${compareTray()}</div>${bottomNote("A low estimate is not a safety rating. These scalar markets forecast a panel’s annualized risk estimate at quarter end. Thin liquidity and stale activity can weaken the signal; neither is hidden behind a single score.")}`,
  );
  document.querySelector("#risk-sort").value = state.riskSort;
}
function riskItems() {
  return protocols
    .filter(
      (p) =>
        (state.riskCategory === "All protocols" ||
          p.category === state.riskCategory) &&
        p.name.toLowerCase().includes(state.riskQuery.toLowerCase()),
    )
    .sort((a, b) =>
      state.riskSort === "liquidity"
        ? b.liq - a.liq
        : state.riskSort === "high"
          ? b.pd - a.pd
          : a.pd - b.pd,
    );
}
function riskRows() {
  let items = riskItems();
  return items.length
    ? items
        .map(
          (p) =>
            `<tr><td><div class="flex"><input type="checkbox" data-compare="${p.id}" aria-label="Compare ${p.name}" ${state.compare.includes(p.id) ? "checked" : ""}><div><button class="market-name" data-action="protocol" data-id="${p.id}">${p.name}</button><div class="market-sub">${p.ticker} · Demo protocol</div></div></div></td><td><span class="market-type">${p.category}</span></td><td><span class="prob">${p.pd}%</span></td><td class="number">${p.pd - p.prev > 0 ? "+" : ""}${(p.pd - p.prev).toFixed(1)} <span class="muted">pp</span></td><td><span class="number">${money(p.liq)}</span>${p.liq < 3000 ? '<div class="market-sub warning">Thin liquidity</div>' : ""}</td><td class="muted">${p.updated} ago</td><td><button class="row-link" data-action="protocol" data-id="${p.id}" aria-label="Inspect ${p.name}">↗</button></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="7"><div class="empty">No protocols match your filters.</div></td></tr>`;
}
function compareTray() {
  return state.compare.length
    ? `<div class="compare-tray"><p><strong>${state.compare.length} selected</strong> · ${protocols
        .filter((p) => state.compare.includes(p.id))
        .map((p) => p.name)
        .join(
          ", ",
        )}</p><div class="flex gap8"><button class="btn ghost small" data-action="clear-compare">Clear</button><button class="btn small" data-action="compare" ${state.compare.length < 2 ? "disabled" : ""}>Compare protocols ↗</button></div></div>`
    : "";
}
function design() {
  shell(
    `${pageHead("Seer / Signal", "One foundation. Six useful perspectives.", "An Electric Foundation design entry by @0xterricola. Built around the question each person is trying to answer.")}<div class="design-grid"><section class="card"><span class="eyebrow accent">01 / Intent</span><h2 class="mt">Make the signal legible.</h2><p>Seer is one protocol with several distinct jobs. This entry gives the ecosystem a shared visual language while making each job feel native: exploring, forecasting at scale, comparing conditional futures, reviewing submissions, and comparing risk estimates.</p><p class="mt">Every forecast stays close to its unit, resolution context, and liquidity. The design keeps human decisions separate from market predictions.</p><div class="swatches"><div class="swatch" style="background:#101013;color:#ededf2">#101013</div><div class="swatch" style="background:#1a1a1e;color:#ededf2">#1A1A1E</div><div class="swatch" style="background:#8736ff;color:white">#8736FF</div><div class="swatch" style="background:#ededf2;color:#101013">#EDEDF2</div></div><p class="hint">Palette informed by the supplied EF board. Supporting colors and font choices are documented adaptations.</p></section><section class="card"><span class="eyebrow accent">02 / Explore the entry</span><h2 class="mt">Six interfaces. Six direct links.</h2><div class="route-list">${routes.map(([r, n], i) => `<a href="${url(r)}"><span><span class="mono muted">0${i + 1}</span> &nbsp; ${n === "Home" ? "Seer homepage" : n}</span><span class="accent">↗</span></a>`).join("")}</div></section><section class="card design-copy"><span class="eyebrow accent">03 / Deliberate departures</span><h2 class="mt">EF, with room to work.</h2><ul><li><strong>Visual continuity:</strong> electric violet, near-black backgrounds, layered neutral surfaces, compact outcome controls, and light/dark modes carry through from the kit.</li><li><strong>Typography:</strong> Space Grotesk headings and DM Sans interface text add a consistent hierarchy. These are chosen web fonts, not claimed as verified EF typefaces. Both fonts are bundled locally with their open-source licenses.</li><li><strong>Layout:</strong> a persistent ecosystem switcher connects the products. Tables replace dense cards where comparison matters; cards remain for submission review.</li><li><strong>Meaningful color:</strong> violet marks the primary interaction and forecast. Green and amber support activity and liquidity context; labels carry the same meaning without color.</li><li><strong>Identity treatment:</strong> the text wordmark and eye favicon are prototype adaptations, not exported official logo assets.</li></ul><a class="row-link" target="_blank" rel="noopener" href="https://www.figma.com/design/cB6ZFMUkBwMBhHadLdiSmh/Seer-Branding?node-id=118-16652">View the supplied EF kit ↗</a></section><section class="card design-copy"><span class="eyebrow accent">04 / Try it</span><h2 class="mt">Designed to be used.</h2><div class="checklist"><div><span class="proof-check">✓</span><strong>Explorer:</strong> search, filter, save markets, and simulate positions across every market type.</div><div><span class="proof-check">✓</span><strong>Deep:</strong> enter forecasts, import a CSV batch, and review differences.</div><div><span class="proof-check">✓</span><strong>Futarchy:</strong> select a proposal and inspect both conditional positions.</div><div><span class="proof-check">✓</span><strong>Opportunity:</strong> shortlist entries, read the rubric, and simulate a selection position.</div><div><span class="proof-check">✓</span><strong>Risk:</strong> compare 2–3 protocols and export consistent data.</div><div><span class="proof-check">✓</span><strong>Everywhere:</strong> switch themes and use keyboard-accessible controls.</div></div><div class="callout"><strong>Prototype scope</strong><br>All values, protocol names, proposals, grants, and submission examples are fictional fixtures. Simulations are saved only in this browser. There is no wallet connection, live market feed, or transaction execution.</div><button class="btn secondary mt" data-action="reset-demo">Reset saved demo activity</button></section></div><p class="about-foot muted">Created for Seer’s six-interface bounty · <a class="accent" href="https://x.com/0xterricola" target="_blank" rel="noopener">@0xterricola</a> · <a class="accent" href="https://poidh.xyz/mainnet/bounty/38" target="_blank" rel="noopener">Bounty brief ↗</a></p>`,
  );
}
function showModal(title, body, wide = false) {
  modal.style.width = wide ? "min(800px,calc(100% - 32px))" : "";
  modal.innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-action="close" aria-label="Close dialog">×</button></div><div class="modal-body">${body}</div>`;
  if (!modal.open) modal.showModal();
  modal.querySelector("[data-action=close]").focus();
}
function toast(message) {
  let t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3200);
}
function success(title, text) {
  showModal(
    "Simulation complete",
    `<div class="success"><div class="success-mark">✓</div><h3>${title}</h3><p>${text}</p><button class="btn" data-action="close">Continue exploring ↗</button></div>`,
  );
}
function addPosition(name, detail) {
  state.positions.unshift({ name, detail, time: new Date().toISOString() });
  save("positions", state.positions);
}

/** Demo-only fixed quotes. No wallet, live liquidity, or execution service. */
function extendedTrade(m) {
  const categorical = m.type === "Categorical" || m.type === "Multi-select";
  const conditional = m.type === "Conditional";
  const max = m.id === "m4" || conditional ? 200 : 100;
  const unit =
    m.id === "m4"
      ? "teams"
      : conditional
        ? "contributors"
        : m.id === "m7"
          ? "% annual PD"
          : "points";
  const choices =
    m.type === "Categorical"
      ? [
          { name: "Open tooling", price: 42 },
          { name: "Climate research", price: 33 },
          { name: "Public archives", price: 25 },
        ]
      : m.type === "Multi-select"
        ? submissions.slice(0, 3).map((x) => ({ name: x.name, price: x.price }))
        : [];
  state.position = { market: m, max, unit, choices, conditional, categorical };
  const outcomeField = categorical
    ? `<label class="field" for="position-outcome">${m.type === "Categorical" ? "Winning outcome" : "Independent selection"}</label><select id="position-outcome" class="wide-select">${choices.map((o, i) => `<option value="${i}">${o.name} — ${o.price}%</option>`).join("")}</select>`
    : "";
  const branchField = conditional
    ? `<label class="field" for="position-branch">Conditional branch</label><select id="position-branch" class="wide-select"><option value="pass">Proposal passes — 140 contributors</option><option value="fail">Proposal does not pass — 118 contributors</option></select>`
    : "";
  showModal(
    "Inspect & simulate",
    `<span class="badge violet">${m.type.toUpperCase()} / SAMPLE DATA</span><h3 class="mt">${m.name}</h3><p>${m.desc}</p>${marketContext(m)}${outcomeField}${branchField}<label class="field" for="position-side">Position</label><select id="position-side" class="wide-select"><option value="up">${categorical ? "Yes — selected outcome" : "UP — higher " + unit}</option><option value="down">${categorical ? "No — selected outcome does not win" : "DOWN — lower " + unit}</option></select><label class="field" for="position-amount">Simulation amount (demo USD)</label><input id="position-amount" class="wide" type="number" min="1" max="10000" step="0.01" value="100"><div class="key-value"><span>Illustrative share price</span><b id="position-price"></b></div><div class="key-value"><span>Estimated shares</span><b id="position-shares"></b></div>${!categorical ? `<div class="settlement-lab"><span class="eyebrow accent">Understand the payoff</span><label class="field" for="settlement-value">If the final value is… <b id="settlement-label"></b></label><input id="settlement-value" type="range" min="0" max="${max}" step="${m.id === "m7" ? ".1" : "1"}" value="${conditional ? 140 : m.price}" style="width:100%"><div class="key-value"><span>Illustrative settlement payout</span><b id="position-payout"></b></div><p class="hint">UP pays final value ÷ ${max}; DOWN pays its complement. Each share settles between 0 and 1 demo USD. ${conditional ? "If the chosen branch does not occur, this demo assumes the original stake is refunded." : ""}</p></div>` : '<p class="hint mt">A winning share pays 1 demo USD; a losing share pays 0. You can lose the full amount. ' + (m.type === "Multi-select" ? "Selections are independent; more than one may resolve Yes." : "Exactly one listed outcome resolves Yes.") + "</p>"}<div class="key-value"><span>Maximum loss</span><b id="position-loss"></b></div><p class="hint">Fixed-price learning simulation. Fees, spread, and slippage are excluded. ${conditional ? "Branch/refund terms are illustrative, not verified production rules." : ""}</p><div id="position-error" class="error" role="alert"></div><button class="btn full" data-action="execute-position">Simulate position ↗</button>`,
  );
  updatePositionQuote();
}
function positionQuote() {
  const p = state.position;
  const side = document.querySelector("#position-side").value;
  const branch = document.querySelector("#position-branch")?.value;
  const choice = p.categorical
    ? p.choices[Number(document.querySelector("#position-outcome").value)]
    : null;
  const forecast = p.conditional
    ? branch === "pass"
      ? 140
      : 118
    : p.market.price;
  const up = choice ? choice.price / 100 : forecast / p.max;
  const price = side === "up" ? up : 1 - up;
  const amount = Number(document.querySelector("#position-amount").value);
  const final = Number(document.querySelector("#settlement-value")?.value || 0);
  const shares = amount / price;
  const payout = shares * (side === "up" ? final / p.max : 1 - final / p.max);
  return {
    p,
    side,
    branch,
    choice,
    price,
    amount,
    final,
    shares,
    payout,
    valid: Number.isFinite(amount) && amount >= 1 && amount <= 10000,
  };
}
function updatePositionQuote() {
  const q = positionQuote();
  document.querySelector("#position-price").textContent =
    (q.price * 100).toFixed(2) + "¢";
  document.querySelector("#position-shares").textContent = q.valid
    ? q.shares.toFixed(2)
    : "—";
  document.querySelector("#position-loss").textContent = q.valid
    ? q.amount + " demo USD"
    : "—";
  if (!q.p.categorical) {
    document.querySelector("#settlement-label").textContent =
      q.final + " " + q.p.unit;
    document.querySelector("#position-payout").textContent = q.valid
      ? q.payout.toFixed(2) + " demo USD"
      : "—";
  }
}
function executePosition() {
  const q = positionQuote();
  if (!q.valid) {
    document.querySelector("#position-error").textContent =
      "Enter an amount between 1 and 10,000 demo USD.";
    return;
  }
  const name = q.choice ? q.choice.name : q.p.unit;
  const side = q.p.categorical
    ? q.side === "up"
      ? "Yes"
      : "No"
    : q.side === "up"
      ? "UP"
      : "DOWN";
  addPosition(
    q.p.market.name,
    `${side} / ${name}${q.branch ? " / " + q.branch + " branch" : ""} · ${q.shares.toFixed(2)} shares · ${q.amount} demo USD`,
  );
  success(
    "Position recorded.",
    `${q.shares.toFixed(2)} simulated ${side} shares were saved to your demo activity. No real order was placed.`,
  );
}
function trade(id) {
  let m = markets.find((x) => x.id === id);
  state.tradeId = id;
  state.tradeChoice = "Yes";
  if (m.type !== "Binary") {
    extendedTrade(m);
    return;
  }
  showModal(
    "Inspect & simulate",
    `<span class="badge violet">BINARY MARKET / SAMPLE DATA</span><h3 class="mt">${m.name}</h3><p>${m.desc}</p>${marketContext(m)}<div class="choice-grid"><button class="choice active" data-action="trade-choice" data-value="Yes">Yes<strong>${m.price}¢</strong></button><button class="choice" data-action="trade-choice" data-value="No">No<strong>${100 - m.price}¢</strong></button></div><label class="field" for="trade-amount">Simulation amount (demo USD)</label><input class="wide" id="trade-amount" type="number" min="1" max="10000" value="100" step="1" inputmode="decimal"><div class="key-value"><span>Estimated shares</span><b id="trade-shares">${(100 / (m.price / 100)).toFixed(2)} Yes</b></div><div class="key-value"><span>Payout per winning share</span><b>1 demo USD</b></div><div class="key-value"><span>Maximum loss</span><b id="trade-loss">100 demo USD</b></div><p class="hint">Illustrative fixed-price calculation. Fees, spread, and slippage are excluded. A live trade requires a fresh quote.</p><div class="error" id="trade-error" role="alert"></div><button class="btn full" data-action="execute-trade">Simulate position ↗</button><p class="hint mt">No funds move. This action is stored only in your browser.</p>`,
  );
}
function tradeQuote() {
  let m = markets.find((x) => x.id === state.tradeId),
    amount = Number(document.querySelector("#trade-amount").value),
    price = (state.tradeChoice === "Yes" ? m.price : 100 - m.price) / 100;
  document.querySelector("#trade-shares").textContent =
    Number.isFinite(amount) && amount > 0
      ? `${(amount / price).toFixed(2)} ${state.tradeChoice}`
      : "—";
  document.querySelector("#trade-loss").textContent =
    Number.isFinite(amount) && amount > 0 ? `${amount} demo USD` : "—";
}
function batchReview() {
  if (Object.keys(state.invalidEstimates).length) {
    toast("Correct invalid scores before reviewing.");
    return;
  }
  let entries = Object.entries(state.estimates).sort(
    ([a, av], [b, bv]) =>
      Math.abs(bv - grants.find((g) => g.id === b).score) -
      Math.abs(av - grants.find((g) => g.id === a).score),
  );
  showModal(
    "Review forecast batch",
    `<span class="badge violet">RESEARCH-04 / SIMULATION</span><h3 class="mt">${entries.length} forecasts. Your perspective.</h3><p>Scores forecast the panel’s evaluation on a 0–100 scale. This demonstration records forecasts without placing orders.</p><div class="callout mt"><strong>Review the largest disagreements first.</strong> ${draftStats().large} forecasts differ by at least 5 points; ${draftStats().thin} have less than $5k sample liquidity. A large gap is a reason to investigate, not proof of an edge.</div><div class="table-wrap mt" tabindex="0" role="region" aria-label="Forecast batch review"><table class="table"><thead><tr><th>Candidate</th><th>Market</th><th>Yours</th><th>Δ</th><th>Liquidity</th></tr></thead><tbody>${entries
      .map(([id, v]) => {
        let g = grants.find((x) => x.id === id);
        return `<tr><td>${g.name}</td><td>${g.score}</td><td class="accent">${v}</td><td>${deltaScore(id, g.score)}</td><td class="${g.liq < 5000 ? "warning" : "muted"}">${money(g.liq)}</td></tr>`;
      })
      .join(
        "",
      )}</tbody></table></div><button class="btn full mt" data-action="execute-batch">Record simulated batch ↗</button>`,
  );
}
function importDialog() {
  showModal(
    "Import forecasts",
    `<p>Paste CSV with a <strong>candidate_id</strong> and a <strong>score</strong> from 0 to 100. Candidate IDs run from g1 to g12. Importing merges valid entries with your current draft.</p><label class="field" for="import-csv">CSV forecasts</label><textarea id="import-csv" spellcheck="false">candidate_id,score
g1,82
g2,88
g3,74</textarea><label class="field" for="csv-file">Or choose a CSV file</label><input class="wide" id="csv-file" type="file" accept=".csv,text/csv"><div class="error" id="import-error" role="alert"></div><button class="btn full" data-action="import-submit">Validate & import ↗</button>`,
  );
}
function importCSV() {
  let text = document.querySelector("#import-csv").value.trim(),
    lines = text.split(/\r?\n/).filter((x) => x.trim()),
    result = {};
  if (lines[0]?.trim().toLowerCase() === "candidate_id,score") lines.shift();
  let errors = [];
  lines.forEach((line, i) => {
    let parts = line.split(",").map((x) => x.trim()),
      id = parts[0],
      value = Number(parts[1]);
    if (
      parts.length !== 2 ||
      !grants.some((g) => g.id === id) ||
      parts[1] === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    )
      errors.push(
        `Row ${i + 1}: use a candidate ID g1–g12 and a score from 0 to 100.`,
      );
    else if (id in result)
      errors.push(`Row ${i + 1}: duplicate candidate ${id}.`);
    else result[id] = value;
  });
  if (!lines.length) errors.push("Add at least one forecast.");
  if (errors.length) {
    document.querySelector("#import-error").textContent = errors[0];
    return;
  }
  Object.assign(state.estimates, result);
  Object.keys(result).forEach((id) => delete state.invalidEstimates[id]);
  save("draft-forecasts", state.estimates);
  modal.close();
  deep();
  toast(
    `${Object.keys(result).length} forecasts imported. Review the batch when ready.`,
  );
}

// Fictional project briefs make the reviewer workflow concrete without real-world claims.
const projectBriefs = {
  o1: [
    "A single place for neighborhood teams to publish goals, assign work, and make progress visible.",
    "A public task board, weekly digest, and accessible status pages.",
    "Pilot with three community groups; assess whether contributors can find and complete a first task.",
  ],
  o2: [
    "Field observations often disappear into private notebooks. This tool makes small research records reusable.",
    "An offline-capable field form, exportable datasets, and provenance notes.",
    "Run two field studies; review completeness, export quality, and time to capture an observation.",
  ],
  o3: [
    "Useful research is fragmented across repositories and personal sites. Open Index connects records by topic and source.",
    "A searchable catalogue, source citations, and an open import format.",
    "Index 500 sample records; evaluate search relevance against a published question set.",
  ],
  o4: [
    "Distributed teams need lightweight coordination that does not depend on a single hosted workspace.",
    "A peer-to-peer project board, shared milestones, and a portable archive.",
    "Test collaboration across three small teams, including interrupted network conditions.",
  ],
  o5: [
    "Grant progress is hard to compare when each team reports in a different format.",
    "A common milestone template, readable spending summary, and exportable progress report.",
    "Run a six-week pilot with sample projects; check whether reviewers can trace each milestone to evidence.",
  ],
  o6: [
    "New researchers often lack a clear path from a first question to a useful project.",
    "A mentor directory, structured matching criteria, and reusable onboarding guides.",
    "Pilot ten mentor pairings and assess continuity, responsiveness, and usefulness of the guidance.",
  ],
};
function submissionEvidence(id) {
  const b = projectBriefs[id];
  return `<div class="submission-evidence"><div><h4>Problem</h4><p>${b[0]}</p></div><div><h4>Proposed deliverables</h4><p>${b[1]}</p></div><div><h4>What a successful pilot looks like</h4><p>${b[2]}</p></div></div>`;
}
function showSubmission(id) {
  let s = submissions.find((x) => x.id === id);
  showModal(
    "Review submission",
    `<span class="badge violet">${s.type.toUpperCase()} / FICTIONAL ENTRY</span><h3 class="mt">${s.name}</h3><p>${s.desc}</p><p class="small mt">Submitted by ${s.by}</p><div class="metric-block mt"><span class="label">Market forecast of selection</span><strong>${s.price}<small>%</small></strong><p>${money(s.liq)} sample liquidity</p></div>${submissionEvidence(s.id)}<h3 class="mt" style="font-size:17px">What the panel will review</h3><div class="checklist"><div>01 &nbsp; Usefulness to an identifiable community</div><div>02 &nbsp; Feasibility of the proposed pilot</div><div>03 &nbsp; Open access to the resulting work</div></div><div class="callout">Up to three entries may be selected. The review panel decides; market prices provide an additional signal.</div><div class="flex mt"><button class="btn" data-action="selection-trade" data-id="${s.id}">Simulate a selection position ↗</button><button class="btn secondary" data-action="shortlist-modal" data-id="${s.id}">${state.shortlist.includes(s.id) ? "★ Saved" : "☆ Shortlist"}</button></div>`,
  );
}
function selectionTrade(id) {
  let s = submissions.find((x) => x.id === id);
  showModal(
    "Selection position",
    `<span class="badge violet">INDEPENDENT YES / NO MARKET</span><h3 class="mt">Will ${s.name} be selected?</h3><p>Resolves Yes if the review panel selects ${s.name} for the pilot by 18 December 2026. Other entries may also be selected.</p><label class="field" for="selection-side">Outcome</label><select id="selection-side" style="width:100%"><option value="Yes">Yes — ${s.price}¢ per share</option><option value="No">No — ${100 - s.price}¢ per share</option></select><label class="field" for="selection-amount">Simulation amount (demo USD)</label><input class="wide" id="selection-amount" type="number" min="1" max="10000" value="100"><p class="hint mt">Fixed-price simulation, excluding fees and slippage. Winning shares pay 1 demo USD; losing shares pay 0. You can lose the full amount.</p><div class="error" id="selection-error" role="alert"></div><button class="btn full" data-action="execute-selection" data-id="${id}">Simulate position ↗</button>`,
  );
}
function riskMethod() {
  showModal(
    "Measurement framework",
    `<span class="badge violet">SHARED BASIS / Q4 2026</span><h3 class="mt">Compare the same kind of estimate.</h3><p>Each sample market forecasts the annualized probability of default assigned to a protocol by a fictional independent risk panel at the end of Q4 2026.</p><div class="key-value"><span>Metric</span><b>Annualized probability of default</b></div><div class="key-value"><span>Unit</span><b>Percent per year</b></div><div class="key-value"><span>Evaluation date</span><b>31 Dec 2026</b></div><div class="key-value"><span>Scalar resolution range</span><b>0–100%</b></div><div class="divider"></div><h3 style="font-size:17px">Working definition of default</h3><p>For this demonstration: inability to satisfy valid user withdrawal or repayment obligations for more than seven consecutive days due to protocol insolvency or an unrecoverable exploit. Temporary planned maintenance is excluded.</p><p class="mt">This is a forecast of a future risk estimate, not the current probability of a binary default event during Q4. The annual basis must not be silently treated as a quarterly probability.</p><div class="callout mt">These are proposed demo definitions, not verified production Seer rules. In a live product, the full resolution source and oracle terms belong beside every estimate.</div>`,
  );
}
function protocolDetail(id) {
  let p = protocols.find((x) => x.id === id);
  showModal(
    "Protocol estimate",
    `<span class="badge">${p.category.toUpperCase()} / DEMO PROTOCOL</span><h3 class="mt">${p.name}</h3><p>${p.desc}</p><div class="metric-block mt"><span class="label">Market forecast / annual PD</span><strong>${p.pd}%</strong><p>Panel evaluation at 31 Dec 2026</p></div><div class="key-value"><span>7-day change</span><b>${p.pd - p.prev > 0 ? "+" : ""}${(p.pd - p.prev).toFixed(1)} percentage points</b></div><div class="key-value"><span>Liquidity</span><b>${money(p.liq)}</b></div><div class="key-value"><span>Last sample activity</span><b>${p.updated} ago</b></div>${p.liq < 3000 ? '<div class="callout"><strong>Thin liquidity.</strong> A small number of trades may move this estimate substantially.</div>' : ""}<button class="btn secondary full mt" data-action="risk-method">Inspect the common measurement framework ↗</button>`,
  );
}
function showCompare() {
  let ps = protocols.filter((p) => state.compare.includes(p.id));
  showModal(
    "Compare protocol estimates",
    `<p>Same metric, units, and evaluation date. Liquidity and activity remain visible beside the forecast.</p><div class="compare-grid mt" style="grid-template-columns:repeat(${ps.length},1fr)">${ps.map((p) => `<div class="metric-block"><h3>${p.name}</h3><span class="label">Annual PD</span><strong>${p.pd}%</strong><p>${money(p.liq)} liquidity</p><p>Activity ${p.updated} ago</p>${p.liq < 3000 ? '<p class="warning">Thin liquidity</p>' : ""}</div>`).join("")}</div><div class="callout mt"><strong>${(Math.max(...ps.map((x) => x.pd)) - Math.min(...ps.map((x) => x.pd))).toFixed(1)} percentage points</strong> separate the highest and lowest estimates in this comparison. This difference does not account for liquidity or uncertainty.</div><button class="btn secondary full mt" data-action="risk-method">Review measurement rules ↗</button>`,
    true,
  );
}
function exportRisk() {
  let rows = [
    [
      "protocol",
      "category",
      "annual_pd_percent",
      "change_7d_percentage_points",
      "liquidity_demo_usd",
      "evaluation_date",
      "data_status",
    ],
    ...riskItems().map((p) => [
      p.name,
      p.category,
      p.pd,
      (p.pd - p.prev).toFixed(1),
      p.liq,
      "2026-12-31",
      "FICTIONAL_DEMO",
    ]),
  ];
  download(
    "seer-signal-risk-demo.csv",
    rows.map((r) => r.join(",")).join("\n"),
    "text/csv",
  );
  toast("Filtered sample data exported as CSV.");
}
function download(name, content, type) {
  let link = document.createElement("a"),
    objectURL = URL.createObjectURL(new Blob([content], { type }));
  link.href = objectURL;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
}
function portfolio() {
  showModal(
    "Your demo activity",
    state.positions.length
      ? `<p>Stored only in this browser. No real orders or funds.</p><div class="stack mt">${state.positions
          .slice(0, 20)
          .map(
            (p) =>
              `<div class="metric-block"><h3 style="font-size:16px;margin:0 0 8px">${esc(p.name)}</h3><p>${esc(p.detail)}</p><div class="hint mt">${new Date(p.time).toLocaleString()}</div></div>`,
          )
          .join("")}</div>`
      : `<div class="empty"><h3>Your first perspective starts here.</h3><p>Simulate a position in Explorer, record a Deep batch, or try an Opportunity selection market.</p><a class="btn mt" href="${url("explorer")}">Explore markets ↗</a></div>`,
  );
}
function toggleWatch(id) {
  state.watch = state.watch.includes(id)
    ? state.watch.filter((x) => x !== id)
    : [...state.watch, id];
  save("watch", state.watch);
}
function toggleShortlist(id) {
  state.shortlist = state.shortlist.includes(id)
    ? state.shortlist.filter((x) => x !== id)
    : [...state.shortlist, id];
  save("shortlist", state.shortlist);
}
const actions = {
  "home-lens": (el) => {
    state.homeLens = el.dataset.value;
    document.querySelector("#ecosystem-instrument").innerHTML =
      ecosystemInstrument();
    document
      .querySelector(
        `[data-action="home-lens"][data-value="${state.homeLens}"]`,
      )
      .focus();
  },
  "deep-filter": (el) => {
    state.deepFilter = el.dataset.value;
    deep();
  },
  "focus-candidate": (el) => {
    state.deepQuery = grants.find((g) => g.id === el.dataset.id).name;
    state.deepFilter = "All candidates";
    deep();
    document.querySelector(`[data-estimate="${el.dataset.id}"]`).focus();
  },
  "export-draft": () => {
    if (!draftStats().count) {
      toast("Add a forecast before exporting.");
      return;
    }
    download(
      "seer-deep-draft.csv",
      "candidate_id,score\n" +
        Object.entries(state.estimates)
          .map(([id, v]) => id + "," + v)
          .join("\n"),
      "text/csv",
    );
    toast("Draft exported.");
  },
  "clear-draft": () =>
    showModal(
      "Clear forecast draft?",
      `<p>Remove the saved draft on this device? Recorded demo activity will remain.</p><div class="flex mt"><button class="btn secondary" data-action="close">Keep draft</button><button class="btn" data-action="confirm-clear-draft">Clear draft</button></div>`,
    ),
  "confirm-clear-draft": () => {
    state.estimates = {};
    state.invalidEstimates = {};
    save("draft-forecasts", {});
    state.deepFilter = "All candidates";
    modal.close();
    deep();
    toast("Draft cleared.");
  },
  theme: () => {
    let t =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    save("theme", t);
  },
  menu: () => {
    let open = document.querySelector(".sidebar").classList.toggle("open");
    document
      .querySelector('[data-action="menu"]')
      .setAttribute("aria-expanded", String(open));
  },
  close: () => modal.close(),
  portfolio: portfolio,
  "watch-filter": () => {
    state.filter = "Watchlist";
    explorer();
  },
  "market-filter": (el) => {
    state.filter = el.dataset.value;
    explorer();
  },
  "reset-markets": () => {
    state.filter = "All markets";
    state.query = "";
    explorer();
  },
  watch: (el) => {
    toggleWatch(el.dataset.id);
    explorer();
  },
  "watch-dialog": (el) => {
    toggleWatch(el.dataset.id);
    modal.close();
    explorer();
    toast("Watchlist updated.");
  },
  trade: (el) => trade(el.dataset.id),
  "execute-position": executePosition,
  "go-futarchy": () => (location.href = url("futarchy")),
  "trade-choice": (el) => {
    state.tradeChoice = el.dataset.value;
    modal
      .querySelectorAll(".choice")
      .forEach((b) => b.classList.toggle("active", b === el));
    tradeQuote();
  },
  "execute-trade": () => {
    let amount = Number(document.querySelector("#trade-amount").value);
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      document.querySelector("#trade-error").textContent =
        "Enter an amount between 1 and 10,000 demo USD.";
      return;
    }
    let m = markets.find((x) => x.id === state.tradeId),
      price = (state.tradeChoice === "Yes" ? m.price : 100 - m.price) / 100,
      shares = (amount / price).toFixed(2);
    addPosition(
      m.name,
      `${state.tradeChoice} · ${shares} shares · ${amount} demo USD`,
    );
    success(
      "Perspective recorded.",
      `${shares} simulated ${state.tradeChoice} shares were added to your demo activity. No real trade was placed.`,
    );
  },
  "sample-estimates": () => {
    state.estimates = {
      g1: 82,
      g2: 88,
      g3: 74,
      g4: 89,
      g5: 64,
      g6: 78,
      g7: 59,
      g8: 72,
      g9: 49,
      g10: 64,
      g11: 52,
      g12: 38,
      ...state.estimates,
    };
    state.invalidEstimates = {};
    save("draft-forecasts", state.estimates);
    deep();
    toast(
      "Sample forecasts filled empty slots. Your existing scores were preserved.",
    );
  },
  batch: batchReview,
  "execute-batch": () => {
    let count = Object.keys(state.estimates).length;
    addPosition(
      "Deep / Research-04",
      `${count} forecasts: ` +
        Object.entries(state.estimates)
          .map(([id, v]) => `${grants.find((g) => g.id === id).name} ${v}`)
          .join("; "),
    );
    state.estimates = {};
    state.invalidEstimates = {};
    save("draft-forecasts", {});
    deep();
    success(
      "Batch recorded.",
      `${count} forecasts were saved to your demo activity. This simulation does not execute market orders.`,
    );
  },
  import: importDialog,
  "import-submit": importCSV,
  schema: () =>
    showModal(
      "Agent forecast schema",
      `<p>This is a proposed interchange format for the prototype, not a live API endpoint. Export or import forecasts using the CSV format below.</p><pre class="agent-block mt">{
  "round": "research-04",
  "forecasts": [
    {"candidate_id": "g1", "score": 82},
    {"candidate_id": "g2", "score": 88}
  ],
  "scale": {"min": 0, "max": 100}
}</pre><button class="btn secondary full mt" data-action="download-template">↓ Download CSV template</button>`,
    ),
  "download-template": () =>
    download(
      "seer-deep-forecast-template.csv",
      "candidate_id,score\ng1,82\ng2,88\ng3,74\n",
      "text/csv",
    ),
  grant: (el) => {
    let g = grants.find((x) => x.id === el.dataset.id);
    showModal(
      "Candidate details",
      `<span class="badge">${g.id.toUpperCase()} / ${g.category.toUpperCase()}</span><h3 class="mt">${g.name}</h3><p>${g.desc}. This fictional candidate is part of the research-04 evaluation round.</p><div class="metric-block mt"><span class="label">Market forecast of mean panel score</span><strong>${g.score}<small> / 100</small></strong><p>${money(g.liq)} sample liquidity</p></div><h3 class="mt" style="font-size:17px">Evaluation rubric</h3><p>Public benefit (40%), feasibility (35%), and openness of deliverables (25%). The panel awards each candidate an independent score; funding selection remains a separate decision.</p><div class="key-value"><span>Evaluation date</span><b>15 Dec 2026</b></div><div class="key-value"><span>Resolution range</span><b>0–100 points</b></div><button class="btn full mt" data-action="close">Return to forecasts</button>`,
    );
  },
  proposal: (el) => {
    state.proposal = Number(el.dataset.value);
    futarchy();
  },
  "proposal-detail": () => {
    let p = proposals[state.proposal];
    showModal(
      "Proposal overview",
      `<span class="badge violet">ATLAS DAO / ${p.id}</span><h3 class="mt">${p.title}</h3><p>${p.desc}</p><h3 class="mt" style="font-size:17px">Decision context</h3><p>The DAO is considering a pilot, with progress evaluated through retained contributor activity. The market offers an additional forecast; the proposal’s costs, fairness, and strategic fit remain part of the governance discussion.</p><div class="key-value"><span>Vote date</span><b>31 Oct 2026</b></div><div class="key-value"><span>Metric evaluation</span><b>31 Jan 2027</b></div><div class="callout mt">This proposal and its organization are fictional examples created for the design demo.</div>`,
    );
  },
  conditional: () => {
    let p = proposals[state.proposal];
    showModal(
      "Conditional positions",
      `<h3>${p.title}</h3><p>Choose a branch to inspect its forecast. The metric is retained contributors, with a 0–200 range. These values are not probabilities that the proposal passes.</p><div class="metric-pair"><div class="metric-block pass"><span class="label">Passes</span><strong>${p.pass}</strong><p>Contributors forecast</p></div><div class="metric-block"><span class="label">Does not pass</span><strong>${p.fail}</strong><p>Contributors forecast</p></div></div><label class="field" for="conditional-branch">Branch to record for review</label><select id="conditional-branch" style="width:100%"><option>Proposal passes</option><option>Proposal does not pass</option></select><div class="callout mt">A conditional position only applies in its specified branch. This prototype records a research note rather than inventing an executable quote.</div><button class="btn full mt" data-action="save-conditional">Save branch to demo activity ↗</button>`,
    );
  },
  "save-conditional": () => {
    let p = proposals[state.proposal],
      branch = document.querySelector("#conditional-branch").value;
    addPosition(
      p.title,
      `${branch} · forecast ${branch === "Proposal passes" ? p.pass : p.fail} contributors · research note only`,
    );
    success(
      "Branch saved for review.",
      "The conditional forecast is in your demo activity. Governance still makes the decision.",
    );
  },
  "op-filter": (el) => {
    state.opFilter = el.dataset.value;
    opportunity();
  },
  "shortlist-filter": () => {
    state.opFilter = "My shortlist";
    opportunity();
  },
  shortlist: (el) => {
    toggleShortlist(el.dataset.id);
    opportunity();
  },
  "shortlist-modal": (el) => {
    toggleShortlist(el.dataset.id);
    opportunity();
    showSubmission(el.dataset.id);
  },
  submission: (el) => showSubmission(el.dataset.id),
  "selection-rules": () =>
    showModal(
      "Selection rules",
      `<h3>Markets forecast. The panel selects.</h3><p>The fictional community-tools panel may select up to three submissions for a pilot, based on usefulness, feasibility, and open access. The panel may also select fewer than three.</p><div class="checklist"><div><strong>Trading closes:</strong> 17 December 2026, 23:59 UTC</div><div><strong>Panel decision:</strong> 18 December 2026</div><div><strong>Resolution source:</strong> the panel’s published selection announcement</div></div><div class="callout">Each entry has an independent selection market. More than one entry can resolve Yes, so prices need not sum to 100%. Market rank does not determine the final selection.</div>`,
    ),
  "selection-trade": (el) => selectionTrade(el.dataset.id),
  "execute-selection": (el) => {
    let s = submissions.find((x) => x.id === el.dataset.id),
      amount = Number(document.querySelector("#selection-amount").value),
      side = document.querySelector("#selection-side").value;
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      document.querySelector("#selection-error").textContent =
        "Enter an amount between 1 and 10,000 demo USD.";
      return;
    }
    let shares = (
      amount /
      ((side === "Yes" ? s.price : 100 - s.price) / 100)
    ).toFixed(2);
    addPosition(
      `Selection / ${s.name}`,
      `${side} · ${shares} shares · ${amount} demo USD`,
    );
    success(
      "Selection view recorded.",
      `${shares} simulated ${side} shares for ${s.name} were saved. The review panel still makes the selection.`,
    );
  },
  "risk-filter": (el) => {
    state.riskCategory = el.dataset.value;
    risk();
  },
  "risk-method": riskMethod,
  protocol: (el) => protocolDetail(el.dataset.id),
  compare: showCompare,
  "clear-compare": () => {
    state.compare = [];
    risk();
  },
  "risk-export": exportRisk,
  "reset-demo": () =>
    showModal(
      "Reset demo activity?",
      `<p>This clears this prototype’s watchlist, shortlist, saved forecast draft, and simulated activity in this browser. It does not affect any real account or funds.</p><div class="flex mt"><button class="btn secondary" data-action="close">Keep activity</button><button class="btn" data-action="confirm-reset">Reset demo</button></div>`,
    ),
  "confirm-reset": () => {
    state.watch = [];
    state.shortlist = [];
    state.positions = [];
    state.estimates = {};
    state.invalidEstimates = {};
    save("draft-forecasts", {});
    ["watch", "shortlist", "positions"].forEach((k) => save(k, []));
    modal.close();
    toast("Saved demo activity cleared.");
  },
};
document.addEventListener("click", (event) => {
  let el = event.target.closest("[data-action]");
  if (el && actions[el.dataset.action]) actions[el.dataset.action](el);
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    let r = modal.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      modal.close();
  }
});
document.addEventListener("input", (event) => {
  if (["position-amount", "settlement-value"].includes(event.target.id))
    updatePositionQuote();
  let t = event.target;
  if (t.id === "market-search") {
    state.query = t.value;
    updateMarketRows();
  }
  if (t.id === "deep-search") {
    state.deepQuery = t.value;
    document.querySelector("#deep-rows").innerHTML = deepRows();
    document.querySelector("#deep-count").textContent =
      `${deepItems().length} candidates`;
  }
  if (t.dataset.estimate) {
    let id = t.dataset.estimate,
      value = Number(t.value);
    if (t.value === "" || !Number.isFinite(value) || value < 0 || value > 100) {
      delete state.estimates[id];
      if (t.value === "") delete state.invalidEstimates[id];
      else state.invalidEstimates[id] = t.value;
      t.setCustomValidity(t.value === "" ? "" : "Enter a score from 0 to 100.");
      t.setAttribute("aria-invalid", t.value === "" ? "false" : "true");
    } else {
      state.estimates[id] = value;
      delete state.invalidEstimates[id];
      t.setCustomValidity("");
      t.setAttribute("aria-invalid", "false");
    }
    let g = grants.find((x) => x.id === id);
    document.querySelector("#delta-" + id).textContent = deltaScore(
      id,
      g.score,
    );
    document.querySelector("#batch-count").textContent =
      `${Object.keys(state.estimates).length} / 12`;
    document.querySelector("#review-batch").disabled =
      !Object.keys(state.estimates).length ||
      !!Object.keys(state.invalidEstimates).length;
    document.querySelector("#forecast-error").textContent = Object.keys(
      state.invalidEstimates,
    ).length
      ? "Correct invalid scores before reviewing the batch."
      : "";
    save("draft-forecasts", state.estimates);
    updateDeepInsights();
  }
  if (t.id === "trade-amount") tradeQuote();
  if (t.id === "risk-search") {
    state.riskQuery = t.value;
    document.querySelector("#risk-rows").innerHTML = riskRows();
  }
});
document.addEventListener("change", async (event) => {
  if (
    ["position-outcome", "position-side", "position-branch"].includes(
      event.target.id,
    )
  )
    updatePositionQuote();
  let t = event.target;
  if (t.id === "market-sort") {
    state.sort = t.value;
    updateMarketRows();
  }
  if (t.id === "deep-sort") {
    state.deepSort = t.value;
    document.querySelector("#deep-rows").innerHTML = deepRows();
  }
  if (t.id === "risk-sort") {
    state.riskSort = t.value;
    document.querySelector("#risk-rows").innerHTML = riskRows();
  }
  if (t.dataset.compare) {
    let id = t.dataset.compare;
    if (t.checked) {
      if (state.compare.length === 3) {
        t.checked = false;
        toast("Compare up to three protocols at a time.");
        return;
      }
      state.compare.push(id);
    } else state.compare = state.compare.filter((x) => x !== id);
    document.querySelector("#compare-slot").innerHTML = compareTray();
  }
  if (t.id === "csv-file" && t.files[0]) {
    if (t.files[0].size > 100000) {
      document.querySelector("#import-error").textContent =
        "Choose a CSV file smaller than 100 KB.";
      return;
    }
    document.querySelector("#import-csv").value = await t.files[0].text();
  }
});
(({ explorer, deep, futarchy, opportunity, risk, design })[route] || home)();

// Dismiss mobile navigation without moving away from the current screen.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.open) {
    const nav = document.querySelector(".sidebar.open");
    if (nav) {
      nav.classList.remove("open");
      const toggle = document.querySelector("[data-action=menu]");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  }
});
