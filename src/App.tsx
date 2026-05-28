/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider } from './StoreContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ItemDetail } from './components/ItemDetail';
import { CompareView } from './components/CompareView';
import { ProgressView } from './components/ProgressView';
import { INITIAL_ITEMS } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>(INITIAL_ITEMS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="grid h-screen w-full overflow-hidden bg-[#f8fafc] text-[#1e293b]" style={{ gridTemplateColumns: '260px 1fr', gridTemplateRows: '64px 1fr' }}>
      <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        searchQuery={searchQuery} 
      />
      
      <main className="overflow-hidden flex flex-col gap-5 p-6" style={{ gridRow: 2, gridColumn: 2 }}>
        {currentView === 'compare' ? (
          <CompareView />
        ) : currentView === 'progress' ? (
          <ProgressView />
        ) : (
          <ItemDetail key={currentView} itemId={currentView} searchQuery={searchQuery} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
