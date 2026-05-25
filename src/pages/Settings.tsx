import { useState, useRef } from 'react';
import { AppState } from '../types';
import { exportData, importData, resetState, formatPlain } from '../storage';

interface Props {
  state: AppState;
  onStateChange: (s: AppState) => void;
}

export default function Settings({ state, onStateChange }: Props) {
  const [capitalInput, setCapitalInput] = useState(String(state.capital));
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function saveCapital() {
    const n = Number(capitalInput.replace(/,/g, ''));
    if (isNaN(n) || n <= 0) return;
    onStateChange({ ...state, capital: n });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `options-desk-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const newState = importData(ev.target?.result as string);
        onStateChange(newState);
        setCapitalInput(String(newState.capital));
      } catch {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    const fresh = resetState();
    onStateChange(fresh);
    setCapitalInput(String(fresh.capital));
    setResetConfirm(false);
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-lg font-semibold text-zinc-100">Settings</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Account</p>

        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Starting Capital (₹)</label>
          <div className="flex gap-2">
            <input
              value={capitalInput}
              onChange={e => setCapitalInput(e.target.value)}
              type="text"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="1000000"
            />
            <button
              onClick={saveCapital}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                saved ? 'bg-emerald-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Current: ₹{formatPlain(state.capital)}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Data</p>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2 rounded-md transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2 rounded-md transition-colors"
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        <p className="text-xs text-zinc-600">
          {state.trades.length} trades · {state.journal.length} journal entries
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Danger Zone</p>
        <button
          onClick={handleReset}
          className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${
            resetConfirm
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-red-400'
          }`}
        >
          {resetConfirm ? 'Click again to confirm reset' : 'Reset All Data'}
        </button>
        {resetConfirm && (
          <button
            onClick={() => setResetConfirm(false)}
            className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Cancel
          </button>
        )}
        <p className="text-xs text-zinc-600">This will erase all trades, journal entries, and reset capital.</p>
      </div>
    </div>
  );
}
