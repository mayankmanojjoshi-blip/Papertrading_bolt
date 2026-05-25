export type OptionType = 'CE' | 'PE';
export type TradeDirection = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED';

export interface Trade {
  id: string;
  symbol: string;
  optionType: OptionType;
  strikePrice: number;
  expiry: string;
  quantity: number;
  direction: TradeDirection;
  entryPremium: number;
  currentPremium: number;
  exitPremium?: number;
  status: TradeStatus;
  timestamp: string;
  closedAt?: string;
  notes?: string;
  lotSize: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  tradeReason: string;
  mistakes: string;
  emotionalState: string;
  lessons: string;
  linkedTradeIds: string[];
}

export interface AppState {
  capital: number;
  trades: Trade[];
  journal: JournalEntry[];
}

export type Page = 'dashboard' | 'quick-trade' | 'positions' | 'journal' | 'statistics' | 'settings';
