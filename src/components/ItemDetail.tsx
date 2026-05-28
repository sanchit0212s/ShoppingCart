import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { OptionCard } from './OptionCard';
import { Plus } from 'lucide-react';

interface ItemDetailProps {
  itemId: string;
  searchQuery: string;
}

export function ItemDetail({ itemId, searchQuery }: ItemDetailProps) {
  const { items, options, updateItem, addOption } = useStore();
  const item = items.find(i => i.id === itemId);
  
  const [newUrl, setNewUrl] = useState('');
  const [newPrice, setNewPrice] = useState('');

  if (!item) return null;

  const itemOptions = options.filter(o => o.itemId === itemId);
  
  // Apply global search if present
  const filteredOptions = itemOptions.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.title.toLowerCase().includes(q) || (o.notes || '').toLowerCase().includes(q);
  });

  const [isScraping, setIsScraping] = useState(false);

  const handleAddURL = async () => {
    if (!newUrl) return;
    setIsScraping(true);
    let url = newUrl;
    if (!url.startsWith('http')) url = 'https://' + url;
    
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      domain = url;
    }

    let title = `${domain} — untitled`;
    let imageSrc = '';
    let scrapedPrice = Number(newPrice) || 0;

    try {
      // Automatic info fetching
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.image) imageSrc = data.image;
        if (data.price > 0 && !newPrice) scrapedPrice = data.price;
      }
    } catch (e) {
      console.warn("Failed to scrape data");
    }

    addOption({
      itemId,
      url,
      title,
      price: scrapedPrice,
      rating: 0,
      vibe: '',
      notes: '',
      picked: false,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      domain,
      image: imageSrc
    });
    setNewUrl('');
    setNewPrice('');
    setIsScraping(false);
  };

  const maxPrice = Math.max(...itemOptions.map(o => o.price), item.budget || 0, 1);
  const minPrice = Math.min(...itemOptions.filter(o => o.price > 0).map(o => o.price));

  return (
    <div className="flex-1 overflow-y-auto w-full pr-2 flex flex-col gap-5 min-h-[500px]">
      <section className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1e293b]">{item.name}</h1>
            <span 
              onClick={() => {
                const statuses: any[] = ['Not started', 'Researching', 'Shortlisted', 'Decided'];
                updateItem(item.id, { status: statuses[(statuses.indexOf(item.status) + 1) % 4] });
              }}
              className="bg-[#dbeafe] text-[#1d4ed8] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide cursor-pointer hover:bg-[#bfdbfe]"
            >
               {item.status}
            </span>
          </div>
          <input
            type="text"
            value={item.notes || ''}
            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
            className="text-sm text-[#64748b] bg-transparent border-none outline-none w-[400px] max-w-full"
            placeholder="Add context note... (e.g. Dimensions)"
          />
        </div>
        <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-[#64748b]">Budget Cap</label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹</span>
            <input
              type="number"
              value={item.budget || ''}
              onChange={(e) => updateItem(item.id, { budget: Number(e.target.value) })}
              className="bg-transparent border-none p-0 font-bold text-lg w-24 outline-none text-[#1e293b]"
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {itemOptions.length > 0 && (
        <section className="bg-white border border-[#e2e8f0] rounded-xl p-5 relative min-h-[140px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Price Comparison</span>
            <span className="text-[10px] text-[#64748b] italic">
              Budget Limit: ₹{item.budget > 0 ? item.budget.toLocaleString() : 'Not Set'}
            </span>
          </div>
          
          <div className="flex flex-col gap-3 relative z-10 w-full overflow-hidden">
            {itemOptions.map(opt => {
              const leftPercent = maxPrice > 0 ? (opt.price / maxPrice) * 100 : 0;
              const isCheapest = opt.price === minPrice && minPrice > 0;
              const isMostExp = opt.price === Math.max(...itemOptions.map(o=>o.price));
              
              let barColor = 'bg-[#94a3b8]';
              if (opt.picked) barColor = 'bg-[#059669]';
              else if (isMostExp) barColor = 'bg-[#f87171]';
              else if (isCheapest) barColor = 'bg-[#34d399]';

              return (
                <div key={opt.id} className="flex items-center gap-4">
                  <span className="text-[10px] w-20 text-right truncate text-[#1e293b]">{opt.domain}</span>
                  <div className="flex-1 h-3 bg-[#f1f5f9] rounded-full overflow-hidden relative">
                    <div className={`h-full absolute left-0 ${barColor}`} style={{ width: `${leftPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-bold w-16 text-[#1e293b]">₹{opt.price.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {item.budget > 0 && maxPrice > 0 && (
            <div 
              className="absolute top-8 bottom-4 border-r-2 border-dashed border-[#cbd5e1] pointer-events-none"
              style={{ left: `calc(80px + 16px + calc(100% - 80px - 16px - 64px - 16px) * ${item.budget / maxPrice})` }}
            />
          )}
        </section>
      )}

      <div className="flex items-center gap-3 bg-[#f8fafc] p-2 rounded-lg border border-[#e2e8f0]">
        <span className="text-[10px] font-bold uppercase text-[#64748b] ml-2 flex-shrink-0">Add New:</span>
        <input 
          type="text" 
          placeholder="Paste URL..." 
          className="flex-1 py-1 px-2 border border-[#e2e8f0] rounded-md text-[13px] outline-none"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddURL()}
        /> 
        <input 
          type="number" 
          placeholder="₹ Price" 
          className="w-24 py-1 px-2 border border-[#e2e8f0] rounded-md text-[13px] outline-none"
          value={newPrice}
          onChange={e => setNewPrice(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddURL()}
        />
        <button 
          onClick={handleAddURL}
          disabled={!newUrl || isScraping}
          className="bg-[#059669] text-white text-xs px-4 py-1.5 rounded font-bold disabled:opacity-50"
        >
          {isScraping ? 'Scraping...' : 'Add Option'}
        </button>
      </div>

      {filteredOptions.length === 0 ? (
        <div className="text-center py-20 text-[#64748b] text-sm">
          No options found.
        </div>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-12">
          {filteredOptions.map(option => (
            <OptionCard key={option.id} option={option} />
          ))}
        </section>
      )}
    </div>
  );
}
