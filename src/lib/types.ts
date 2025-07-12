export type Person = {
  id: string;
  name: string;
  age?: number;
  notes?: string;
  notificationsEnabled: boolean;
};

export type SleepSession = {
  id: string;
  personId: string;
  personName: string;
  startTime: Date;
  endTime?: Date;
  checkups: Date[];
  status: 'active' | 'completed';
  notificationTimerId?: NodeJS.Timeout;
};

export type SleepLog = {
  id: string;
  personId: string;
  personName: string;
  action: 'start' | 'checkup' | 'end';
  timestamp: Date;
  sessionId: string;
  notes?: string;
}

export type ActiveTab = 'tracker' | 'archive' | 'settings';
