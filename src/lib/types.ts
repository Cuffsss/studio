export type Patient = {
  id: string;
  name: string;
  age: number;
  notes: string;
  notificationsEnabled: boolean;
};

export type SleepSession = {
  id: string;
  patientId: string;
  startTime: Date;
  endTime: Date | null;
  checkups: Date[];
};

export type ActiveTab = 'dashboard' | 'history' | 'users';
