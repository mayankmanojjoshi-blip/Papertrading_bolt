import { useState, useEffect, useRef } from 'react';
import { Trade, OptionType, TradeDirection } from '../types';
import { generateId, calcUnrealizedPnL, formatCurrency } from '../storage';

const COMMON_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'SBIN'];
const LOT_SIZES: Record<string, number> = {
  NIFTY: 25, BANKNIFTY: 15, FINNIFTY: 40, MIDCPNIFTY: 75, SENSEX: 10,
  RELIANCE: 250, TCS: 150, INFY: 300, HDFC: 550, ICICIBANK: 700, SBIN: 1500,
};

function getLotSize(symbol: string): number {
  return LOT_SIZES[symbol.toUpperCase()] ?? 100;
}

function nextExpiry(): string {
  const d = new Date();
  const day = d.getDay();
  const daysToThursday = (4 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysToThursday);
  return d.toISOString().split('T')[0];
}

interface Props {
  trades: Trade[];
  onAdd: (t: Trade) => void;
  onUpdate: (t: Trade) => void;
  editingTrade?: Trade | null;
  onClearEdit: () => void;
}

export default function QuickTrade({ trades, onAdd, onUpdate, editingTrade, onClearEdit }: Props) {
  const [symbol, setSymbol] = useState('NIFTY');
  const [optionType, setOptionType] = useState<OptionType>('CE');
  const [strike, setStrike] = useState('');
  const [expiry, setExpiry] = useState(nextExpiry());
  const [quantity, setQuantity] = useState('1');
  const [direction, setDirection] = useState<TradeDirection>('BUY');
  const [entryPremium, setEntryPremium] = useState('');
  const [currentPremium, setCurrentPremium] = useState('');
  const [notes, setNotes] = useState('');
  const [symbolInput, setSymbolInput] = useState('NIFTY');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const symbolRef = useRef<HTMLInputElement>(null);
  const strikeRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingTrade;

  useEffect(() => {
    if (editingTrade) {
      setSymbol(editingTrade.symbol);
      setSymbolInput(editingTrade.symbol);
      setOptionType(editingTrade.optionType);
      setStrike(String(editingTrade.strikePrice));
      setExpiry(editingTrade.expiry);
      setQuantity(String(editingTrade.quantity));
      setDirection(editingTrade.direction);
      setEntryPremium(String(editingTrade.entryPremium));
      setCurrentPremium(String(editingTrade.currentPremium));
      setNotes(editingTrade.notes ?? '');
    }
  }, [editingTrade]);

  function reset() {
    setSymbol('NIFTY');
    setSymbolInput('NIFTY');
    setOptionType('CE');
    setStrike('');
    setExpiry(nextExpiry());
    setQuantity('1');
    setDirection('BUY');
    setEntryPremium('');
    setCurrentPremium('');
    setNotes('');
    onClearEdit();
    symbolRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lotSize = getLotSize(symbol);
    if (isEditing && editingTrade) {
      const updated: Trade = {
        ...editingTrade,
        symbol: symbol.toUpperCase(),
        optionType,
        strikePrice: Number(strike),
        expiry,
        quantity: Number(quantity),
        direction,
        currentPremium: Number(entryPremium),
        notes,
        lotSize,
      };
      onUpdate(updated);
    } else {
      const trade: Trade = {
        id: generateId(),
        symbol: symbol.toUpperCase(),
        optionType,
        strikePrice: Number(strike),
        expiry,
        quantity: Number(quantity),
        direction,
        entryPremium: Number(entryPremium),
        currentPremium: Number(entryPremium),
        notes,
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        lotSize,
      };
      onAdd(trade);
    }
    reset();
  }

  function handleSymbolSelect(s: string) {
    setSymbol(s);
    setSymbolInput(s);
    setShowSuggestions(false);
    strikeRef.current?.focus();
  }

  const filteredSymbols = COMMON_SYMBOLS.filter(s =>
    s.toLowerCase().includes(symbolInput.toLowerCase())
  );

  const previewPnL = entryPremium && currentPremium && strike && quantity
    ? calcUnrealizedPnL({
        direction,
        entryPremium: Number(entryPremium),
        currentPremium: Number(currentPremium),
        quantity: Number(quantity),
        lotSize: getLotSize(symbol),
      } as Trade)
    : null;

  const openTrades = trades.filter(t => t.status === 'OPEN');

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">{isEditing ? 'Edit Trade' : 'Quick Trade'}</h1>
        {isEditing && (
          <button onClick={reset} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        {/* Symbol + Option Type */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Symbol</label>
            <input
              ref={symbolRef}
              value={symbolInput}
              onChange={e => { setSymbolInput(e.target.value); setSymbol(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 uppercase"
              placeholder="NIFTY"
              autoComplete="off"
            />
            {showSuggestions && filteredSymbols.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredSymbols.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => handleSymbolSelect(s)}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                  >
                    {s} <span className="text-xs text-zinc-500">lot {getLotSize(s)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Type</label>
            <div className="flex rounded-md overflow-hidden border border-zinc-700">
              {(['CE', 'PE'] as OptionType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOptionType(t)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors
                    ${optionType === t
                      ? t === 'CE' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Side</label>
            <div className="flex rounded-md overflow-hidden border border-zinc-700">
              {(['BUY', 'SELL'] as TradeDirection[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors
                    ${direction === d
                      ? d === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
       {!quickMode && (
        {/* Strike + Expiry + Quantity */}
          )}  
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Strike Price</label>
            <input
              ref={strikeRef}
              value={strike}
              onChange={e => setStrike(e.target.value)}
              type="number"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="24500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Expiry</label>
            <input
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              type="date"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
              Lots <span className="text-zinc-600 normal-case">(×{getLotSize(symbol)})</span>
            </label>
            <input
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              type="number"
              min="1"
              required
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="1"
            />
          </div>
        </div>

        {/* Premiums */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Entry Premium</label>
            <input
              value={entryPremium}
              onChange={e => setEntryPremium(e.target.value)}
              type="number"
              step="0.05"
              min="0"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="150.00"
            />
          </div>
                   {previewPnL !== null && (
            <div className="pb-0.5">
              <p className="text-xs text-zinc-500 mb-1.5">Unrealized P&L</p>
              <p className={`text-base font-bold ${previewPnL > 0 ? 'text-emerald-400' : previewPnL < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {formatCurrency(previewPnL)}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            placeholder="Setup, reason, etc."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-md text-sm transition-colors"
        >
          {isEditing ? 'Update Trade' : 'Add Trade'}
        </button>
      </form>

      {/* Open trades quick list */}
      {openTrades.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-300">Open Trades — update current premium</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {openTrades.map(t => {
              const pnl = calcUnrealizedPnL(t);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-xs font-bold ${t.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{t.direction}</span>
                    <span className="text-sm text-zinc-200 truncate">{t.symbol} {t.strikePrice} {t.optionType}</span>
                    <span className="text-xs text-zinc-500">{t.expiry}</span>
                  </div>
                  <span className="text-xs text-zinc-500">@{t.entryPremium}</span>
                  <PremiumInput trade={t} onUpdate={onUpdate} />
                  <span className={`text-sm font-semibold w-20 text-right ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                    {formatCurrency(pnl)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PremiumInput({ trade, onUpdate }: { trade: Trade; onUpdate: (t: Trade) => void }) {
  const [val, setVal] = useState(String(trade.currentPremium));

  function handleBlur() {
    const n = Number(val);
    if (!isNaN(n) && n !== trade.currentPremium) {
      onUpdate({ ...trade, currentPremium: n });
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }

  return (
    <input
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKey}
      type="number"
      step="0.05"
      className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 text-right"
    />
  );
}
