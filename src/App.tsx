import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import QuickTrade from './pages/QuickTrade';
import Positions from './pages/Positions';
import Journal from './pages/Journal';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import { AppState, Page, Trade, JournalEntry } from './types';
import { loadState, saveState } from './storage';

function useAppState() {
  const [state, setStateRaw] = useState<AppState>(loadState);

  const setState = useCallback((next: AppState) => {
    setStateRaw(next);
    saveState(next);
  }, []);

  return { state, setState };
}

export default function App() {
  const { state, setState } = useAppState();
  const [page, setPage] = useState<Page>('dashboard');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  function addTrade(t: Trade) {
    setState({ ...state, trades: [...state.trades, t] });
  }

  function updateTrade(updated: Trade) {
    setState({ ...state, trades: state.trades.map(t => t.id === updated.id ? updated : t) });
  }

  function deleteTrade(id: string) {
    setState({ ...state, trades: state.trades.filter(t => t.id !== id) });
  }

  function addJournal(e: JournalEntry) {
    setState({ ...state, journal: [...state.journal, e] });
  }

  function deleteJournal(id: string) {
    setState({ ...state, journal: state.journal.filter(j => j.id !== id) });
  }

  function handleEdit(t: Trade) {
    setEditingTrade(t);
    setPage('quick-trade');
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            capital={state.capital}
            trades={state.trades}
            onNavigate={p => setPage(p)}
          />
        );
      case 'quick-trade':
        return (
          <QuickTrade
            trades={state.trades}
            onAdd={addTrade}
            onUpdate={updateTrade}
            editingTrade={editingTrade}
            onClearEdit={() => setEditingTrade(null)}
          />
        );
      case 'positions':
        return (
          <Positions
            trades={state.trades}
            onUpdate={updateTrade}
            onDelete={deleteTrade}
            onEdit={handleEdit}
          />
        );
      case 'journal':
        return (
          <Journal
            entries={state.journal}
            onAdd={addJournal}
            onDelete={deleteJournal}
          />
        );
      case 'statistics':
        return <Statistics trades={state.trades} />;
      case 'settings':
        return <Settings state={state} onStateChange={setState} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar current={page} onChange={p => { setPage(p); if (p !== 'quick-trade') setEditingTrade(null); }} />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
