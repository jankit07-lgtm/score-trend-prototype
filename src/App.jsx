import { useEffect, useState } from 'react';
import { STOCKS } from './mocks/stocks';
import { StocksScreen } from './screens/StocksScreen';

const TIERS = ['Free', 'Pro', 'Ultra'];

function Seg({ label, value, options, onChange, notes }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-neutral-500 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} aria-pressed={o === value}
            className={`h-10 px-3.5 rounded-lg text-[14px] font-medium border ${o === value ? 'bg-s-brand text-white border-s-brand' : 'bg-white border-neutral-300'}`}>{o}</button>
        ))}
      </div>
      {notes && <div className="mt-1.5 text-[12px] text-neutral-600 leading-snug">{notes}</div>}
    </div>
  );
}

export default function App() {
  const [tier, setTier] = useState('Ultra');
  const [sym, setSym] = useState('MSFT');
  const [watch, setWatch] = useState({});
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  const stock = STOCKS[sym];
  const watching = tier === 'Free' ? null : watch[sym] ?? null;

  return (
    <div className="min-h-screen flex flex-wrap justify-center items-start gap-8 p-4 sm:p-8">
      <aside className="w-full max-w-[375px] lg:w-[300px] space-y-5 lg:pt-6">
        <div>
          <div className="text-[13px] text-neutral-500">StonksAI prototype · Stocks page</div>
          <h1 className="text-[22px] font-bold leading-tight mt-0.5">Weekly score trends (Ultra)</h1>
          <p className="text-[13px] text-neutral-600 mt-1">The Weekly Scores card shows 3-month sparklines for FQS, TMS and DVES. Tap a row or ⤢ to open the full chart. The Watch button opens Alert for My Stock.</p>
        </div>
        <Seg label="Plan" value={tier} options={TIERS} onChange={setTier}
          notes={tier === 'Ultra' ? 'Trends are unlocked.' : 'Current scores visible; trends blurred with an Ultra prompt.'} />
        <Seg label="Stock (demo case)" value={sym} options={Object.keys(STOCKS)} onChange={setSym} notes={stock.note} />
        <div className="text-[11px] text-neutral-500 border-t border-neutral-300 pt-3">Mock data. Scores and prices are illustrative.</div>
      </aside>
      <StocksScreen key={sym + tier} stock={stock} tier={tier} watching={watching}
        setWatching={(v) => setWatch((w) => ({ ...w, [sym]: v }))} toast={toast} setToast={setToast} />
    </div>
  );
}
