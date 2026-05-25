import { useState } from 'react';
import { Trade } from '../types';
import { calcUnrealizedPnL, calcRealizedPnL, formatCurrency } from '../storage';
import { Pencil, X, CheckCircle } from 'lucide-react';

interface Props {
  trades: Trade[];
  onUpdate: (t: Trade) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Trade) => void;
}

type Tab = 'open' | 'closed';

function PnLBadge({ value }: { value: number }) {
  const cls = value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-zinc-400';
  return <span className={`font-semibold ${cls}`}>{formatCurrency(value)}</span>;
}

function CloseModal({ trade, onClose, onConfirm }: { trade: Trade; onClose: () => void; onConfirm: (exit: number) => void }) {
  const [exit, setExit] = useState(String(trade.currentPremium));
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-zinc-100">Close Position</h3>
        <p className="text-sm text-zinc-400">{trade.symbol} {trade.strikePrice} {trade.optionType} — {trade.direction}</p>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Exit Premium</label>
          <input
            value={exit}
            onChange={e => setExit(e.target.value)}
            type="number"
            step="0.05"
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(Number(exit))}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded-md text-sm transition-colors"
          >
            Close Trade
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 rounded-md text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Positions({ trades, onUpdate, onDelete, onEdit }: Props) {
  const [tab, setTab] = useState<Tab>('open');
  const [closing, setClosing] = useState<Trade | null>(null);

  const open = trades.filter(t => t.status === 'OPEN');
  const closed = trades.filter(t => t.status === 'CLOSED');
  const displayed = tab === 'open' ? open : closed;

  const totalOpenPnL = open.reduce((s, t) => s + calcUnrealizedPnL(t), 0);
  const totalClosedPnL = closed.reduce((s, t) => s + calcRealizedPnL(t), 0);

  function handleClose(trade: Trade, exitPremium: number) {
    onUpdate({
      ...trade,
      status: 'CLOSED',
      exitPremium,
      currentPremium: exitPremium,
      closedAt: new Date().toISOString(),
    });
    setClosing(null);
  }

  const thClass = 'text-left text-xs text-zinc-500 uppercase tracking-wider font-medium px-3 py-2.5';
  const tdClass = 'px-3 py-2.5 text-sm';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Positions</h1>
        <div className="flex items-center gap-4 text-sm">
          {tab === 'open' && open.length > 0 && (
            <span className="text-zinc-400">
              Running P&L: <PnLBadge value={totalOpenPnL} />
            </span>
          )}
          {tab === 'closed' && closed.length > 0 && (
            <span className="text-zinc-400">
              Realized: <PnLBadge value={totalClosedPnL} />
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['open', 'closed'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t} ({t === 'open' ? open.length : closed.length})
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg py-16 text-center text-zinc-600 text-sm">
          No {tab} positions
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-800">
                <tr>
                  <th className={thClass}>Symbol</th>
                  <th className={thClass}>Type</th>
                  <th className={thClass}>Strike</th>
                  <th className={thClass}>Expiry</th>
                  <th className={thClass}>Side</th>
                  <th className={thClass}>Qty</th>
                  <th className={thClass}>Entry ₹</th>
                  <th className={thClass}>{tab === 'open' ? 'Current ₹' : 'Exit ₹'}</th>
                  <th className={thClass}>P&L</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {displayed.map(t => {
                  const pnl = t.status === 'OPEN' ? calcUnrealizedPnL(t) : calcRealizedPnL(t);
                  const date = new Date(t.timestamp);
                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className={`${tdClass} font-semibold text-zinc-100`}>{t.symbol}</td>
                      <td className={tdClass}>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${t.optionType === 'CE' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {t.optionType}
                        </span>
                      </td>
                      <td className={`${tdClass} text-zinc-300`}>{t.strikePrice}</td>
                      <td className={`${tdClass} text-zinc-400`}>{t.expiry}</td>
                      <td className={tdClass}>
                        <span className={`text-xs font-bold ${t.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td className={`${tdClass} text-zinc-300`}>{t.quantity}×{t.lotSize}</td>
                      <td className={`${tdClass} text-zinc-400`}>{t.entryPremium}</td>
                      <td className={`${tdClass} text-zinc-300`}>
                        {t.status === 'OPEN' ? (
                          <InlinePremiumEdit trade={t} onUpdate={onUpdate} />
                        ) : (
                          t.exitPremium ?? '—'
                        )}
                      </td>
                      <td className={tdClass}><PnLBadge value={pnl} /></td>
                      <td className={`${tdClass} text-zinc-500 text-xs`}>
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className={`${tdClass}`}>
                        <div className="flex items-center gap-1">
                          {t.status === 'OPEN' && (
                            <>
                              <button
                                onClick={() => onEdit(t)}
                                title="Edit"
                                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setClosing(t)}
                                title="Close position"
                                className="p-1 text-zinc-600 hover:text-emerald-400 transition-colors"
                              >
                                <CheckCircle size={13} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onDelete(t.id)}
                            title="Delete"
                            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {closing && (
        <CloseModal
          trade={closing}
          onClose={() => setClosing(null)}
          onConfirm={exit => handleClose(closing, exit)}
        />
      )}
    </div>
  );
}

function InlinePremiumEdit({ trade, onUpdate }: { trade: Trade; onUpdate: (t: Trade) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(trade.currentPremium));

  function commit() {
    const n = Number(val);
    if (!isNaN(n)) onUpdate({ ...trade, currentPremium: n });
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-zinc-300 hover:text-zinc-100 underline decoration-dotted"
      >
        {trade.currentPremium}
      </button>
    );
  }

  return (
    <input
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      autoFocus
      type="number"
      step="0.05"
      className="w-20 bg-zinc-700 border border-emerald-500 rounded px-2 py-0.5 text-sm text-zinc-100 focus:outline-none"
    />
  );
}
