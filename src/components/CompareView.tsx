import React from 'react';
import { useStore } from '../StoreContext';

export function CompareView() {
  const { items, options } = useStore();

  const totalBudget = items.reduce((sum, item) => sum + (item.budget || 0), 0);
  const totalCommitted = items.reduce((sum, item) => {
    const pickedOpt = options.find(o => o.itemId === item.id && o.picked);
    return sum + (pickedOpt?.price || 0);
  }, 0);
  
  const budgetProgress = totalBudget > 0 ? (totalCommitted / totalBudget) * 100 : 0;
  const isOverBudget = totalCommitted > totalBudget;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Decided': return 'text-[#059669]';
      case 'Researching': return 'text-[#3b82f6]';
      case 'Shortlisted': return 'text-[#fb923c]';
      default: return 'text-[#94a3b8]';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col gap-5 min-h-[500px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e293b]">Cross-item Budget</h1>
        <p className="text-sm text-[#64748b]">Compare picked items against target budgets</p>
      </div>

      <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center justify-between mt-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Total Goal Capacity</span>
          <span className="text-xl font-bold text-[#1e293b]">₹{totalBudget.toLocaleString()}</span>
        </div>
        
        <div className="flex-1 max-w-[400px] px-8">
          <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div 
              className={`h-full ${isOverBudget ? 'bg-[#ef4444]' : 'bg-[#059669]'}`} 
              style={{ width: `${Math.min(budgetProgress, 100)}%` }} 
            />
          </div>
          <div className="mt-2 text-right">
             <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider">
               {budgetProgress.toFixed(1)}% {isOverBudget ? 'Over Budget' : 'Utilized'}
             </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Budget Committed</span>
          <span className={`text-xl font-bold ${isOverBudget ? 'text-[#ef4444]' : 'text-[#059669]'}`}>
            ₹{totalCommitted.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-white border text-sm border-[#e2e8f0] rounded-xl overflow-hidden mt-4">
        <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="bg-[#f8fafc] py-2 px-4 border-b border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Item</th>
              <th className="bg-[#f8fafc] py-2 px-4 border-b border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Status</th>
              <th className="bg-[#f8fafc] py-2 px-4 border-b border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Budget</th>
              <th className="bg-[#f8fafc] py-2 px-4 border-b border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Committed</th>
              <th className="bg-[#f8fafc] py-2 px-4 border-b border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b] font-bold">Diff</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const pickedOpt = options.find(o => o.itemId === item.id && o.picked);
              const commited = pickedOpt?.price || 0;
              const diff = (item.budget || 0) - commited;
              const hasBudget = item.budget && item.budget > 0;
              
              return (
                <tr key={item.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <td className="py-2.5 px-4 font-bold text-[#1e293b] text-xs">{item.name}</td>
                  <td className={`py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </td>
                  <td className="py-2.5 px-4 text-xs font-bold text-[#94a3b8]">₹{item.budget?.toLocaleString() || 0}</td>
                  <td className="py-2.5 px-4 text-xs font-bold text-[#1e293b]">
                     {commited > 0 ? `₹${commited.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-xs">
                     {hasBudget && commited > 0 ? (
                       <span className={diff < 0 ? 'text-[#ef4444] font-bold' : 'text-[#059669] font-bold'}>
                         {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                       </span>
                     ) : (
                       <span className="text-[#94a3b8]">—</span>
                     )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
      <div className="mb-8"></div>
    </div>
  );
}
