export type Status = 'Not started' | 'Researching' | 'Shortlisted' | 'Decided';

export type Vibe = 'Love it' | "It's fine" | 'Not sure' | 'Overpriced';

export interface Option {
  id: string;
  itemId: string;
  url: string;
  title: string;
  price: number;
  rating: number; // 0-5
  vibe: Vibe | '';
  notes: string;
  picked: boolean;
  faviconUrl: string;
  domain: string;
  image?: string;
}

export interface Item {
  id: string;
  name: string;
  status: Status;
  budget: number;
  notes: string;
}

export interface StoreState {
  items: Item[];
  options: Option[];
}

export const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Washing machine', status: 'Not started', budget: 0, notes: '' },
  { id: '2', name: 'Bed', status: 'Not started', budget: 0, notes: '' },
  { id: '3', name: 'Mattress', status: 'Not started', budget: 0, notes: '' },
  { id: '4', name: 'Sofa', status: 'Not started', budget: 0, notes: '' },
  { id: '5', name: 'Centre table', status: 'Not started', budget: 0, notes: '' },
  { id: '6', name: 'Chairs', status: 'Not started', budget: 0, notes: '' },
  { id: '7', name: 'TV', status: 'Not started', budget: 0, notes: '' },
  { id: '8', name: 'Bedside table', status: 'Not started', budget: 0, notes: '' },
  { id: '9', name: 'Mirror', status: 'Not started', budget: 0, notes: '' },
  { id: '10', name: 'Lamps', status: 'Not started', budget: 0, notes: '' },
  { id: '11', name: 'Plants', status: 'Not started', budget: 0, notes: '' },
  { id: '12', name: 'Carpets', status: 'Not started', budget: 0, notes: '' },
];
