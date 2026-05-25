import { useState } from 'react';
import { JournalEntry } from '../types';
import { generateId, todayStr } from '../storage';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface Props {
  entries: JournalEntry[];
  onAdd: (e: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'Fearful', 'Greedy', 'Disciplined', 'FOMO', 'Bored'];

function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-200">{entry.date}</span>
          {entry.emotionalState && (
            <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">{entry.emotionalState}</span>
          )}
          {entry.tradeReason && (
            <span className="text-sm text-zinc-500 truncate max-w-xs">{entry.tradeReason.slice(0, 60)}{entry.tradeReason.length > 60 ? '…' : ''}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronUp size={15} className="text-zinc-500" /> : <ChevronDown size={15} className="text-zinc-500" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
          {entry.tradeReason && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Trade Reason</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{entry.tradeReason}</p>
            </div>
          )}
          {entry.mistakes && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Mistakes Made</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{entry.mistakes}</p>
            </div>
          )}
          {entry.lessons && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Lessons Learned</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{entry.lessons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Journal({ entries, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [tradeReason, setTradeReason] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [emotional, setEmotional] = useState('');
  const [lessons, setLessons] = useState('');

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: JournalEntry = {
      id: generateId(),
      date,
      tradeReason,
      mistakes,
      emotionalState: emotional,
      lessons,
      linkedTradeIds: [],
    };
    onAdd(entry);
    setTradeReason('');
    setMistakes('');
    setEmotional('');
    setLessons('');
    setDate(todayStr());
    setShowForm(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Journal</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
        >
          <Plus size={15} />
          New Entry
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Date</label>
              <input
                value={date}
                onChange={e => setDate(e.target.value)}
                type="date"
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Emotional State</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTIONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmotional(prev => prev === em ? '' : em)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      emotional === em
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Trade Reason / Setup</label>
            <textarea
              value={tradeReason}
              onChange={e => setTradeReason(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Why did you take this trade?"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Mistakes Made</label>
            <textarea
              value={mistakes}
              onChange={e => setMistakes(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="What went wrong or could be improved?"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Lessons Learned</label>
            <textarea
              value={lessons}
              onChange={e => setLessons(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Key takeaways for next time"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded-md text-sm transition-colors"
            >
              Save Entry
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg py-16 text-center text-zinc-600 text-sm">
          No journal entries yet
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={() => onDelete(entry.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
