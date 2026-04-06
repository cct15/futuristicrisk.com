/* Risk Dashboard + Globe — aligned with War Dashboard style */

const CONFLICT_NAMES = {
  iran_israel_us: '伊朗 - 美国/以色列',
  russia_ukraine: '俄罗斯 - 乌克兰',
  china_taiwan: '中国 - 台海',
  israel_palestine: '以色列 - 巴勒斯坦',
  india_pakistan: '印度 - 巴基斯坦',
  us_latam: '美国 - 拉丁美洲',
};

const EVENT_ICONS = {
  escalation: '⚔️',
  ceasefire: '🕊',
  ceasefire_cancel: '💥',
  regime_change: '🏛',
  diplomatic: '🤝',
};

const EVENT_CN = {
  escalation: '军事升级',
  ceasefire: '停战/和平',
  ceasefire_cancel: '停战破裂',
  regime_change: '政权更迭',
  diplomatic: '外交斡旋',
};

const POSITIVE_TYPES = new Set(['ceasefire', 'diplomatic']);

// Fallback data for file:// protocol
const FALLBACK_DATA = {
  metadata: { updated_at: '2026-04-06T02:17:53+00:00' },
  conflicts: [
    { conflict_id: 'iran_israel_us', label: 'Iran-Israel/US', risk_level: 'low', probability_30d: 0.0789, probability_7d: 0.019, probability_1d: 0.0027, composite_risk_score: 0.1737, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0789, probability_7d: 0.0229, probability_1d: 0.0033, change_vs_7d_ago: -0.0107 },
      { event_type: 'regime_change', direction: 'risk_increase', probability_30d: 0.0444, probability_7d: 0.0102, probability_1d: 0.0015, change_vs_7d_ago: -0.0153 },
      { event_type: 'diplomatic', direction: 'neutral', probability_30d: 0.0722, probability_7d: 0.0152, probability_1d: 0.0022, change_vs_7d_ago: -0.0364 },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.3092, probability_7d: 0.0666, probability_1d: 0.0099, change_vs_7d_ago: 0.0291 },
    ]},
    { conflict_id: 'india_pakistan', label: 'India-Pakistan', risk_level: 'low', probability_30d: 0.0382, probability_7d: 0.0091, probability_1d: 0.0013, composite_risk_score: 0.1245, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0382, probability_7d: 0.0045, probability_1d: 0.0006, change_vs_7d_ago: 0.0002 },
    ]},
    { conflict_id: 'russia_ukraine', label: 'Russia-Ukraine', risk_level: 'low', probability_30d: 0.0149, probability_7d: 0.0035, probability_1d: 0.0005, composite_risk_score: 0.1104, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0149, probability_7d: 0.0016, probability_1d: 0.0002, change_vs_7d_ago: -0.0018 },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.034, probability_7d: 0.0055, probability_1d: 0.0008, change_vs_7d_ago: -0.0032 },
    ]},
    { conflict_id: 'israel_palestine', label: 'Israel-Palestine', risk_level: 'low', probability_30d: 0.0, probability_7d: 0.0, probability_1d: 0.0, composite_risk_score: 0.103, risk_events: [
      { event_type: 'ceasefire_cancel', direction: 'risk_increase', probability_30d: 0.0, probability_7d: 0.0, probability_1d: 0.0, change_vs_7d_ago: null },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.0538, probability_7d: 0.0032, probability_1d: 0.0005, change_vs_7d_ago: -0.0164 },
    ]},
    { conflict_id: 'china_taiwan', label: 'China-Taiwan', risk_level: 'low', probability_30d: 0.0125, probability_7d: 0.0029, probability_1d: 0.0004, composite_risk_score: 0.0987, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0125, probability_7d: 0.0035, probability_1d: 0.0005, change_vs_7d_ago: -0.0002 },
    ]},
    { conflict_id: 'us_latam', label: 'US-Latin America', risk_level: 'low', probability_30d: 0.025, probability_7d: 0.0059, probability_1d: 0.0008, composite_risk_score: 0.0866, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.025, probability_7d: 0.0049, probability_1d: 0.0007, change_vs_7d_ago: -0.006 },
      { event_type: 'regime_change', direction: 'risk_increase', probability_30d: 0.0352, probability_7d: 0.0083, probability_1d: 0.0012, change_vs_7d_ago: -0.0082 },
    ]},
  ]
};

// Map hotspot positions (% of 960x480 viewBox) + label offsets (matching war dashboard)
// Dot positions (% of map) + label direction + short display name
// Coordinates: real geography (from map_paths.py HOTSPOTS / 960x480)
// Label direction chosen to avoid overlap
const HOTSPOTS = {
  russia_ukraine:   { x: 57.8, y: 20.8, dir: 'right', short: '俄乌' },       // (555,100)
  iran_israel_us:   { x: 62.7, y: 30.6, dir: 'right', short: '伊朗-美以' },   // (602,147)
  israel_palestine: { x: 58.5, y: 31.0, dir: 'left',  short: '以巴/黎' },     // (562,149)
  china_taiwan:     { x: 80.2, y: 35.4, dir: 'right', short: '台海' },        // (770,170)
  india_pakistan:    { x: 67.7, y: 31.9, dir: 'below', short: '印巴' },        // (650,153)
  us_latam:         { x: 32.9, y: 44.6, dir: 'right', short: '美-拉美' },     // (316,214)
};

// --- Formatting helpers (matching war dashboard _pct / _prob_style) ---

function fmtPct(v) {
  if (v === null || v === undefined) return '—';
  if (v < 0.001) return '< 0.1%';
  if (v >= 0.10) return Math.round(v * 100) + '%';
  return (v * 100).toFixed(1) + '%';
}

function probStyle(p30, etype) {
  const positive = POSITIVE_TYPES.has(etype);
  if (positive) {
    if (p30 >= 0.50) return { color: '#2563eb', label: '高概率' };
    if (p30 >= 0.25) return { color: '#0891b2', label: '中概率' };
    if (p30 >= 0.10) return { color: '#64748b', label: '低概率' };
    return { color: '#94a3b8', label: '极低' };
  } else {
    if (p30 >= 0.50) return { color: '#dc2626', label: '高概率' };
    if (p30 >= 0.25) return { color: '#ea580c', label: '中概率' };
    if (p30 >= 0.10) return { color: '#d97706', label: '低概率' };
    return { color: '#94a3b8', label: '极低' };
  }
}

function deltaHTML(change) {
  if (change === null || change === undefined) return '<span class="prob-delta prob-delta-na">—</span>';
  const pct = (change * 100).toFixed(1);
  if (change > 0.001) return `<span class="prob-delta prob-delta-up">+${pct}%▲</span>`;
  if (change < -0.001) return `<span class="prob-delta prob-delta-down">${pct}%▼</span>`;
  return '<span class="prob-delta prob-delta-flat">0</span>';
}

// --- Globe hotspots (dual indicator: ⚔ escalation + 🕊 ceasefire) ---

function renderGlobe(conflicts) {
  const container = document.getElementById('globe-hotspots');
  if (!container) return;

  const probMap = {};
  conflicts.forEach(c => { probMap[c.conflict_id] = c; });

  let html = '';
  for (const [id, pos] of Object.entries(HOTSPOTS)) {
    const c = probMap[id];
    if (!c) continue;

    const events = c.risk_events || [];
    const esc = events.find(e => e.event_type === 'escalation' || e.event_type === 'ceasefire_cancel');
    const cf = events.find(e => e.event_type === 'ceasefire');
    const escP = esc ? fmtPct(esc.probability_30d) : null;
    const cfP = cf ? fmtPct(cf.probability_30d) : null;

    // Short name for map label (full names are too wide and overlap)
    const name = pos.short || CONFLICT_NAMES[id] || id;

    let indicators = '';
    if (escP) indicators += `<span class="globe-esc">⚔ ${escP}</span>`;
    if (cfP) indicators += `<span class="globe-cf">🕊 ${cfP}</span>`;
    if (!indicators) indicators = fmtPct(c.probability_30d);

    html += `
      <div class="hotspot" style="left:${pos.x}%;top:${pos.y}%;">
        <div class="hotspot-dot"></div>
        <div class="hotspot-label hotspot-${pos.dir}">
          <div class="hotspot-name">${name}</div>
          <div class="hotspot-indicators">${indicators}</div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

// --- Load data ---

async function loadRiskDashboard() {
  let data;
  try {
    const liveUrl = 'https://raw.githubusercontent.com/cct15/war-dashboard-data/main/conflicts.json';
    let resp = await fetch(liveUrl);
    if (!resp.ok) resp = await fetch('data/sample-risks.json');
    data = await resp.json();
  } catch (e) {
    data = FALLBACK_DATA;
  }

  const conflicts = data.conflicts || [];

  // Risk cards are now static HTML from the daily report — no JS rendering needed
  // Only render globe hotspots dynamically
  renderGlobe(conflicts);

  const tsEl = document.getElementById('risk-updated');
  if (tsEl && data.metadata && data.metadata.updated_at) {
    const d = new Date(data.metadata.updated_at);
    tsEl.textContent = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

document.addEventListener('DOMContentLoaded', loadRiskDashboard);
