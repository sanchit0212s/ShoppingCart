import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Item, Option, StoreState, INITIAL_ITEMS } from './types';

interface StoreContextType {
  items: Item[];
  options: Option[];
  updateItem: (id: string, updates: Partial<Item>) => void;
  addOption: (option: Omit<Option, 'id'>) => void;
  updateOption: (id: string, updates: Partial<Option>) => void;
  deleteOption: (id: string) => void;
  duplicateOption: (id: string) => void;
  pickOption: (itemId: string, optionId: string) => void;
  resetData: () => void;
  importData: (data: StoreState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'shopping_research_state_v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.items || INITIAL_ITEMS;
      } catch (e) {
        return INITIAL_ITEMS;
      }
    }
    return INITIAL_ITEMS;
  });

  const [options, setOptions] = useState<Option[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.options || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [history, setHistory] = useState<StoreState[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isNavigatingRef = React.useRef(false);

  // Initialize history on first mount
  useEffect(() => {
    setHistory([{ items, options }]);
    setHistoryPointer(0);
  }, []);

  // Debounced history tracker
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    
    // Only track if we have initialized history
    if (historyPointer < 0) return;

    const t = setTimeout(() => {
      setHistory(prev => {
        let newHist = prev.slice(0, historyPointer + 1);
        if (newHist.length > 0) {
          const last = newHist[newHist.length - 1];
          if (JSON.stringify(last.items) === JSON.stringify(items) && 
              JSON.stringify(last.options) === JSON.stringify(options)) {
            return prev;
          }
        }
        newHist.push({ items, options });
        if (newHist.length > 50) {
          newHist = newHist.slice(newHist.length - 50);
        }
        setHistoryPointer(newHist.length - 1);
        return newHist;
      });
    }, 800); // 800ms debounce

    return () => clearTimeout(t);
  }, [items, options, historyPointer]);

  // Global Undo/Redo shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyPointer]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ items, options }));
  }, [items, options]);

  const undo = () => {
    setHistoryPointer(prev => {
      if (prev > 0) {
        isNavigatingRef.current = true;
        const nextPtr = prev - 1;
        setItems(history[nextPtr].items);
        setOptions(history[nextPtr].options);
        return nextPtr;
      }
      return prev;
    });
  };

  const redo = () => {
    setHistoryPointer(prev => {
      if (prev < history.length - 1) {
        isNavigatingRef.current = true;
        const nextPtr = prev + 1;
        setItems(history[nextPtr].items);
        setOptions(history[nextPtr].options);
        return nextPtr;
      }
      return prev;
    });
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addOption = (option: Omit<Option, 'id'>) => {
    const newOption = { ...option, id: crypto.randomUUID() };
    setOptions((prev) => [...prev, newOption]);
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    setOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt)));
  };

  const deleteOption = (id: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  const duplicateOption = (id: string) => {
    setOptions((prev) => {
      const opt = prev.find(o => o.id === id);
      if (!opt) return prev;
      const newOption = { ...opt, id: crypto.randomUUID(), picked: false };
      return [...prev, newOption];
    });
  };

  const pickOption = (itemId: string, optionId: string) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.itemId === itemId) {
          return { ...opt, picked: opt.id === optionId };
        }
        return opt;
      })
    );
  };

  const resetData = () => {
    setItems(INITIAL_ITEMS);
    setOptions([]);
  };

  const importData = (data: StoreState) => {
    if (data.items && data.options) {
      setItems(data.items);
      setOptions(data.options);
    }
  };

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < history.length - 1;

  return (
    <StoreContext.Provider
      value={{
        items,
        options,
        updateItem,
        addOption,
        updateOption,
        deleteOption,
        duplicateOption,
        pickOption,
        resetData,
        importData,
        undo,
        redo,
        canUndo,
        canRedo
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
