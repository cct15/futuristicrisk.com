/* Risk Dashboard + Globe Hotspots */

const CONFLICT_NAMES = {
  iran_israel_us: '伊朗-以色列/美国',
  russia_ukraine: '俄罗斯-乌克兰',
  china_taiwan: '中国-台湾',
  israel_palestine: '以色列-巴勒斯坦',
  india_pakistan: '印度-巴基斯坦',
  us_latam: '美国-拉美',
};

const EVENT_LABELS = {
  escalation: '军事升级',
  ceasefire: '停火',
  ceasefire_cancel: '停火破裂',
  regime_change: '政权更迭',
  diplomatic: '外交事件',
};

// Fallback data for file:// protocol (CORS blocks fetch)
const FALLBACK_DATA = {
  metadata: { updated_at: '2026-04-06T02:17:53+00:00' },
  conflicts: [
    { conflict_id: 'iran_israel_us', label: 'Iran-Israel/US', risk_level: 'low', probability_30d: 0.0789, probability_7d: 0.019, probability_1d: 0.0027, composite_risk_score: 0.1737, anomaly_detected: false, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0789, change_vs_7d_ago: -0.0107, data_points: 5 },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.3092, change_vs_7d_ago: 0.0291, data_points: 11 },
    ]},
    { conflict_id: 'india_pakistan', label: 'India-Pakistan', risk_level: 'low', probability_30d: 0.0382, probability_7d: 0.0091, probability_1d: 0.0013, composite_risk_score: 0.1245, anomaly_detected: false, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0382, change_vs_7d_ago: 0.0002, data_points: 2 },
    ]},
    { conflict_id: 'russia_ukraine', label: 'Russia-Ukraine', risk_level: 'low', probability_30d: 0.0149, probability_7d: 0.0035, probability_1d: 0.0005, composite_risk_score: 0.1104, anomaly_detected: false, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0149, change_vs_7d_ago: -0.0018, data_points: 6 },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.034, change_vs_7d_ago: -0.0032, data_points: 6 },
    ]},
    { conflict_id: 'israel_palestine', label: 'Israel-Palestine', risk_level: 'low', probability_30d: 0.0, probability_7d: 0.0, probability_1d: 0.0, composite_risk_score: 0.103, anomaly_detected: false, risk_events: [
      { event_type: 'ceasefire_cancel', direction: 'risk_increase', probability_30d: 0.0, change_vs_7d_ago: null, data_points: 4 },
      { event_type: 'ceasefire', direction: 'risk_decrease', probability_30d: 0.0538, change_vs_7d_ago: -0.0164, data_points: 4 },
    ]},
    { conflict_id: 'china_taiwan', label: 'China-Taiwan', risk_level: 'low', probability_30d: 0.0125, probability_7d: 0.0029, probability_1d: 0.0004, composite_risk_score: 0.0987, anomaly_detected: false, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.0125, change_vs_7d_ago: -0.0002, data_points: 9 },
    ]},
    { conflict_id: 'us_latam', label: 'US-Latin America', risk_level: 'low', probability_30d: 0.025, probability_7d: 0.0059, probability_1d: 0.0008, composite_risk_score: 0.0866, anomaly_detected: false, risk_events: [
      { event_type: 'escalation', direction: 'risk_increase', probability_30d: 0.025, change_vs_7d_ago: -0.006, data_points: 5 },
    ]},
  ]
};

// Globe hotspot positions (% of container, approximate lat/lon projection)
const HOTSPOTS = {
  russia_ukraine:   { x: 56, y: 24, label: '俄乌', dir: 'right' },
  iran_israel_us:   { x: 55, y: 40, label: '伊朗', dir: 'left' },
  israel_palestine: { x: 50, y: 47, label: '以巴', dir: 'left' },
  china_taiwan:     { x: 80, y: 35, label: '台海', dir: 'right' },
  india_pakistan:    { x: 70, y: 46, label: '印巴', dir: 'right' },
  us_latam:         { x: 28, y: 58, label: '拉美', dir: 'left' },
};

function formatProb(p) {
  if (p === null || p === undefined) return '—';
  return (p * 100).toFixed(1) + '%';
}

function riskColor(level) {
  if (level === 'high') return 'high';
  if (level === 'medium') return 'medium';
  return 'low';
}

function riskLabel(level) {
  const labels = { high: '高', medium: '中', low: '低', unknown: '—' };
  return labels[level] || level;
}

function deltaHTML(change) {
  if (change === null || change === undefined) return '';
  const pct = (change * 100).toFixed(1);
  if (change > 0.001) return `<span class="risk-delta delta-up">+${pct}%</span>`;
  if (change < -0.001) return `<span class="risk-delta delta-down">${pct}%</span>`;
  return '';
}

function renderCard(c) {
  const name = CONFLICT_NAMES[c.conflict_id] || c.label;
  const badgeClass = riskColor(c.risk_level);

  let delta7d = null;
  if (c.risk_events) {
    const esc = c.risk_events.find(e => e.event_type === 'escalation');
    if (esc) delta7d = esc.change_vs_7d_ago;
  }

  const eventsHTML = (c.risk_events || [])
    .filter(e => e.event_type !== 'other')
    .map(e => {
      const label = EVENT_LABELS[e.event_type] || e.event_type;
      const dir = e.direction || 'neutral';
      return `<span class="event-tag ${dir}">${label} ${formatProb(e.probability_30d)}</span>`;
    })
    .join('');

  // Main event description
  const mainEvent = (c.risk_events || []).find(e => e.event_type === 'escalation' || e.event_type === 'ceasefire_cancel');
  const mainLabel = mainEvent ? (EVENT_LABELS[mainEvent.event_type] || '') : '';

  // Composite score for bar
  const score = c.composite_risk_score || 0;
  const barPct = Math.min(score * 100 / 0.3, 100); // 0.3 = high threshold
  const barColor = c.risk_level === 'high' ? 'var(--risk-high)' : c.risk_level === 'medium' ? 'var(--risk-medium)' : 'var(--accent)';

  return `
    <div class="risk-card risk-card--${badgeClass}">
      <div class="risk-card-top">
        <div class="risk-card-header">
          <span class="risk-card-name">${name}</span>
          <span class="risk-badge ${badgeClass}">${riskLabel(c.risk_level)}</span>
        </div>
        <div class="risk-card-desc">${mainLabel ? mainLabel + '概率（30天）' : '综合风险'}</div>
      </div>
      <div class="risk-card-main">
        <span class="risk-main-value">${formatProb(c.probability_30d)}</span>
        ${deltaHTML(delta7d)}
      </div>
      <div class="risk-card-bar">
        <div class="risk-bar-track">
          <div class="risk-bar-fill" style="width:${barPct}%;background:${barColor};"></div>
        </div>
        <div class="risk-bar-labels">
          <span>综合评分 ${(score * 100).toFixed(0)}</span>
          <span>7天 ${formatProb(c.probability_7d)} · 1天 ${formatProb(c.probability_1d)}</span>
        </div>
      </div>
      <div class="risk-events">${eventsHTML}</div>
    </div>
  `;
}

function renderGlobe(conflicts) {
  const container = document.getElementById('globe-hotspots');
  if (!container) return;

  const probMap = {};
  conflicts.forEach(c => { probMap[c.conflict_id] = c; });

  let html = '';
  for (const [id, pos] of Object.entries(HOTSPOTS)) {
    const c = probMap[id];
    const prob = c ? formatProb(c.probability_30d) : '';
    const dirClass = pos.dir === 'left' ? 'hotspot-label-left' : '';
    html += `
      <div class="hotspot" style="left:${pos.x}%;top:${pos.y}%;">
        <div class="hotspot-dot"></div>
        <div class="hotspot-label ${dirClass}">${pos.label} <span class="hotspot-prob">${prob}</span></div>
      </div>
    `;
  }
  container.innerHTML = html;
}

async function loadRiskDashboard() {
  let data;
  try {
    // Try live data first (GitHub raw URL), then local fallback
    const liveUrl = 'https://raw.githubusercontent.com/cct15/war-dashboard-data/main/conflicts.json';
    let resp = await fetch(liveUrl);
    if (!resp.ok) resp = await fetch('data/sample-risks.json');
    data = await resp.json();
  } catch (e) {
    // file:// protocol blocks fetch — use fallback
    data = FALLBACK_DATA;
  }

  const conflicts = data.conflicts || [];

  // Render risk cards
  const dashEl = document.getElementById('risk-dashboard');
  if (dashEl) {
    dashEl.innerHTML = conflicts.map(renderCard).join('');
  }

  // Render globe hotspots
  renderGlobe(conflicts);

  // Update timestamp
  const tsEl = document.getElementById('risk-updated');
  if (tsEl && data.metadata && data.metadata.updated_at) {
    const d = new Date(data.metadata.updated_at);
    tsEl.textContent = d.toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}

document.addEventListener('DOMContentLoaded', loadRiskDashboard);
