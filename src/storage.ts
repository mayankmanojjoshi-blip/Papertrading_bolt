import { AppState, Trade, JournalEntry } from './types';

const KEY = 'options_trader_state';

const DEFAULT_STATE: AppState = {
  capital: 1000000,
  trades: [],
  journal: [],
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportData(): string {
  return localStorage.getItem(KEY) ?? '{}';
}

export function importData(json: string): AppState {
  const parsed = JSON.parse(json);
  localStorage.setItem(KEY, JSON.stringify(parsed));
  return { ...DEFAULT_STATE, ...parsed };
}

export function resetState(): AppState {
  localStorage.removeItem(KEY);
  return DEFAULT_STATE;
}

export function calcUnrealizedPnL(trade: Trade): number {
  const multiplier = trade.direction === 'BUY' ? 1 : -1;
  return multiplier * (trade.currentPremium - trade.entryPremium) * trade.quantity * trade.lotSize;
}

export function calcRealizedPnL(trade: Trade): number {
  if (trade.status !== 'CLOSED' || trade.exitPremium === undefined) return 0;
  const multiplier = trade.direction === 'BUY' ? 1 : -1;
  return multiplier * (trade.exitPremium - trade.entryPremium) * trade.quantity * trade.lotSize;
}

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : n > 0 ? '+' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(2)}`;
}

export function formatPlain(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
