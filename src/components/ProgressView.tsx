import React from 'react';
import { useStore } from '../StoreContext';

export function ProgressView() {
  const { items, options } = useStore();

  const total = items.length;
  const decided = items.filter(i => i.status === 'Decided').length;
  const shortlisted = items.filter(i => i.status === 'Shortlisted').length;
  const researching = items.filter(i => i.status === 'Researching').length;
  const notStarted = items.filter(i => i.status === 'Not started').length;

  const percent = total > 0 ? (decided / total) * 100 : 0;
  // Let's create an approximate ring using conic-gradient
  const degrees = (percent / 100) * 360;

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col gap-5 min-h-[500px]">
      <div className="flex flex-col gap-1 items-center justify-center pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e293b]">Progress</h1>
        <p className="text-sm text-[#64748b]">Visual checklist of what's decided vs still being researched</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-8 mt-4">
        
        {/* Ring Chart */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Base border */}
          <div className="absolute inset-0 rounded-full border-[16px] border-[#f1f5f9]"></div>
          {/* Progress border via conic-gradient on a pseudo-like element */}
          <div 
             className="absolute inset-0 rounded-full transition-all duration-500 ease-out"
             style={{
               background: `conic-gradient(#059669 0deg, #059669 ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`,
               maskImage: 'radial-gradient(transparent 58%, black 60%)',
               WebkitMaskImage: 'radial-gradient(transparent 58%, black 60%)'
             }}
          />
          <div className="flex flex-col items-center justify-center relative z-10 bg-white w-32 h-32 rounded-full border-[4px] border-white shadow-sm">
            <span className="text-4xl font-bold text-[#1e293b]">{decided}<span className="text-lg text-[#94a3b8]">/{total}</span></span>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Decided</span>
          </div>
        </div>

        {/* Stats List */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center justify-between gap-6 p-2 rounded hover:bg-[#f8fafc]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#059669]"></div>
              <span className="text-sm font-bold text-[#1e293b]">Decided</span>
            </div>
            <span className="text-sm font-bold text-[#64748b]">{decided}</span>
          </div>
          <div className="flex items-center justify-between gap-6 p-2 rounded hover:bg-[#f8fafc]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#fb923c]"></div>
              <span className="text-sm font-bold text-[#1e293b]">Shortlisted</span>
            </div>
            <span className="text-sm font-bold text-[#64748b]">{shortlisted}</span>
          </div>
          <div className="flex items-center justify-between gap-6 p-2 rounded hover:bg-[#f8fafc]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
              <span className="text-sm font-bold text-[#1e293b]">Researching</span>
            </div>
            <span className="text-sm font-bold text-[#64748b]">{researching}</span>
          </div>
          <div className="flex items-center justify-between gap-6 p-2 rounded hover:bg-[#f8fafc]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#475569]"></div>
              <span className="text-sm font-bold text-[#1e293b]">Not started</span>
            </div>
            <span className="text-sm font-bold text-[#64748b]">{notStarted}</span>
          </div>
        </div>

      </div>

      <div className="px-8 pb-12 w-full mt-4">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-[#1e293b]">Progress Breakdown</h3>
        <div className="space-y-3">
          {items.map(item => {
            const itemOptions = options.filter(o => o.itemId === item.id);
            const prices = itemOptions.map(o => o.price).filter(p => p > 0);
            const minP = prices.length ? Math.min(...prices) : 0;
            const maxP = prices.length ? Math.max(...prices) : 0;
            const picked = itemOptions.find(o => o.picked);
            const isDecided = item.status === 'Decided';

            return (
              <div 
                key={item.id}
                className={`py-4 px-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isDecided 
                    ? 'bg-[#f1f5f9]/50 border-[#e2e8f0]/50 opacity-70'
                    : 'bg-white border-[#e2e8f0] shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#1e293b]">{item.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded ${
                      item.status === 'Decided' ? 'bg-[#d1fae5] text-[#047857]' : 
                      item.status === 'Researching' ? 'bg-[#dbeafe] text-[#1d4ed8]' :
                      item.status === 'Shortlisted' ? 'bg-[#ffedd5] text-[#c2410c]' :
                      'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#64748b]">
                    {itemOptions.length} option{itemOptions.length !== 1 && 's'} saved
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {picked ? (
                    <div className="inline-flex flex-col items-end gap-0.5 bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] px-3 py-1.5 rounded-lg text-xs max-w-full text-right">
                      <span className="truncate max-w-[200px] font-bold">{picked.title}</span>
                      <span className="font-bold text-[#1e293b]">₹{picked.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-[#94a3b8] italic">Still looking...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
