// Mock data for the score-trend prototype. Weekly scores refresh every Friday after close.
const WEEKS = 26;
const LAST_REFRESH = new Date('2026-11-20T00:00:00');

export const weekDates = Array.from({ length: WEEKS }, (_, i) => {
  const d = new Date(LAST_REFRESH);
  d.setDate(d.getDate() - 7 * (WEEKS - 1 - i));
  return d;
});

export const fmtWeek = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// deterministic pseudo-random
function rng(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

// Build a weekly series that ends at `end`, drifting from `start`; null = no data that week
function series(seed, start, end, { startAt = 0, gaps = [] } = {}) {
  const r = rng(seed);
  return weekDates.map((_, i) => {
    if (i < startAt || gaps.includes(i)) return null;
    const t = (i - startAt) / Math.max(1, WEEKS - 1 - startAt);
    const v = start + (end - start) * t + (r() - 0.5) * 12;
    return Math.max(0, Math.min(100, Math.round(i === WEEKS - 1 ? end : v)));
  });
}

function candles(seed, last, n = 38, vol = 0.006) {
  const r = rng(seed);
  let p = last * (1 + (r() - 0.45) * 0.06);
  const out = [];
  for (let i = 0; i < n; i++) {
    const target = i === n - 1 ? last : p * (1 + (r() - 0.5) * vol * 3);
    const o = p, c = target;
    const h = Math.max(o, c) * (1 + r() * vol), l = Math.min(o, c) * (1 - r() * vol);
    out.push({ o, h, l, c });
    p = c;
  }
  return out;
}

export const STOCKS = {
  MSFT: {
    symbol: 'MSFT', name: 'Microsoft Corporation', logo: 'ms', price: 492.76, chg: 0.25, chgPct: 0.05, ma20: 518.95,
    universe: true, inPlan: false,
    candles: candles(7, 492.76),
    scores: {
      FQS: series(11, 62, 71),
      TMS: series(23, 74, 48),
      DVES: series(37, 44, 63, { startAt: 6 }), // DVES launched ~20 weeks ago
      SMAS: 58,
    },
    note: 'Typical case. DVES has only 20 weeks of history.',
  },
  NVDA: {
    symbol: 'NVDA', name: 'NVIDIA Corporation', logo: 'nv', price: 182.41, chg: -2.13, chgPct: -1.15, ma20: 179.6,
    universe: true, inPlan: true,
    candles: candles(19, 182.41, 38, 0.009),
    scores: {
      FQS: series(5, 70, 78, { gaps: [21] }),
      TMS: series(9, 52, 66, { gaps: [21] }),
      DVES: series(13, 58, 61, { startAt: 6, gaps: [21] }),
      SMAS: 64,
    },
    note: 'One weekly refresh missing (Oct 16), all scores at 60+.',
  },
  PLTR: {
    symbol: 'PLTR', name: 'Palantir Technologies', logo: 'pl', price: 168.9, chg: 3.42, chgPct: 2.07, ma20: 161.2,
    universe: true, inPlan: false, newToUniverse: true,
    candles: candles(29, 168.9, 38, 0.012),
    scores: {
      FQS: series(41, 50, 55, { startAt: 23 }),
      TMS: series(43, 70, 77, { startAt: 23 }),
      DVES: series(47, 60, 52, { startAt: 23 }),
      SMAS: 61,
    },
    note: 'Joined the Universe 3 weeks ago.',
  },
  SOFI: {
    symbol: 'SOFI', name: 'SoFi Technologies', logo: 'so', price: 27.84, chg: -0.31, chgPct: -1.1, ma20: 28.4,
    universe: false, inPlan: false,
    candles: candles(53, 27.84, 38, 0.01),
    scores: null,
    note: 'Not in the Universe, so it has no scores.',
  },
};

export const SCORE_META = [
  { key: 'FQS', name: 'Fundamental Quality', color: '#2F72D6' },
  { key: 'TMS', name: 'Technical Momentum', color: '#8C4BCD' },
  { key: 'DVES', name: 'Derivative Volatility Edge', color: '#C77700' },
];

export const THRESHOLD = 60;
export const ULTRA_LAUNCH = 'Dec 14';
