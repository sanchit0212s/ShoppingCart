import { useState, useCallback } from 'react';
import { Item, Option, Status, INITIAL_ITEMS } from './types';

// Moved logic to StoreContext to avoid multiple instances issues
