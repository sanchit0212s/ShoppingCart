import React from 'react';
import { useStore } from '../StoreContext';
import { cn } from '../lib/utils';
import { Status } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
}

export function Sidebar({ currentView, setCurrentView, searchQuery }: SidebarProps) {
  const { items, options, updateItem, resetData, importData } = useStore();

  const cycleStatus = (status: Status): Status => {
    switch (status) {
      case 'Not started': return 'Researching';
      case 'Researching': return 'Shortlisted';
      case 'Shortlisted': return 'Decided';
      case 'Decided': return 'Not started';
    }
  };

  const getStatusDotColor = (status: Status, hasOptions: boolean) => {
    if (status === 'Decided') return 'bg-[#059669]';
    if (status === 'Researching' || (hasOptions && status === 'Not started')) return 'bg-[#3b82f6]';
    if (status === 'Shortlisted') return 'bg-[#fb923c]';
    return 'bg-[#475569]';
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ items, options }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'shopping-research-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.options)) {
             importData(parsed);
          } else {
             alert('Invalid file format. Needs items and options arrays.');
          }
        } catch (err) {
          alert('Error parsing JSON');
        }
      };
      reader.readAsText(file);
    }
    input.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetData();
    }
  };

  return (
    <aside className="bg-[#0f172a] text-white flex flex-col py-3 overflow-y-hidden" style={{ gridRow: 2 }}>
      <div className="px-5 mb-4">
        <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold">Views</span>
      </div>
      <div className="flex flex-col mb-6">
        <button
          onClick={() => setCurrentView('compare')}
          className={cn(
            "px-5 py-2.5 flex items-center gap-[12px] text-[14px] cursor-pointer transition-colors border-l-[3px] text-left",
            currentView === 'compare' ? "bg-[rgba(255,255,255,0.1)] border-[#059669] text-white font-medium" : "border-transparent text-[#64748b] hover:bg-[rgba(255,255,255,0.05)]"
          )}
        >
          Compare Budget
        </button>
        <button
          onClick={() => setCurrentView('progress')}
          className={cn(
            "px-5 py-2.5 flex items-center gap-[12px] text-[14px] cursor-pointer transition-colors border-l-[3px] text-left",
            currentView === 'progress' ? "bg-[rgba(255,255,255,0.1)] border-[#059669] text-white font-medium" : "border-transparent text-[#64748b] hover:bg-[rgba(255,255,255,0.05)]"
          )}
        >
          Progress
        </button>
      </div>

      <div className="px-5 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold">Furnishing List</span>
      </div>
      <div className="flex flex-col overflow-y-auto pb-4">
        {items.map(item => {
          const itemOptions = options.filter(o => o.itemId === item.id);
          const lowestPrice = itemOptions.length > 0 ? Math.min(...itemOptions.map(o => o.price || 0)) : null;
          const hasOptions = itemOptions.length > 0;
          const isSelected = currentView === item.id;
          
          if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
          }

          return (
            <div
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "px-5 py-2.5 flex items-center gap-[12px] text-[14px] cursor-pointer transition-colors border-l-[3px]",
                isSelected ? "bg-[rgba(255,255,255,0.1)] border-[#059669] text-white font-medium" : "border-transparent text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)]",
                item.status === 'Decided' && !isSelected && "text-[#94a3b8] opacity-60"
              )}
            >
              <div 
                onClick={(e) => { e.stopPropagation(); updateItem(item.id, { status: cycleStatus(item.status) }); }}
                className={cn(
                  "w-[8px] h-[8px] rounded-full flex-shrink-0 cursor-pointer hover:scale-125 transition-transform",
                  getStatusDotColor(item.status, hasOptions),
                  (item.status === 'Researching' || (hasOptions && item.status === 'Not started')) && "animate-pulse"
                )}
              />
              <span className="truncate">{item.name}</span>
              {isSelected && itemOptions.length > 0 && (
                <span className="ml-auto text-[10px] bg-[#059669] px-1.5 py-0.5 rounded text-white whitespace-nowrap">
                  {itemOptions.length} option{itemOptions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto p-4 border-t border-[#1e293b] flex justify-between">
        <div className="flex gap-2">
          <button onClick={handleExport} className="text-[10px] uppercase font-bold text-[#64748b] hover:text-white transition-colors">Export</button>
          <button onClick={handleImport} className="text-[10px] uppercase font-bold text-[#64748b] hover:text-white transition-colors ml-2">Import</button>
        </div>
        <button onClick={handleReset} className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors">Reset</button>
      </div>
    </aside>
  );
}
