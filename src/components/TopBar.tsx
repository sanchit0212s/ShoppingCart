import React from 'react';
import { useStore } from '../StoreContext';
import { Undo2, Redo2 } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function TopBar({ searchQuery, setSearchQuery }: TopBarProps) {
  const { items, options, undo, redo, canUndo, canRedo } = useStore();

  const decidedCount = items.filter(i => i.status === 'Decided').length;
  const pickedOptions = options.filter(o => o.picked);
  const totalBudgetCommitted = pickedOptions.reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <header className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 z-10 w-full" style={{ gridColumn: '1 / -1', height: '64px' }}>
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-[#059669]">Research Tracker</span>
        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center gap-1">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-md hover:bg-slate-100"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-md hover:bg-slate-100"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-center">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Decided</span>
          <span className="text-sm font-semibold">{decidedCount} / {items.length} items</span>
        </div>
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Saved</span>
          <span className="text-sm font-semibold">{options.length}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Budget Committed</span>
          <span className="text-sm font-semibold text-[#059669]">₹{totalBudgetCommitted.toLocaleString()}</span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-[#f1f5f9] border-none rounded-full px-4 py-1.5 text-xs w-48 focus:ring-1 focus:ring-[#059669] outline-none"
          />
        </div>
      </div>
    </header>
  );
}
