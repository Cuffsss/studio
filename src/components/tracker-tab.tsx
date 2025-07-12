
"use client";

import { useEffect, useState } from 'react';
import { Moon, User, CheckCircle, Square, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Person, SleepSession } from "@/lib/types";
import CircularProgress from './circular-progress';

interface TrackerTabProps {
  people: Person[];
  activeSessions: SleepSession[];
  onStartSleep: (personId: string) => void;
  onCheckup: (sessionId: string) => void;
  onEndSleep: (sessionId: string) => void;
  checkupIntervalMs: number;
}

const TimeSince: React.FC<{ date: Date }> = ({ date }) => {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
      
      if (diffSeconds < 60) {
        setTimeSince('just now');
      } else {
        const diffMinutes = Math.floor(diffSeconds / 60);
        setTimeSince(`${diffMinutes}m ago`);
      }
    };

    update();
    const interval = setInterval(update, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [date]);

  return <span>{timeSince}</span>;
}

const SessionTimer: React.FC<{ session: SleepSession, checkupIntervalMs: number }> = ({ session, checkupIntervalMs }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const lastCheckupTime = session.checkups.length > 0 
      ? new Date(session.checkups[session.checkups.length - 1]).getTime()
      : new Date(session.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsedTime = now - lastCheckupTime;
      const remainingTime = Math.max(0, checkupIntervalMs - elapsedTime);
      
      const currentProgress = (elapsedTime / checkupIntervalMs) * 100;
      setProgress(Math.min(100, currentProgress));

      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, checkupIntervalMs]);

  const needsCheckup = progress >= 100;

  return (
     <div className="flex flex-col items-center gap-2">
        <CircularProgress progress={progress} needsCheckup={needsCheckup}>
            <div className="text-center">
                <div className={cn("text-lg font-bold", needsCheckup ? "text-red-400" : "text-foreground")}>{timeLeft}</div>
                <div className="text-xs text-muted-foreground">Next checkup</div>
            </div>
        </CircularProgress>
    </div>
  )
}

export default function TrackerTab({
  people,
  activeSessions,
  onStartSleep,
  onCheckup,
  onEndSleep,
  checkupIntervalMs
}: TrackerTabProps) {
  const getActiveSession = (personId: string) =>
    activeSessions.find(session => session.personId === personId && session.status === 'active');

  const getTimeSinceLastCheckup = (session: SleepSession) => {
    const lastCheckup = session.checkups.length > 0 ? session.checkups[session.checkups.length - 1] : session.startTime;
    const now = new Date();
    return Math.floor((now.getTime() - new Date(lastCheckup).getTime()) / (1000 * 60));
  };
  
  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">MFSFD - Sleep Tracker</h1>
        <p className="text-muted-foreground">Monitor sleep sessions for people in your care</p>
      </div>

      {people.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <Moon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No people added yet</h3>
          <p className="text-muted-foreground mb-4">Add people to your care to start tracking their sleep</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {people.map((person) => {
            const activeSession = getActiveSession(person.id);
            const timeSinceLastCheckup = activeSession ? getTimeSinceLastCheckup(activeSession) : 0;
            const needsCheckup = timeSinceLastCheckup >= (checkupIntervalMs / 60000);

            return (
              <Card key={person.id} className="p-4 bg-card border-border shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{person.name}</h3>
                      {person.age && <p className="text-sm text-muted-foreground">Age: {person.age}</p>}
                    </div>
                  </div>
                  {activeSession && (
                    <Badge variant={needsCheckup ? "destructive" : "default"} className={cn(
                      needsCheckup ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    )}>
                      {activeSession.status === 'active' ? 'Sleeping' : 'Completed'}
                    </Badge>
                  )}
                </div>

                {activeSession ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Started: {new Date(activeSession.startTime).toLocaleTimeString()}</div>
                          {activeSession.checkups.length > 0 && (
                            <div>
                              Last check: <TimeSince date={activeSession.checkups[activeSession.checkups.length - 1]} />
                            </div>
                          )}
                        </div>
                        <SessionTimer session={activeSession} checkupIntervalMs={checkupIntervalMs} />
                    </div>
                    
                    {needsCheckup && (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                        <p className="text-sm text-red-400 font-medium">
                          ⚠️ Checkup due
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant={needsCheckup ? "default" : "outline"}
                        size="sm"
                        onClick={() => onCheckup(activeSession.id)}
                        className={cn(
                          "flex-1",
                          needsCheckup ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600" : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Log Checkup ({activeSession.checkups.length})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onEndSleep(activeSession.id)}
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        End Sleep
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => onStartSleep(person.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Sleep
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
