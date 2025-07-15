
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Moon, Archive, Settings, LogOut, LineChart } from "lucide-react";
import type { Person, SleepSession, SleepLog, ActiveTab, Organization, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import Cookies from 'js-cookie';

import AnimatedTabs from '@/components/animated-tabs';
import TrackerTab from '@/components/tracker-tab';
import ArchiveTab from '@/components/archive-tab';
import SettingsTab from '@/components/settings-tab';
import ReportsTab from '@/components/reports-tab';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_CHECKUP_INTERVAL_MIN = 10;
const DEFAULT_ALARM_INTERVAL_MIN = 2;


const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'Alice (Admin)', email: 'alice@example.com', role: 'admin', organizationId: 'org_123_abc'},
    { id: 'user_2', name: 'Bob', email: 'bob@example.com', role: 'member', organizationId: 'org_123_abc' },
];


// Helper function to get data from localStorage
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = localStorage.getItem(key);
  if (item) {
    try {
      // Reviver function to convert date strings back to Date objects
      return JSON.parse(item, (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
    } catch (e) {
      console.error(`Error parsing localStorage item "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

// Helper function to set data in localStorage
const setInLocalStorage = <T>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tracker");
  
  const [people, setPeople] = useState<Person[]>([]);
  const [activeSessions, setActiveSessions] = useState<SleepSession[]>([]);
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [checkupIntervalMin, setCheckupIntervalMin] = useState(DEFAULT_CHECKUP_INTERVAL_MIN);
  const [alarmIntervalMin, setAlarmIntervalMin] = useState(DEFAULT_ALARM_INTERVAL_MIN);

  const { toast } = useToast();
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<boolean>(false);

  // Load initial data from localStorage
  useEffect(() => {
    setPeople(getFromLocalStorage('people', []));
    setActiveSessions(getFromLocalStorage('activeSessions', []));
    setLogs(getFromLocalStorage('logs', []));
    setCheckupIntervalMin(getFromLocalStorage('checkupIntervalMin', DEFAULT_CHECKUP_INTERVAL_MIN));
    setAlarmIntervalMin(getFromLocalStorage('alarmIntervalMin', DEFAULT_ALARM_INTERVAL_MIN));
    setOrganization(getFromLocalStorage('organization', {
      id: 'org_123_abc',
      name: 'Happy Kids Daycare',
      ownerId: 'user_1',
      members: MOCK_USERS,
    }));


    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    setInLocalStorage('people', people);
  }, [people]);

  useEffect(() => {
    setInLocalStorage('activeSessions', activeSessions);
  }, [activeSessions]);

  useEffect(() => {
    setInLocalStorage('logs', logs);
  }, [logs]);

  useEffect(() => {
    setInLocalStorage('checkupIntervalMin', checkupIntervalMin);
  }, [checkupIntervalMin]);
  
  useEffect(() => {
    setInLocalStorage('alarmIntervalMin', alarmIntervalMin);
  }, [alarmIntervalMin]);

  useEffect(() => {
    setInLocalStorage('organization', organization);
  }, [organization]);


  useEffect(() => {
    const token = Cookies.get('firebaseIdToken');
    if (token) {
        setUser(true);
    } else {
        router.push('/');
    }
    setLoading(false);
  }, [router]);
  
  const handleSetCheckupInterval = (minutes: number) => {
    setCheckupIntervalMin(minutes);
    toast({ title: "Settings Updated", description: `Check-up interval set to ${minutes} minutes.` });
  };
  
  const handleSetAlarmInterval = (minutes: number) => {
    setAlarmIntervalMin(minutes);
    toast({ title: "Settings Updated", description: `Alarm interval set to ${minutes} minutes.` });
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Notifications Not Supported',
        description: 'Your browser does not support desktop notifications.',
      });
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast({ title: "Notifications Disabled", description: "You will no longer receive check-up reminders." });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast({ title: "Notifications Enabled", description: "You will now be notified for check-ups." });
      new Notification('Sleep Tracker', {
        body: 'Notifications have been enabled!',
        icon: '/logo.png'
      });
    } else {
      setNotificationsEnabled(false);
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You have blocked notifications. Please enable them in your browser settings.',
      });
    }
  };


  const handleLogout = () => {
    Cookies.remove('firebaseIdToken');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/');
  };

  const tabs = [
    { id: "tracker", title: "Tracker", icon: <Moon className="w-5 h-5" /> },
    { id: "reports", title: "Reports", icon: <LineChart className="w-5 h-5" /> },
    { id: "archive", title: "Archive", icon: <Archive className="w-5 h-5" /> },
    { id: "settings", title: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  const addLog = (personId: string, action: 'start' | 'checkup' | 'end', sessionId: string, notes?: string) => {
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const newLog: SleepLog = {
      id: nanoid(),
      personId,
      personName: person.name,
      action,
      timestamp: new Date(),
      sessionId,
      notes,
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const scheduleNotification = (personName: string, sessionId: string, isFirstCheckup: boolean) => {
    const intervalMs = isFirstCheckup ? checkupIntervalMin * 60 * 1000 : alarmIntervalMin * 60 * 1000;
  
    return setTimeout(() => {
      // Use a functional update to get the latest state inside the timeout
      setActiveSessions(currentActiveSessions => {
        const sessionStillActive = currentActiveSessions.some(s => s.id === sessionId && s.status === 'active');
        
        if (notificationsEnabled && sessionStillActive) {
          const notificationTitle = isFirstCheckup ? 'Check-up Due!' : 'Checkup Overdue!';
          new Notification(notificationTitle, {
            body: `It's time to check on ${personName}.`,
            icon: '/logo.png',
            tag: sessionId, // Use session ID as tag to prevent duplicate notifications
            renotify: true, // Allow re-notification for overdue alerts
          });
          
          const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-07a.mp3');
          audio.play().catch(console.error);

          // Schedule the next overdue alarm
          const newTimerId = scheduleNotification(personName, sessionId, false);
          
          return currentActiveSessions.map(s => 
            s.id === sessionId ? { ...s, notificationTimerId: newTimerId } : s
          );
        }
        return currentActiveSessions;
      });
    }, intervalMs);
  };
  

  const handleStartSleep = (personId: string) => {
    const sessionId = nanoid();
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const notificationTimerId = scheduleNotification(person.name, sessionId, true);

    const newSession: SleepSession = {
      id: sessionId,
      personId,
      personName: person.name,
      startTime: new Date(),
      checkups: [],
      status: 'active',
      notificationTimerId
    };

    setActiveSessions(prev => [...prev, newSession]);
    addLog(personId, 'start', sessionId);
    toast({ title: "Session Started", description: `Sleep session for ${person.name} has started.` });
  };

  const handleCheckup = (sessionId: string) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          // Clear any existing timers (both checkup and alarm)
          if (s.notificationTimerId) {
            clearTimeout(s.notificationTimerId);
          }
          // Schedule the *next* checkup
          const newNotificationTimerId = scheduleNotification(s.personName, sessionId, true);
          return {
            ...s,
            checkups: [...s.checkups, new Date()],
            notificationTimerId: newNotificationTimerId
          };
        }
        return s;
      })
    );
    
    const session = activeSessions.find(s => s.id === sessionId);
    if (session) {
        addLog(session.personId, 'checkup', sessionId);
        toast({ title: "Check-up Logged", description: `Check-up for ${session.personName} has been logged.` });
    }
  };

  const handleEndSleep = (sessionId: string, notes?: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (session.notificationTimerId) {
      clearTimeout(session.notificationTimerId);
    }

    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));

    addLog(session.personId, 'end', sessionId, notes);
    toast({ title: "Session Ended", description: `Sleep session for ${session.personName} has ended.` });
  };

  const handleAddPerson = (personData: Omit<Person, 'id' | 'notificationsEnabled'>) => {
    const newPerson: Person = {
      id: nanoid(),
      ...personData,
      notificationsEnabled: true
    };
    setPeople(prev => [...prev, newPerson]);
    toast({ title: "Person Added", description: `${newPerson.name} has been added.` });
  };

  const handleEditPerson = (personId: string, updatedData: Omit<Person, 'id' | 'notificationsEnabled'>) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, ...updatedData } : p));
    toast({ title: "Person Updated", description: `${updatedData.name} has been updated.` });
  };

  const handleRemovePerson = (personId: string) => {
    const personName = people.find(p => p.id === personId)?.name;
    setPeople(prev => prev.filter(p => p.id !== personId));
    setActiveSessions(prev => prev.filter(s => s.personId !== personId));
    toast({ title: "Person Removed", description: `${personName || 'Person'} has been removed.`, variant: 'destructive' });
  };

  const handleCreateOrganization = (orgName: string) => {
      const newOrg: Organization = {
          id: `org_${nanoid()}`,
          name: orgName.trim(),
          ownerId: 'user_current', // Should be current user's ID
          members: [],
      };
      setOrganization(newOrg);
      toast({ title: 'Success', description: 'Organization created successfully!' });
  };


  const renderActiveTab = () => {
    const checkupIntervalMs = checkupIntervalMin * 60 * 1000;
    switch (activeTab) {
      case "tracker":
        return (
          <TrackerTab
            people={people}
            activeSessions={activeSessions}
            onStartSleep={handleStartSleep}
            onCheckup={handleCheckup}
            onEndSleep={handleEndSleep}
            checkupIntervalMs={checkupIntervalMs}
          />
        );
      case "archive":
        return <ArchiveTab logs={logs} people={people} />;
      case "reports":
        return <ReportsTab logs={logs} people={people} />;
      case "settings":
        return (
          <SettingsTab
            people={people}
            onAddPerson={handleAddPerson}
            onEditPerson={handleEditPerson}
            onRemovePerson={handleRemovePerson}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={requestNotificationPermission}
            checkupIntervalMin={checkupIntervalMin}
            onSetCheckupInterval={handleSetCheckupInterval}
            alarmIntervalMin={alarmIntervalMin}
            onSetAlarmInterval={handleSetAlarmInterval}
            organization={organization}
            onCreateOrganization={handleCreateOrganization}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 space-y-4">
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }
  
  return (
    <>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Sleep Tracker</h1>
      </div>
      {renderActiveTab()}
      <AnimatedTabs items={tabs} active={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};
