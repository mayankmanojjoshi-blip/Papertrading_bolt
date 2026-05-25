import { LayoutDashboard, Zap, BookOpen, BarChart2, Settings, TrendingUp } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  current: Page;
  onChange: (p: Page) => void;
}

const nav: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'quick-trade', label: 'Quick Trade', icon: <Zap size={18} /> },
  { id: 'positions', label: 'Positions', icon: <TrendingUp size={18} /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={18} /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart2 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase">Options</span>
        <span className="text-sm font-bold tracking-widest text-emerald-400 uppercase"> Desk</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {nav.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left
              ${current === id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
          >
            <span className={current === id ? 'text-emerald-400' : ''}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-zinc-800">
        <span className="text-xs text-zinc-600">Paper Trading Only</span>
      </div>
    </aside>
  );
}
