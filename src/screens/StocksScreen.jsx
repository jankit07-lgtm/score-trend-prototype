import { useState } from 'react';
import { Search, Maximize2, BellPlus, BellRing, Lock, ChevronRight } from 'lucide-react';
import { PhoneFrame, TopBar, Card } from '../kit/Frame';
import { WeeklyScoresCard, TrendSheet, UltraSheet } from '../kit/ScoreTrend';
import { WatchSheet } from '../kit/WatchSheet';

const LOGO_BG = { ms: '#FFFFFF', nv: '#76B900', pl: '#111111', so: '#00A3E0' };

function MsLogo() {
  return <div className="grid grid-cols-2 gap-[2px] h-6 w-6"><i className="bg-[#F25022]" /><i className="bg-[#7FBA00]" /><i className="bg-[#00A4EF]" /><i className="bg-[#FFB900]" /></div>;
}

function HeaderCard({ stock, tier, watching, onWatch }) {
  const up = stock.chg >= 0;
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full grid place-items-center shrink-0 text-white text-[13px] font-bold border border-s-border" style={{ background: LOGO_BG[stock.logo] }}>
          {stock.logo === 'ms' ? <MsLogo /> : stock.symbol.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[28px] font-bold leading-none">{stock.symbol}</div>
          <div className="text-[15px] text-s-muted truncate mt-1">{stock.name}</div>
        </div>
        <button onClick={onWatch}
          className={`h-10 rounded-full px-3 flex items-center gap-1.5 text-[13px] font-semibold border shrink-0 ${watching ? 'bg-s-brandSoft border-transparent text-s-brand' : 'bg-white border-s-border'}`}>
          {watching ? <BellRing className="h-4 w-4" /> : tier === 'Free' ? <Lock className="h-4 w-4 text-s-muted" /> : <BellPlus className="h-4 w-4" />}
          {watching ? 'Watching' : 'Watch'}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[30px] font-bold">${stock.price.toFixed(2)}</div>
        <div className={`rounded-full px-4 h-10 grid place-items-center text-[16px] font-semibold ${up ? 'bg-s-brandSoft text-s-brand' : 'bg-s-lossSoft text-s-loss'}`}>
          {up ? '+' : '−'}${Math.abs(stock.chg).toFixed(2)} ({up ? '+' : '−'}{Math.abs(stock.chgPct).toFixed(2)}%)
        </div>
      </div>
      {watching && (
        <button onClick={onWatch} className="mt-3 w-full flex items-center justify-between rounded-xl bg-white border border-s-border px-3 h-11 text-[13px]">
          <span className="text-left"><span className="font-semibold">Alert for My Stock</span> <span className="text-s-muted">· {Object.values(watching).filter(Boolean).length} conditions on · Monitoring</span></span>
          <ChevronRight className="h-4 w-4 text-s-muted" />
        </button>
      )}
    </Card>
  );
}

function PriceCard({ stock }) {
  const [tf, setTf] = useState('1W');
  const cs = stock.candles;
  const lo = Math.min(...cs.map((c) => c.l), stock.ma20) * 0.995, hi = Math.max(...cs.map((c) => c.h), stock.ma20) * 1.005;
  const W = 300, H = 190, R = 44;
  const x = (i) => 6 + (i * (W - R - 12)) / (cs.length - 1);
  const y = (v) => 8 + ((hi - v) * (H - 16)) / (hi - lo);
  const ticks = [0.2, 0.5, 0.8].map((t) => lo + (hi - lo) * t);
  return (
    <Card className="p-4">
      <div className="flex gap-2">
        {['1D', '1W', '1M', '1Y', '3Y'].map((o) => (
          <button key={o} onClick={() => setTf(o)} className={`h-11 w-[52px] rounded-lg text-[16px] ${o === tf ? 'bg-s-brand text-white' : 'bg-s-chip'}`}>{o}</button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold text-s-ma">— 20D MA&nbsp; ${stock.ma20.toFixed(2)}</div>
        <button aria-label="Expand price chart" className="h-12 w-12 rounded-xl bg-white grid place-items-center"><Maximize2 className="h-5 w-5" /></button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        {ticks.map((t, i) => (
          <g key={i}><line x1="0" x2={W - R} y1={y(t)} y2={y(t)} stroke="#E4E4E4" /><text x={W - R + 6} y={y(t) + 4} fontSize="12" fill="#7F7F7F">${Math.round(t)}</text></g>
        ))}
        <line x1="6" x2={W - R - 6} y1={y(stock.ma20)} y2={y(stock.ma20)} stroke="#2F72D6" strokeWidth="2" />
        {cs.map((c, i) => {
          const g = c.c >= c.o; const col = g ? '#139756' : '#F06464';
          return (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" />
              <rect x={x(i) - 2} y={y(Math.max(c.o, c.c))} width="4" height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} />
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

export function StocksScreen({ stock, tier, watching, setWatching, toast, setToast }) {
  const [sheet, setSheet] = useState(null); // {type:'trend',focus}|{type:'ultra'}|{type:'watch'}
  const close = () => setSheet(null);

  const overlay = (
    <>
      {sheet?.type === 'trend' && <TrendSheet stock={stock} focus={sheet.focus} onClose={close} />}
      {sheet?.type === 'ultra' && <UltraSheet tier={tier} onClose={close} />}
      {sheet?.type === 'watch' && (
        <WatchSheet key={stock.symbol} stock={stock} tier={tier} watching={watching}
          onClose={close}
          onSave={(on) => { setWatching(on); close(); setToast(watching ? 'Alert updated' : `We're watching ${stock.symbol} for you`); }}
          onStop={() => { setWatching(null); close(); setToast(`Stopped watching ${stock.symbol}. Slot freed.`); }} />
      )}
      {toast && (
        <div className="absolute left-4 right-4 bottom-24 z-40 rounded-xl bg-s-text text-white text-[14px] px-4 py-3 shadow-lg" role="status">{toast}</div>
      )}
    </>
  );

  return (
    <PhoneFrame overlay={overlay}>
      <TopBar />
      <div className="mx-4 mb-4 h-14 rounded-full border border-s-border bg-s-card flex items-center gap-3 px-5">
        <Search className="h-6 w-6 text-s-muted" /><span className="text-[17px] text-s-muted">Ticker or company name</span>
      </div>
      <div className="space-y-4">
        <HeaderCard stock={stock} tier={tier} watching={watching} onWatch={() => setSheet({ type: 'watch' })} />
        <PriceCard stock={stock} />
        <WeeklyScoresCard stock={stock} tier={tier} watching={watching}
          onExpand={(focus) => setSheet({ type: 'trend', focus: typeof focus === 'string' ? focus : null })}
          onUpsell={() => setSheet({ type: 'ultra' })} />
        <Card className="p-4">
          <h2 className="text-[20px] font-semibold">Technical Analysis</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {['Ind. Support', 'Ind. Resistance', 'RSI (14)', 'Trend'].map((l, i) => (
              <div key={l} className="rounded-xl bg-white border border-s-border p-3">
                <div className="text-[12px] text-s-muted">{l}</div>
                <div className={`text-[16px] font-semibold ${i === 1 ? 'text-s-loss' : i === 0 ? 'text-s-brand' : ''}`}>
                  {i === 0 ? `$${(stock.price * 0.946).toFixed(2)}` : i === 1 ? `$${(stock.price * 1.127).toFixed(2)}` : i === 2 ? '41.8' : 'Below 20D MA'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PhoneFrame>
  );
}
