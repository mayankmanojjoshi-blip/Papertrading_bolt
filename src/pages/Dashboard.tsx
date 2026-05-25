import { Trade } from '../types';
import { calcUnrealizedPnL, calcRealizedPnL, formatCurrency, formatPlain } from '../storage';

interface Props {
  capital: number;
  trades: Trade[];
  onNavigate: (p: 'quick-trade' | 'positions') => void;
}

function StatCard({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${valueClass ?? 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ capital, trades, onNavigate }: Props) {
  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status === 'CLOSED');

  const totalUnrealized = openTrades.reduce((sum, t) => sum + calcUnrealizedPnL(t), 0);
  const totalRealized = closedTrades.reduce((sum, t) => sum + calcRealizedPnL(t), 0);
  const overallPnL = totalUnrealized + totalRealized;

  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.timestamp.startsWith(today));
  const todayPnL = todayTrades.reduce((sum, t) => {
    if (t.status === 'OPEN') return sum + calcUnrealizedPnL(t);
    return sum + calcRealizedPnL(t);
  }, 0);

  const wins = closedTrades.filter(t => calcRealizedPnL(t) > 0).length;
  const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : '—';

  const recent = [...trades].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);

  function pnlClass(v: number) {
    if (v > 0) return 'text-emerald-400';
    if (v < 0) return 'text-red-400';
    return 'text-zinc-400';
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Dashboard</h1>
        <button
          onClick={() => onNavigate('quick-trade')}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
        >
          + New Trade
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Capital" value={`₹${formatPlain(capital)}`} />
        <StatCard
          label="Today's P&L"
          value={formatCurrency(todayPnL)}
          valueClass={pnlClass(todayPnL)}
        />
        <StatCard
          label="Overall P&L"
          value={formatCurrency(overallPnL)}
          valueClass={pnlClass(overallPnL)}
        />
        <StatCard
          label="Unrealized"
          value={formatCurrency(totalUnrealized)}
          valueClass={pnlClass(totalUnrealized)}
        />
        <StatCard
          label="Open Positions"
          value={String(openTrades.length)}
          sub="active trades"
        />
        <StatCard
          label="Win Rate"
          value={winRate === '—' ? '—' : `${winRate}%`}
          sub={`${wins}/${closedTrades.length} closed`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-300">Open Positions</span>
            <button
              onClick={() => onNavigate('positions')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View all →
            </button>
          </div>
          {openTrades.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No open positions</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {openTrades.slice(0, 5).map(t => {
                const pnl = calcUnrealizedPnL(t);
                return (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{t.symbol}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${t.optionType === 'CE' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {t.optionType}
                      </span>
                      <span className="text-xs text-zinc-500">{t.strikePrice}</span>
                    </div>
                    <span className={`text-sm font-semibold ${pnlClass(pnl)}`}>{formatCurrency(pnl)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-300">Recent Trades</span>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No trades yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recent.map(t => {
                const pnl = t.status === 'OPEN' ? calcUnrealizedPnL(t) : calcRealizedPnL(t);
                const date = new Date(t.timestamp);
                return (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${t.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {t.direction}
                      </span>
                      <span className="text-sm text-zinc-200">{t.symbol} {t.strikePrice} {t.optionType}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${pnlClass(pnl)}`}>{formatCurrency(pnl)}</span>
                      <span className="text-xs text-zinc-600">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
