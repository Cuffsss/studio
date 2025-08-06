
"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Moon, Archive, Settings, LogOut, LineChart } from "lucide-react";
import type { Person, SleepSession, SleepLog, ActiveTab } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import Cookies from 'js-cookie';

import { firebaseApp } from '@/lib/firebase';
import AnimatedTabs from '@/components/animated-tabs';
import TrackerTab from '@/components/tracker-tab';
import ArchiveTab from '@/components/archive-tab';
import SettingsTab from '@/components/settings-tab';
import ReportsTab from '@/components/reports-tab';

const DEFAULT_CHECKUP_INTERVAL_MIN = 10;
const DEFAULT_ALARM_INTERVAL_MIN = 2;

// NOTE: All data is now ephemeral and will be reset on page load.
// This sets the stage for a database integration.

const getInitialPeople = (): Person[] => [];
const getInitialLogs = (): SleepLog[] => [];


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tracker");
  
  const [people, setPeople] = useState<Person[]>(getInitialPeople());
  const [activeSessions, setActiveSessions] = useState<SleepSession[]>([]);
  const [logs, setLogs] = useState<SleepLog[]>(getInitialLogs());

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [checkupIntervalMin, setCheckupIntervalMin] = useState(DEFAULT_CHECKUP_INTERVAL_MIN);
  const [alarmIntervalMin, setAlarmIntervalMin] = useState(DEFAULT_ALARM_INTERVAL_MIN);

  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth state listener
  useEffect(() => {
    if (!firebaseApp.options?.apiKey) {
      // Firebase not configured, no need to listen for auth state
      return;
    }
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const idToken = await user.getIdToken();
        // Send token to server to create session cookie
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
      } else {
        setCurrentUser(null);
        // Remove cookie and redirect
        Cookies.remove('session');
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);


  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

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

  const handleLogout = async () => {
    if (!firebaseApp.options?.apiKey) return;
    try {
        const auth = getAuth(firebaseApp);
        await signOut(auth);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Logout Failed", description: "An error occurred while logging out." });
    }
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

  const scheduleOverdueAlarm = (personName: string, sessionId: string) => {
    const alarmIntervalMs = alarmIntervalMin * 60 * 1000;
  
    return setTimeout(() => {
      setActiveSessions(currentActiveSessions => {
        const session = currentActiveSessions.find(s => s.id === sessionId);
        if (session && session.status === 'active' && notificationsEnabled) {
          const lastEventTime = session.checkups.length > 0
            ? new Date(session.checkups[session.checkups.length - 1]).getTime()
            : new Date(session.startTime).getTime();
          
          const isStillOverdue = (Date.now() - lastEventTime) >= (checkupIntervalMin * 60 * 1000);

          if (isStillOverdue) {
              new Notification('Checkup Overdue!', {
                  body: `Please check on ${personName}. The alarm will sound again in ${alarmIntervalMin} minutes.`,
                  icon: '/logo.png',
                  tag: sessionId,
                  renotify: true,
              });
  
              const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-07a.mp3');
              audio.play().catch(console.error);

              const newTimerId = scheduleOverdueAlarm(personName, sessionId);
              return currentActiveSessions.map(s => s.id === sessionId ? { ...s, notificationTimerId: newTimerId } : s);
          }
        }
        return currentActiveSessions;
      });
    }, alarmIntervalMs);
  };
  
  const scheduleCheckupNotification = (personName: string, sessionId: string) => {
    const checkupIntervalMs = checkupIntervalMin * 60 * 1000;
  
    return setTimeout(() => {
        setActiveSessions(currentActiveSessions => {
            const session = currentActiveSessions.find(s => s.id === sessionId);
            if (session && session.status === 'active' && notificationsEnabled) {
                new Notification('Check-up Due!', {
                    body: `It's time to check on ${personName}.`,
                    icon: '/logo.png',
                    tag: sessionId,
                });

                const newTimerId = scheduleOverdueAlarm(personName, sessionId);
                return currentActiveSessions.map(s => s.id === sessionId ? { ...s, notificationTimerId: newTimerId } : s);
            }
            return currentActiveSessions;
        });
    }, checkupIntervalMs);
  };
  
  const handleStartSleep = (personId: string) => {
    const sessionId = nanoid();
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const notificationTimerId = scheduleCheckupNotification(person.name, sessionId);

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
          if (s.notificationTimerId) {
            clearTimeout(s.notificationTimerId);
          }
          const newNotificationTimerId = scheduleCheckupNotification(s.personName, sessionId);
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
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        );
      default:
        return null;
    }
  };
  
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
