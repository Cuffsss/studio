
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Archive, Settings, LogOut, LineChart } from "lucide-react";
import type { Person, SleepSession, SleepLog, ActiveTab, UserData } from '@/lib/types';
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


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tracker");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSessions, setActiveSessions] = useState<SleepSession[]>([]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [checkupIntervalMin, setCheckupIntervalMin] = useState(DEFAULT_CHECKUP_INTERVAL_MIN);
  const [alarmIntervalMin, setAlarmIntervalMin] = useState(DEFAULT_ALARM_INTERVAL_MIN);

  const { toast } = useToast();
  const router = useRouter();

  const people = userData?.people || [];
  const logs = userData?.logs || [];
  const currentUser = userData?.user;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
           if (res.status === 401) {
            router.push('/login');
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch user data.' });
          }
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the server.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, toast]);
  
  // Update data on server
  const updateUserData = async (updatedData: Partial<UserData>) => {
    const optimisticData = { ...userData, ...updatedData } as UserData;
    setUserData(optimisticData); // Optimistic update

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
        // Revert optimistic update on failure - could fetch again for true state
        const freshRes = await fetch('/api/data');
        if(freshRes.ok) setUserData(await freshRes.json());
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the server to save data.' });
    }
  };


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
    Cookies.remove('session');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
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

    updateUserData({ logs: [newLog, ...logs] });
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
    updateUserData({ people: [...people, newPerson] });
    toast({ title: "Person Added", description: `${newPerson.name} has been added.` });
  };

  const handleEditPerson = (personId: string, updatedData: Omit<Person, 'id' | 'notificationsEnabled'>) => {
    const updatedPeople = people.map(p => p.id === personId ? { ...p, ...updatedData } : p);
    updateUserData({ people: updatedPeople });
    toast({ title: "Person Updated", description: `${updatedData.name} has been updated.` });
  };

  const handleRemovePerson = (personId: string) => {
    const personName = people.find(p => p.id === personId)?.name;
    const updatedPeople = people.filter(p => p.id !== personId);
    setActiveSessions(prev => prev.filter(s => s.personId !== personId)); // Also remove active sessions for this person
    updateUserData({ people: updatedPeople });
    toast({ title: "Person Removed", description: `${personName || 'Person'} has been removed.`, variant: 'destructive' });
  };

  const renderActiveTab = () => {
     if (isLoading) {
      return (
         <div className="p-4 pb-24 space-y-4 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </div>
          <div className="space-y-4">
            <Card className="p-4"><Skeleton className="h-48" /></Card>
            <Card className="p-4"><Skeleton className="h-48" /></Card>
          </div>
        </div>
      );
    }

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
