"use client";

import { useState } from 'react';
import type { Patient, SleepSession, ActiveTab } from '@/lib/types';
import { initialPatients, initialSleepSessions } from '@/lib/data';
import BottomNav from '@/components/bottom-nav';
import Dashboard from '@/components/dashboard';
import HistoryView from '@/components/history-view';
import ManageUsers from '@/components/manage-users';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>(initialSleepSessions);
  const { toast } = useToast();

  const addPatient = (patient: Omit<Patient, 'id' | 'notificationsEnabled'>) => {
    const newPatient: Patient = {
      ...patient,
      id: nanoid(),
      notificationsEnabled: true,
    };
    setPatients(prev => [...prev, newPatient]);
    toast({
      title: "Patient Added",
      description: `${patient.name} has been added to the system.`,
    });
  };

  const removePatient = (patientId: string) => {
    const patientName = patients.find(p => p.id === patientId)?.name || 'Patient';
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setSleepSessions(prev => prev.filter(s => s.patientId !== patientId));
    toast({
      title: "Patient Removed",
      description: `${patientName} and all their data have been removed.`,
      variant: 'destructive',
    });
  };

  const togglePatientNotifications = (patientId: string) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId ? { ...p, notificationsEnabled: !p.notificationsEnabled } : p
      )
    );
  };
  
  const startSession = (patientId: string) => {
    const newSession: SleepSession = {
      id: nanoid(),
      patientId,
      startTime: new Date(),
      endTime: null,
      checkups: [],
    };
    setSleepSessions(prev => [...prev, newSession]);
    const patient = patients.find(p => p.id === patientId);
    if(patient) {
      toast({
        title: "Session Started",
        description: `Sleep session for ${patient.name} has started.`,
      });
    }
  };

  const endSession = (sessionId: string) => {
    setSleepSessions(prev => 
      prev.map(s => s.id === sessionId ? { ...s, endTime: new Date() } : s)
    );
    const session = sleepSessions.find(s => s.id === sessionId);
    if (session) {
      const patient = patients.find(p => p.id === session.patientId);
      toast({
        title: "Session Ended",
        description: `Sleep session for ${patient?.name || 'patient'} has ended.`,
      });
    }
  };

  const addCheckup = (sessionId: string) => {
    setSleepSessions(prev => 
      prev.map(s => s.id === sessionId ? { ...s, checkups: [...s.checkups, new Date()] } : s)
    );
     const session = sleepSessions.find(s => s.id === sessionId);
    if (session) {
      const patient = patients.find(p => p.id === session.patientId);
      toast({
        title: "Check-up Logged",
        description: `Check-up for ${patient?.name || 'patient'} has been logged.`,
      });
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  patients={patients} 
                  sleepSessions={sleepSessions} 
                  onStartSession={startSession}
                  onEndSession={endSession}
                  onAddCheckup={addCheckup}
                />;
      case 'history':
        return <HistoryView patients={patients} sleepSessions={sleepSessions} />;
      case 'users':
        return <ManageUsers 
                  patients={patients}
                  onAddPatient={addPatient}
                  onRemovePatient={removePatient}
                  onToggleNotifications={togglePatientNotifications}
                />;
      default:
        return <Dashboard 
                  patients={patients} 
                  sleepSessions={sleepSessions} 
                  onStartSession={startSession}
                  onEndSession={endSession}
                  onAddCheckup={addCheckup}
                />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center font-headline">MFSFD - Sleep Tracker</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
