"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import { Moon, Archive, Settings } from "lucide-react";
import type { Person, SleepSession, SleepLog, ActiveTab } from '@/lib/types';
import { initialPatients, initialSleepLogs } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

import AnimatedTabs from '@/components/animated-tabs';
import TrackerTab from '@/components/tracker-tab';
import ArchiveTab from '@/components/archive-tab';
import SettingsTab from '@/components/settings-tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tracker");
  const [people, setPeople] = useState<Person[]>(initialPatients);
  const [activeSessions, setActiveSessions] = useState<SleepSession[]>([]);
  const [logs, setLogs] = useState<SleepLog[]>(initialSleepLogs);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { toast } = useToast();

  const tabs = [
    { id: "archive", title: "Archive", icon: <Archive className="w-5 h-5" /> },
    { id: "tracker", title: "Tracker", icon: <Moon className="w-5 h-5" /> },
    { id: "settings", title: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  const addLog = (personId: string, action: 'start' | 'checkup' | 'end', sessionId: string) => {
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const newLog: SleepLog = {
      id: nanoid(),
      personId,
      personName: person.name,
      action,
      timestamp: new Date(),
      sessionId
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const handleStartSleep = (personId: string) => {
    const sessionId = nanoid();
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const newSession: SleepSession = {
      id: sessionId,
      personId,
      personName: person.name,
      startTime: new Date(),
      checkups: [],
      status: 'active'
    };

    setActiveSessions(prev => [...prev, newSession]);
    addLog(personId, 'start', sessionId);
    toast({ title: "Session Started", description: `Sleep session for ${person.name} has started.` });
  };

  const handleCheckup = (sessionId: string) => {
    setActiveSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, checkups: [...session.checkups, new Date()] }
          : session
      )
    );

    const session = activeSessions.find(s => s.id === sessionId);
    if (session) {
      addLog(session.personId, 'checkup', sessionId);
      toast({ title: "Check-up Logged", description: `Check-up for ${session.personName} has been logged.` });
    }
  };

  const handleEndSleep = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const endedSession = { ...session, endTime: new Date(), status: 'completed' as const };

    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));

    addLog(session.personId, 'end', sessionId);
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

  const handleRemovePerson = (personId: string) => {
    const personName = people.find(p => p.id === personId)?.name;
    setPeople(prev => prev.filter(p => p.id !== personId));
    setActiveSessions(prev => prev.filter(s => s.personId !== personId));
    toast({ title: "Person Removed", description: `${personName || 'Person'} has been removed.`, variant: 'destructive' });
  };

  const handleToggleNotifications = () => {
      setNotificationsEnabled(prev => !prev);
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tracker":
        return (
          <TrackerTab
            people={people}
            activeSessions={activeSessions}
            onStartSleep={handleStartSleep}
            onCheckup={handleCheckup}
            onEndSleep={handleEndSleep}
          />
        );
      case "archive":
        return <ArchiveTab logs={logs} people={people} />;
      case "settings":
        return (
          <SettingsTab
            people={people}
            onAddPerson={handleAddPerson}
            onRemovePerson={handleRemovePerson}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderActiveTab()}
      <AnimatedTabs items={tabs} active={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};
