import type { Person, SleepLog } from './types';

export const initialPatients: Person[] = [
  { id: "1", name: "John Doe", age: 75, notes: "Needs regular monitoring", notificationsEnabled: true },
  { id: "2", name: "Jane Smith", age: 68, notificationsEnabled: false }
];

export const initialSleepLogs: SleepLog[] = [];
