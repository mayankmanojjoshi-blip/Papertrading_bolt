import { Trade } from '../types';
import { calcRealizedPnL, formatCurrency } from '../storage';

interface Props {
  trades: Trade[];
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-sm font-semibold ${valueClass ?? 'text-zinc-100'}`}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">{title}</p>
      {children}
    </div>
  );
}

export default function Statistics({ trades }: Props) {
  const closed = trades.filter(t => t.status === 'CLOSED');
  const open = trades.filter(t => t.status === 'OPEN');
  const total = trades.length;

  const pnls = closed.map(t => calcRealizedPnL(t));
  const wins = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);

  const winRate = closed.length > 0 ? ((wins.length / closed.length) * 100).toFixed(1) : '—';
  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : null;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : null;
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : null;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : null;
  const totalRealized = pnls.reduce((a, b) => a + b, 0);
  const profitFactor = losses.length > 0 && Math.abs(losses.reduce((a, b) => a + b, 0)) > 0
    ? (wins.reduce((a, b) => a + b, 0) / Math.abs(losses.reduce((a, b) => a + b, 0))).toFixed(2)
    : '—';

  // Streak
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let cur = 0;
  for (const p of pnls) {
    if (p > 0) {
      cur = cur > 0 ? cur + 1 : 1;
      maxWinStreak = Math.max(maxWinStreak, cur);
    } else if (p < 0) {
      cur = cur < 0 ? cur - 1 : -1;
      maxLossStreak = Math.max(maxLossStreak, Math.abs(cur));
    } else {
      cur = 0;
    }
  }
  currentStreak = cur;

  // Daily performance
  const byDay: Record<string, number> = {};
  for (const t of closed) {
    const day = (t.closedAt ?? t.timestamp).split('T')[0];
    byDay[day] = (byDay[day] ?? 0) + calcRealizedPnL(t);
  }
  const days = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);

  function pnlClass(v: number) {
    if (v > 0) return 'text-emerald-400';
    if (v < 0) return 'text-red-400';
    return 'text-zinc-400';
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-lg font-semibold text-zinc-100">Statistics</h1>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Overview">
          <Row label="Total Trades" value={String(total)} />
          <Row label="Open" value={String(open.length)} />
          <Row label="Closed" value={String(closed.length)} />
          <Row label="Total Realized" value={formatCurrency(totalRealized)} valueClass={pnlClass(totalRealized)} />
        </Section>

        <Section title="Win/Loss">
          <Row label="Win Rate" value={winRate === '—' ? '—' : `${winRate}%`} valueClass={Number(winRate) >= 50 ? 'text-emerald-400' : 'text-red-400'} />
          <Row label="Wins" value={String(wins.length)} valueClass="text-emerald-400" />
          <Row label="Losses" value={String(losses.length)} valueClass="text-red-400" />
          <Row label="Profit Factor" value={String(profitFactor)} />
        </Section>

        <Section title="Averages">
          <Row label="Avg Win" value={avgWin !== null ? formatCurrency(avgWin) : '—'} valueClass="text-emerald-400" />
          <Row label="Avg Loss" value={avgLoss !== null ? formatCurrency(avgLoss) : '—'} valueClass="text-red-400" />
          <Row label="Best Trade" value={bestTrade !== null ? formatCurrency(bestTrade) : '—'} valueClass="text-emerald-400" />
          <Row label="Worst Trade" value={worstTrade !== null ? formatCurrency(worstTrade) : '—'} valueClass="text-red-400" />
        </Section>

        <Section title="Streaks">
          <Row label="Current Streak" value={currentStreak === 0 ? '—' : currentStreak > 0 ? `+${currentStreak} W` : `${Math.abs(currentStreak)} L`}
            valueClass={currentStreak > 0 ? 'text-emerald-400' : currentStreak < 0 ? 'text-red-400' : 'text-zinc-400'} />
          <Row label="Best Win Streak" value={maxWinStreak > 0 ? `${maxWinStreak} W` : '—'} valueClass="text-emerald-400" />
          <Row label="Worst Loss Streak" value={maxLossStreak > 0 ? `${maxLossStreak} L` : '—'} valueClass="text-red-400" />
        </Section>
      </div>

      {days.length > 0 && (
        <Section title="Daily Performance (last 7 days)">
          {days.map(([day, pnl]) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
              <span className="text-sm text-zinc-400">{new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
              <span className={`text-sm font-semibold ${pnlClass(pnl)}`}>{formatCurrency(pnl)}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
