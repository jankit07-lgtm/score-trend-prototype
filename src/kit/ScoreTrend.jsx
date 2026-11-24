import { useMemo, useRef, useState } from 'react';
import { Maximize2, Lock, X, Info, CircleAlert } from 'lucide-react';
import { SCORE_META, THRESHOLD, weekDates, fmtWeek, ULTRA_LAUNCH } from '../mocks/stocks';
import { Card } from './Frame';

const SPARK_WEEKS = 13; // 3 months
const RANGES = [{ label: '3M', w: 13 }, { label: '6M', w: 26 }, { label: '1Y', w: 52 }];

// ---------- helpers ----------
const lastIdx = (arr) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return i; return -1; };
const prevIdx = (arr, from) => { for (let i = from - 1; i >= 0; i--) if (arr[i] != null) return i; return -1; };
const countPts = (arr) => arr.filter((v) => v != null).length;

// Step path across a window; null breaks the line
function stepPaths(vals, x, y) {
  const segs = []; let d = '';
  vals.forEach((v, i) => {
    if (v == null) { if (d) segs.push(d); d = ''; return; }
    if (!d) d = `M${x(i)},${y(v)}`;
    else d += ` H${x(i)} V${y(v)}`;
  });
  if (d) segs.push(d);
  return segs;
}
// dotted bridges over gaps (missed refresh)
function gapBridges(vals, x, y) {
  const out = [];
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] != null && vals[i - 1] == null) {
      const p = prevIdx(vals, i);
      if (p >= 0) out.push({ x1: x(p), y1: y(vals[p]), x2: x(i), y2: y(vals[i]) });
    }
  }
  return out;
}

// ---------- sparkline ----------
export function Sparkline({ vals, color, w = 132, h = 40 }) {
  const pad = 4;
  // Auto-scale to the data but always keep the 60 line in view, with a minimum 20-pt span
  const pts = vals.filter((v) => v != null);
  let lo = Math.min(THRESHOLD, ...pts) - 4, hi = Math.max(THRESHOLD, ...pts) + 4;
  if (hi - lo < 20) { const m = (hi + lo) / 2; lo = m - 10; hi = m + 10; }
  const x = (i) => pad + (i * (w - pad * 2)) / (vals.length - 1);
  const y = (v) => pad + ((hi - v) * (h - pad * 2)) / (hi - lo);
  const li = lastIdx(vals);
  const n = countPts(vals);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="block">
      <rect x={0} y={0} width={w} height={Math.max(0, y(THRESHOLD))} fill="#139756" opacity="0.07" />
      <line x1={0} x2={w} y1={y(THRESHOLD)} y2={y(THRESHOLD)} stroke="#9A9A9A" strokeDasharray="3 3" strokeWidth="0.8" />
      {gapBridges(vals, x, y).map((b, i) => (
        <line key={i} {...b} stroke={color} strokeDasharray="2 2" strokeWidth="1.2" opacity="0.6" />
      ))}
      {n >= 2 && stepPaths(vals, x, y).map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      ))}
      {n < 4 && vals.map((v, i) => v != null && <circle key={i} cx={x(i)} cy={y(v)} r="2.2" fill={color} />)}
      {li >= 0 && <circle cx={x(li)} cy={y(vals[li])} r="3.2" fill={color} stroke="#fff" strokeWidth="1.5" />}
    </svg>
  );
}

function Delta({ vals }) {
  const li = lastIdx(vals); const pi = prevIdx(vals, li);
  if (li < 0 || pi < 0) return <span className="text-[11px] text-s-muted">new</span>;
  const d = vals[li] - vals[pi];
  if (d === 0) return <span className="text-[11px] text-s-muted">± 0 wk</span>;
  return <span className={`text-[11px] font-medium whitespace-nowrap ${d > 0 ? 'text-s-brand' : 'text-s-loss'}`}>{d > 0 ? '+' : '−'}{Math.abs(d)} wk</span>;
}

// ---------- the card on the Stocks page ----------
export function WeeklyScoresCard({ stock, tier, onExpand, onUpsell, watching }) {
  const ultra = tier === 'Ultra';
  if (!stock.universe) {
    return (
      <Card className="p-4">
        <h2 className="text-[20px] font-semibold">Weekly Scores</h2>
        <p className="mt-3 rounded-xl bg-white border border-s-border p-3 text-[14px] text-s-muted">
          {stock.symbol} isn't in the StonksAI Universe yet, so it has no weekly scores or score trends.
        </p>
      </Card>
    );
  }
  const sc = stock.scores;
  const last = lastIdx(sc.FQS);
  const all60 = SCORE_META.every((m) => (sc[m.key][lastIdx(sc[m.key])] ?? 0) >= THRESHOLD) && sc.SMAS >= THRESHOLD;
  const win = (arr) => arr.slice(-SPARK_WEEKS);
  const shortHistory = SCORE_META.every((m) => countPts(win(sc[m.key])) < 4);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[20px] font-semibold leading-tight">Weekly Scores</h2>
          <div className="text-[12px] text-s-muted mt-0.5">
            Updated {fmtWeek(weekDates[last])} · {ultra ? 'last 3 months' : 'this week'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {all60 && <span className="rounded-full bg-s-brandSoft text-s-brand text-[11px] font-semibold px-2 py-0.5">ALL 4 ≥ 60</span>}
          <button
            onClick={ultra ? onExpand : onUpsell}
            aria-label={ultra ? 'Open score trend' : 'Score trend is an Ultra feature'}
            className="h-11 w-11 rounded-xl bg-white border border-s-border grid place-items-center relative"
          >
            <Maximize2 className="h-5 w-5" />
            {!ultra && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-s-ultra bg-white rounded-full" />}
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white border border-s-border divide-y divide-s-border relative overflow-hidden">
        {SCORE_META.map((m) => {
          const vals = win(sc[m.key]);
          const li = lastIdx(vals);
          const v = li >= 0 ? vals[li] : null;
          return (
            <button key={m.key} onClick={ultra ? () => onExpand(m.key) : onUpsell}
              className="w-full flex items-center gap-3 px-3 py-2 text-left min-h-[56px]">
              <div className="w-[68px] shrink-0">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold"><i className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.key}</div>
                <div className="text-[10.5px] leading-tight text-s-muted">{m.name}</div>
              </div>
              <div className={`flex-1 flex justify-center ${ultra ? '' : 'blur-[3px] opacity-60'}`}>
                <Sparkline vals={vals} color={m.color} />
              </div>
              <div className="w-[52px] text-right shrink-0">
                <div className={`text-[20px] font-semibold leading-none ${v >= THRESHOLD ? 'text-s-brand' : 'text-s-text'}`}>{v ?? '–'}</div>
                {ultra && <Delta vals={vals} />}
              </div>
            </button>
          );
        })}
        <div className="flex items-center gap-3 px-3 py-2 min-h-[44px]">
          <div className="w-[68px] shrink-0">
            <div className="text-[14px] font-semibold flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-s-dim" />SMAS</div>
            <div className="text-[10.5px] leading-tight text-s-muted">Sentiment & Macro</div>
          </div>
          <div className="flex-1 text-center text-[11px] text-s-dim">Current score only</div>
          <div className={`w-[52px] text-right text-[20px] font-semibold ${sc.SMAS >= THRESHOLD ? 'text-s-brand' : ''}`}>{sc.SMAS}</div>
        </div>

        {!ultra && (
          <div className="absolute inset-x-0 top-0 h-[168px] grid place-items-center pointer-events-none">
            <button onClick={onUpsell} className="pointer-events-auto flex items-center gap-2 rounded-full bg-s-ultra text-white text-[13px] font-semibold pl-3 pr-4 h-10 shadow-md">
              <Lock className="h-4 w-4" /> See 3-month trends with Ultra
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-s-muted">
        <svg width="18" height="6" aria-hidden><line x1="0" x2="18" y1="3" y2="3" stroke="#9A9A9A" strokeDasharray="3 3" /></svg>
        60 = alert level{ultra && shortHistory && ' · trend fills in as weekly refreshes arrive'}
        {watching?.scores && <span className="ml-auto text-s-brand font-medium">Alert on at 4 × 60+</span>}
      </div>
    </Card>
  );
}

// ---------- expanded view ----------
export function TrendSheet({ stock, focus, onClose }) {
  const sc = stock.scores;
  const maxPts = Math.max(...SCORE_META.map((m) => countPts(sc[m.key])));
  // A range appears only once some score has more history than the range below it
  const ranges = RANGES.filter((r, i) => i === 0 || maxPts > RANGES[i - 1].w);
  const [range, setRange] = useState(13);
  const [on, setOn] = useState(() => Object.fromEntries(SCORE_META.map((m) => [m.key, true])));
  const [hi, setHi] = useState(null);
  const svgRef = useRef(null);

  const n = range;
  const dates = weekDates.slice(-n);
  const data = useMemo(() => Object.fromEntries(SCORE_META.map((m) => [m.key, sc[m.key].slice(-n)])), [sc, n]);

  const W = 335, H = 220, L = 26, R = 10, T = 10, B = 24;
  const x = (i) => L + (i * (W - L - R)) / (n - 1);
  const y = (v) => T + ((100 - v) * (H - T - B)) / 100;
  const cur = hi ?? lastIdx(data.FQS);

  const pick = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) * (W / r.width);
    setHi(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))));
  };
  const monthTicks = dates.map((d, i) => ({ d, i }))
    .filter(({ d, i }) => i > 0 && d.getMonth() !== dates[i - 1].getMonth())
    .filter((t, k, a) => k === 0 ? t.i >= 2 || true : t.i - a[k - 1].i >= 3);
  const starts = {};
  SCORE_META.filter((m) => on[m.key]).forEach((m) => {
    const f = data[m.key].findIndex((v) => v != null);
    if (f > 0) (starts[f] ??= []).push(m.key);
  });
  const nOn = SCORE_META.filter((m) => on[m.key]).length;
  const startMarks = Object.entries(starts).map(([i, keys]) => ({
    i: +i, label: keys.length === nOn && nOn > 1 ? 'History starts' : `${keys.join(', ')} starts`,
  }));
  const missing = SCORE_META.some((m) => on[m.key] && data[m.key][cur] == null && data[m.key].slice(0, cur).some((v) => v != null));

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="sheet-in bg-white rounded-t-3xl max-h-[92%] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white pt-2 pb-3 px-4 z-10">
          <div className="mx-auto h-1 w-10 rounded-full bg-s-border" />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[18px] font-semibold">{stock.symbol} · Score trend</div>
              <div className="text-[12px] text-s-muted">Weekly refresh · Fridays after close</div>
            </div>
            <button aria-label="Close" onClick={onClose} className="h-11 w-11 rounded-xl bg-s-card grid place-items-center"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-center gap-2">
            {ranges.map((r) => (
              <button key={r.label} onClick={() => { setRange(r.w); setHi(null); }}
                className={`h-9 px-4 rounded-lg text-[14px] font-medium ${range === r.w ? 'bg-s-brand text-white' : 'bg-s-chip'}`}>{r.label}</button>
            ))}
            {ranges.length < RANGES.length && <span className="ml-auto text-[11px] text-s-muted">{maxPts} weeks of history so far</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SCORE_META.map((m) => (
              <button key={m.key} onClick={() => setOn((o) => ({ ...o, [m.key]: !o[m.key] }))}
                aria-pressed={on[m.key]}
                className={`h-9 px-3 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 ${on[m.key] ? 'bg-white' : 'bg-s-card text-s-dim border-transparent'}`}
                style={on[m.key] ? { borderColor: m.color, color: m.color } : {}}>
                <i className="h-2 w-2 rounded-full" style={{ background: on[m.key] ? m.color : '#C8C8C8' }} />{m.key}
              </button>
            ))}
          </div>

          {/* readout */}
          <div className="mt-3 rounded-xl bg-s-card px-3 py-2">
            <div className="text-[12px] text-s-muted">Week of {fmtWeek(dates[cur])}{hi == null ? ' · latest' : ''}</div>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {SCORE_META.map((m) => {
                const v = data[m.key][cur];
                return (
                  <div key={m.key} className={on[m.key] ? '' : 'opacity-40'}>
                    <div className="text-[11px] font-semibold" style={{ color: m.color }}>{m.key}</div>
                    <div className={`text-[20px] font-semibold leading-tight ${v >= THRESHOLD ? 'text-s-brand' : ''}`}>{v ?? '–'}</div>
                  </div>
                );
              })}
            </div>
            {missing && <div className="mt-1 text-[11px] text-s-muted flex items-center gap-1"><CircleAlert className="h-3 w-3" />No refresh published this week</div>}
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full touch-none select-none"
            onMouseMove={pick} onTouchStart={pick} onTouchMove={pick} onMouseLeave={() => setHi(null)}>
            <rect x={L} y={y(100)} width={W - L - R} height={y(THRESHOLD) - y(100)} fill="#139756" opacity="0.06" />
            {[0, 20, 40, 60, 80, 100].map((t) => (
              <g key={t}>
                <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={t === THRESHOLD ? '#8A8A8A' : '#ECECEC'} strokeDasharray={t === THRESHOLD ? '4 3' : ''} />
                <text x={L - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={t === THRESHOLD ? '#202020' : '#9A9A9A'} fontWeight={t === THRESHOLD ? 600 : 400}>{t}</text>
              </g>
            ))}
            {monthTicks.map(({ d, i }) => (
              <text key={i} x={x(i)} y={H - 6} fontSize="10" fill="#9A9A9A" textAnchor="middle">{d.toLocaleDateString('en-US', { month: 'short' })}</text>
            ))}
            {SCORE_META.filter((m) => on[m.key]).map((m) => {
              const vals = data[m.key];
              return (
                <g key={m.key}>
                  {gapBridges(vals, x, y).map((b, i) => <line key={i} {...b} stroke={m.color} strokeDasharray="3 3" strokeWidth="1.5" opacity="0.6" />)}
                  {stepPaths(vals, x, y).map((d, i) => <path key={i} d={d} fill="none" stroke={m.color} strokeWidth={focus === m.key ? 3 : 2.2} strokeLinejoin="round" />)}
                  {countPts(vals) < 4 && vals.map((v, i) => v != null && <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={m.color} />)}
                  {vals[cur] != null && <circle cx={x(cur)} cy={y(vals[cur])} r="4" fill={m.color} stroke="#fff" strokeWidth="1.5" />}
                </g>
              );
            })}
            {startMarks.map((g, k) => (
              <g key={g.i}>
                <line x1={x(g.i)} x2={x(g.i)} y1={T} y2={H - B} stroke="#8A8A8A" strokeDasharray="2 3" />
                <text x={x(g.i) + 3} y={T + 9 + k * 11} fontSize="9.5" fill="#7F7F7F">{g.label} {fmtWeek(dates[g.i])}</text>
              </g>
            ))}
            <line x1={x(cur)} x2={x(cur)} y1={T} y2={H - B} stroke="#202020" strokeWidth="0.8" opacity="0.35" />
          </svg>
          <div className="text-[11px] text-s-muted -mt-1">Drag across the chart to read any week.</div>

          {/* summary */}
          <div className="mt-4 rounded-xl border border-s-border divide-y divide-s-border">
            {SCORE_META.map((m) => {
              const vals = data[m.key];
              const li = lastIdx(vals); const fi = vals.findIndex((v) => v != null);
              const pts = countPts(vals);
              const ch = li >= 0 && fi >= 0 ? vals[li] - vals[fi] : 0;
              const above = vals.filter((v) => v != null && v >= THRESHOLD).length;
              return (
                <div key={m.key} className="flex items-center px-3 py-2.5 text-[13px]">
                  <span className="w-14 font-semibold" style={{ color: m.color }}>{m.key}</span>
                  <span className="flex-1 text-s-muted">
                    {pts < 2 ? 'Not enough history yet' : <>
                      <span className={ch > 0 ? 'text-s-brand font-medium' : ch < 0 ? 'text-s-loss font-medium' : ''}>{ch > 0 ? '+' : ch < 0 ? '−' : ''}{Math.abs(ch)}</span> over {pts} wks · {above} of {pts} at 60+
                    </>}
                  </span>
                  <span className={`text-[16px] font-semibold ${vals[li] >= THRESHOLD ? 'text-s-brand' : ''}`}>{vals[li] ?? '–'}</span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 mb-6 flex gap-2 text-[11px] leading-snug text-s-muted">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Scores refresh once a week and don't react to intraday news. Lines hold flat between refreshes. A trend describes past scores; it isn't a recommendation to buy or sell.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- upsell ----------
export function UltraSheet({ tier, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="sheet-in bg-white rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto h-1 w-10 rounded-full bg-s-border" />
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-s-ultraSoft text-s-ultra text-[11px] font-semibold px-2.5 py-1">ULTRA · FROM {ULTRA_LAUNCH.toUpperCase()}</div>
        <h3 className="mt-3 text-[20px] font-semibold">See where the scores are heading</h3>
        <p className="mt-1 text-[14px] text-s-muted">Ultra shows 3-month, 6-month and 1-year trends for FQS, TMS and DVES on every Universe stock, so you can tell an improving 62 from a fading one.</p>
        <ul className="mt-3 space-y-1.5 text-[14px]">
          <li>• Week-by-week trend lines with the 60 alert level</li>
          <li>• Change since last week on every score</li>
          <li>• 20 stock picks a day and 20 stock alerts</li>
        </ul>
        <button className="mt-5 w-full h-12 rounded-full bg-s-ultra text-white font-semibold">Notify me when Ultra launches</button>
        <button onClick={onClose} className="mt-2 w-full h-11 text-s-muted text-[14px]">Not now{tier === 'Pro' ? '' : ''}</button>
      </div>
    </div>
  );
}
