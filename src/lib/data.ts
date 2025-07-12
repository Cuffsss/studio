import type { Patient, SleepSession } from './types';
import { subDays, subHours } from 'date-fns';

export const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 42,
    notes: 'Tends to wake up frequently during the night.',
    notificationsEnabled: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 35,
    notes: 'Reports feeling well-rested on most days.',
    notificationsEnabled: false,
  },
];

const now = new Date();

export const initialSleepSessions: SleepSession[] = [
  {
    id: 's1',
    patientId: '1',
    startTime: subDays(now, 1),
    endTime: subHours(subDays(now, 1), -8),
    checkups: [
      subHours(subDays(now, 1), -2),
      subHours(subDays(now, 1), -5),
    ],
  },
  {
    id: 's2',
    patientId: '2',
    startTime: subDays(now, 2),
    endTime: subHours(subDays(now, 2), -7),
    checkups: [],
  },
  {
    id: 's3',
    patientId: '1',
    startTime: subDays(now, 3),
    endTime: subHours(subDays(now, 3), -6),
    checkups: [
      subHours(subDays(now, 3), -4),
    ],
  },
];
