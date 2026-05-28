import React, { useState } from 'react';
import { Option, Vibe } from '../types';
import { useStore } from '../StoreContext';
import { cn } from '../lib/utils';
import { Trash2, Copy, Edit2 } from 'lucide-react';

interface OptionCardProps {
  option: Option;
}

const VIBES: Vibe[] = ['Love it', "It's fine", 'Not sure', 'Overpriced'];

const vibeColors = {
  'Love it': 'bg-[#d1fae5] text-[#047857]',
  "It's fine": 'bg-[#fef3c7] text-[#b45309]',
  'Not sure': 'bg-[#f1f5f9] text-[#64748b]',
  'Overpriced': 'bg-[#ffe4e6] text-[#be123c]',
};

export function OptionCard({ option }: OptionCardProps) {
  const { updateOption, deleteOption, pickOption, duplicateOption } = useStore();
  
  const displayUrl = () => {
    try {
      const u = new URL(option.url);
      const path = u.pathname.length > 15 ? u.pathname.substring(0, 15) + '...' : u.pathname;
      return `${u.hostname}${path === '/' ? '' : path}`;
    } catch {
      return option.url;
    }
  };

  return (
    <div className={cn(
      "bg-white border rounded-xl p-4 flex flex-col gap-2.5 relative shadow-sm",
      option.picked ? "border-2 border-[#059669] bg-[#f0fdf4]" : "border-[#e2e8f0]"
    )}>
      {option.picked && (
        <div className="absolute top-2 right-2 bg-[#059669] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Picked Choice
        </div>
      )}

      {option.image && (
        <div className="w-full max-h-48 bg-[#f8fafc] rounded-lg overflow-hidden border border-[#e2e8f0] mb-1 flex items-center justify-center">
          <img src={option.image} alt="Preview" className="max-w-full max-h-48 object-contain" />
        </div>
      )}

      <div className="flex items-center gap-3 pr-[80px]">
        {option.faviconUrl ? (
          <img src={option.faviconUrl} alt="icon" className="w-[24px] h-[24px] rounded bg-[#f1f5f9] object-cover" />
        ) : (
          <div className="w-[24px] h-[24px] rounded bg-[#f1f5f9] flex items-center justify-center font-bold text-[10px] text-[#64748b]">
             {option.title[0]}
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <input
            value={option.title}
            onChange={(e) => updateOption(option.id, { title: e.target.value })}
            className="text-sm font-bold w-full bg-transparent border-none outline-none text-[#1e293b] p-0"
            placeholder="Product Title"
          />
          <a
            href={option.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-[#64748b] hover:text-[#059669] underline truncate"
          >
            {displayUrl()}
          </a>
        </div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-[#1e293b]">₹</span>
          <input
            type="number"
            value={option.price || ''}
            onChange={(e) => updateOption(option.id, { price: Number(e.target.value) })}
            className="text-lg font-bold w-20 bg-transparent border-none outline-none text-[#1e293b] p-0"
            placeholder="0"
          />
        </div>
        <div className="flex gap-0.5 text-[#f59e0b] text-xs">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => updateOption(option.id, { rating: option.rating === star ? 0 : star })}
              className={cn(
                "cursor-pointer",
                star <= option.rating ? "text-[#f59e0b]" : "text-[#e2e8f0]"
              )}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={option.vibe || ''}
          onChange={(e) => updateOption(option.id, { vibe: e.target.value as Vibe })}
          className={cn(
            "px-2.5 py-0.5 rounded-xl text-[11px] font-medium outline-none appearance-none cursor-pointer border border-transparent",
            option.vibe ? vibeColors[option.vibe] : "bg-[#f1f5f9] text-[#64748b]"
          )}
        >
          <option value="" disabled>Set vibe...</option>
          {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        {option.picked && <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-medium bg-[#f1f5f9] text-[#64748b]">Selected</span>}
      </div>

      <textarea
        value={option.notes || ''}
        onChange={(e) => updateOption(option.id, { notes: e.target.value })}
        className="text-[10px] p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded resize-none min-h-[40px] outline-none text-[#1e293b]"
        placeholder="Notes (e.g. Dimensions, shipping...)"
      />

      <div className="flex gap-2 mt-auto pt-2">
        <button
          onClick={() => pickOption(option.itemId, option.picked ? '' : option.id)}
          className="flex-1 text-[10px] font-bold border border-[#e2e8f0] py-1 rounded hover:bg-[#ecfdf5] hover:border-[#a7f3d0] transition-colors"
        >
          {option.picked ? 'Unpick target' : 'Pick this'}
        </button>
        <button onClick={() => duplicateOption(option.id)} className="p-1 border border-[#e2e8f0] rounded text-[#64748b] hover:text-[#1e293b]">
           <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => deleteOption(option.id)} className="p-1 border border-[#e2e8f0] rounded text-[#64748b] hover:text-red-500">
           <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
