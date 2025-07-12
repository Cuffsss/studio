import type { Person, SleepLog } from './types';

// This file is now used only for type definitions, 
// as initial data is loaded from localStorage.
// We keep it to avoid breaking imports, but the arrays are empty.

export const initialPatients: Person[] = [];

export const initialSleepLogs: SleepLog[] = [];
