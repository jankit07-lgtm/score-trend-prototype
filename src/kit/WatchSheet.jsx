import { useState } from 'react';
import { Lock, BellPlus } from 'lucide-react';

const SLOTS = { Pro: { used: 3, max: 5 }, Ultra: { used: 4, max: 20 } };

export function conditionsFor(stock) {
  const scores = stock.scores;
  const all60 = scores && ['FQS', 'TMS', 'DVES'].every((k) => scores[k][scores[k].length - 1] >= 60) && scores.SMAS >= 60;
  return [
    { key: 'support', title: 'Price at support with bullish divergence', sub: `Ind. Support $${(stock.price * 0.946).toFixed(2)}` },
    { key: 'resistance', title: 'Price at resistance with bearish divergence', sub: `Ind. Resistance $${(stock.price * 1.127).toFixed(2)}` },
    { key: 'plan', title: "Picked in this week's StonksAI plan", universe: true, now: stock.inPlan ? "Right now: in this week's plan" : null },
    { key: 'scores', title: 'All four weekly scores reach 60+', universe: true, now: all60 ? 'Right now: all four are at 60+' : null },
  ];
}

export function WatchSheet({ stock, tier, watching, onSave, onStop, onClose }) {
  const conds = conditionsFor(stock);
  const [on, setOn] = useState(() => watching ?? Object.fromEntries(conds.map((c) => [c.key, !(c.universe && !stock.universe)])));
  const slots = SLOTS[tier];
  const anyOn = Object.values(on).some(Boolean);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="sheet-in bg-white rounded-t-3xl p-5 pb-7 max-h-[92%] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto h-1 w-10 rounded-full bg-s-border" />
        {tier === 'Free' ? (
          <>
            <div className="mt-5 h-12 w-12 rounded-2xl bg-s-brandSoft grid place-items-center"><Lock className="h-6 w-6 text-s-brand" /></div>
            <h3 className="mt-3 text-[20px] font-semibold">Let StonksAI watch {stock.symbol} for you</h3>
            <p className="mt-1 text-[14px] text-s-muted">Stock alerts are part of Pro (5 stocks) and Ultra (20 stocks). We'll notify you at support, at resistance, when it's picked in the weekly plan, or when all four scores reach 60+.</p>
            <button className="mt-5 w-full h-12 rounded-full bg-s-brand text-white font-semibold">See plans</button>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-[20px] font-semibold">{watching ? `Edit alert for ${stock.symbol}` : `Watch ${stock.symbol}`}</h3>
              <span className="text-[12px] text-s-muted">{watching ? slots.used + 1 : slots.used} of {slots.max} used</span>
            </div>
            <p className="mt-1 text-[13px] text-s-muted">We'll send a push notification when any condition you keep on becomes true.</p>
            <div className="mt-4 rounded-xl border border-s-border divide-y divide-s-border">
              {conds.map((c) => {
                const locked = c.universe && !stock.universe;
                return (
                  <div key={c.key} className="flex items-center gap-3 px-3 py-3">
                    <div className="flex-1">
                      <div className={`text-[14px] font-medium ${locked ? 'text-s-dim' : ''}`}>{c.title}</div>
                      {locked ? <div className="text-[12px] text-s-dim">Only for stocks in our Universe</div>
                        : c.now ? <div className="text-[12px] text-s-brand font-medium">{c.now}</div>
                        : c.sub ? <div className="text-[12px] text-s-muted">{c.sub}</div>
                        : <div className="text-[12px] text-s-muted">Checked at each weekly refresh</div>}
                    </div>
                    {locked ? <Lock className="h-4 w-4 text-s-dim" /> : (
                      <button role="switch" aria-checked={!!on[c.key]} aria-label={c.title}
                        onClick={() => setOn((o) => ({ ...o, [c.key]: !o[c.key] }))}
                        className={`h-7 w-12 rounded-full p-0.5 transition ${on[c.key] ? 'bg-s-brand' : 'bg-s-border'}`}>
                        <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${on[c.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-s-muted">Price conditions are checked every 15 min in market hours. Alerts describe market conditions; they aren't a recommendation to buy or sell.</p>
            <button disabled={!anyOn} onClick={() => onSave(on)}
              className={`mt-4 w-full h-12 rounded-full text-white font-semibold flex items-center justify-center gap-2 ${anyOn ? 'bg-s-brand' : 'bg-s-brandDisabled'}`}>
              <BellPlus className="h-5 w-5" />{watching ? 'Save changes' : `Start watching ${stock.symbol}`}
            </button>
            {watching && <button onClick={onStop} className="mt-2 w-full h-11 text-s-loss text-[14px] font-medium">Stop watching</button>}
          </>
        )}
      </div>
    </div>
  );
}
