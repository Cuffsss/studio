"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Patient, SleepSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Clock, Play, CheckCircle, StopCircle, BedDouble } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface DashboardProps {
  patients: Patient[];
  sleepSessions: SleepSession[];
  onStartSession: (patientId: string) => void;
  onEndSession: (sessionId: string) => void;
  onAddCheckup: (sessionId: string) => void;
}

export default function Dashboard({ patients, sleepSessions, onStartSession, onEndSession, onAddCheckup }: DashboardProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(patients[0]?.id);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const selectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId),
    [selectedPatientId, patients]
  );
  
  const activeSession = useMemo(() => 
    sleepSessions.find(s => s.patientId === selectedPatientId && s.endTime === null),
    [selectedPatientId, sleepSessions]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (activeSession) {
      interval = setInterval(() => {
        const duration = new Date().getTime() - new Date(activeSession.startTime).getTime();
        setElapsedTime(formatDuration(duration));
      }, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  if (patients.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No Patients Found</CardTitle>
          <CardDescription>Please add a patient in the 'Manage' tab to begin tracking sleep.</CardDescription>
        </CardHeader>
        <CardContent>
          <BedDouble className="mx-auto h-12 w-12 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a patient..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map(patient => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User /> Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Age:</strong> {selectedPatient.age}</p>
              <p><strong>Notes:</strong> {selectedPatient.notes || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock /> Sleep Session</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {activeSession ? (
                <>
                  <p className="text-sm text-muted-foreground">Session started at {new Date(activeSession.startTime).toLocaleTimeString()}</p>
                  <p className="text-6xl font-bold font-mono text-primary">{elapsedTime}</p>
                  <p className="text-sm text-muted-foreground">Last check-up: {activeSession.checkups.length > 0 ? new Date(activeSession.checkups[activeSession.checkups.length-1]).toLocaleTimeString() : 'N/A'}</p>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => onAddCheckup(activeSession.id)}>
                      <CheckCircle className="mr-2" /> Check Up
                    </Button>
                    <Button variant="destructive" onClick={() => onEndSession(activeSession.id)}>
                      <StopCircle className="mr-2" /> End Sleep
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">No active sleep session.</p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={() => selectedPatientId && onStartSession(selectedPatientId)}>
                    <Play className="mr-2" /> Start New Sleep Session
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
