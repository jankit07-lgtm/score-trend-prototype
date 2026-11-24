import { Bell, Bike, Bot, Target, SearchCheck, ChartColumnIncreasing, Settings } from 'lucide-react';

export function PhoneFrame({ children, overlay }) {
  return (
    <div className="relative w-[375px] max-w-full h-[812px] rounded-[44px] overflow-hidden flex flex-col bg-white ring-8 ring-black shadow-2xl">
      <StatusBar />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" id="scroller">{children}</div>
      <SaiFab />
      <BottomNav />
      {overlay}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-10 shrink-0 flex items-center justify-between px-7 text-[14px] font-medium text-s-text">
      <span>12:58</span><span className="tracking-widest text-[11px]">●●● ᯤ ▮</span>
    </div>
  );
}

export function Logo({ size = 48 }) {
  return (
    <div className="rounded-full bg-s-brandDark grid place-items-center text-white" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 17l5-6 4 3 6-8" /><path d="M14 6h4v4" /><path d="M5 9c1-2 3-3 5-3" />
      </svg>
    </div>
  );
}

export function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 h-16">
      <Logo />
      <div className="flex items-center gap-6">
        <Bike className="h-7 w-7" strokeWidth={1.75} />
        <div className="relative">
          <Bell className="h-7 w-7" strokeWidth={1.75} />
          <span className="absolute -top-2 -right-3 h-5 min-w-5 px-1 rounded-full bg-s-brand text-[10px] font-semibold grid place-items-center text-white">99+</span>
        </div>
      </div>
    </div>
  );
}

function SaiFab() {
  return (
    <button aria-label="Ask Sai" className="absolute left-3 bottom-24 h-14 w-14 rounded-full bg-s-brand text-white grid place-items-center ring-4 ring-white shadow-lg z-10">
      <Bot className="h-7 w-7" />
    </button>
  );
}

const TABS = [
  { label: 'Plan', icon: Target },
  { label: 'Trades', icon: SearchCheck },
  { label: 'Stocks', icon: ChartColumnIncreasing },
  { label: 'Settings', icon: Settings },
];
function BottomNav() {
  return (
    <nav className="absolute bottom-0 inset-x-0 h-20 grid grid-cols-4 pb-3 bg-s-nav">
      {TABS.map(({ label, icon: Icon }) => {
        const on = label === 'Stocks';
        return (
          <div key={label} className={`flex flex-col items-center justify-center gap-1 text-[13px] ${on ? 'text-s-brand' : 'text-s-muted'}`}>
            <Icon className="h-6 w-6" strokeWidth={1.75} />
            <span>{label}</span>
            <span className={`h-0.5 w-10 rounded-full ${on ? 'bg-s-brand' : 'bg-transparent'}`} />
          </div>
        );
      })}
    </nav>
  );
}

export const Card = ({ className = '', children }) => (
  <section className={`mx-4 rounded-2xl bg-s-card border border-s-border ${className}`}>{children}</section>
);
