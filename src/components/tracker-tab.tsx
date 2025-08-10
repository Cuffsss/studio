
"use client";

import { useEffect, useState } from 'react';
import { Moon, User, CheckCircle, Square, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration } from "@/lib/utils";
import type { Person, SleepSession } from "@/lib/types";
import CircularProgress from './circular-progress';
import EndSessionDialog from './end-session-dialog';

interface TrackerTabProps {
  people: Person[];
  activeSessions: SleepSession[];
  onStartSleep: (personId: string) => void;
  onCheckup: (sessionId: string) => void;
  onEndSleep: (sessionId: string, notes?: string) => void;
  checkupIntervalMs: number;
}

const SessionDuration: React.FC<{ startTime: Date }> = ({ startTime }) => {
    const [duration, setDuration] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diffMs = now.getTime() - new Date(startTime).getTime();
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            setDuration(`${hours}h ${minutes}m`);
        };

        update();
        const interval = setInterval(update, 30000); // update every 30 seconds
        return () => clearInterval(interval);
    }, [startTime]);

    return <span>{duration}</span>;
}


const SessionTimer: React.FC<{ session: SleepSession, checkupIntervalMs: number }> = ({ session, checkupIntervalMs }) => {
  const [progress, setProgress] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const lastEventTime = session.checkups.length > 0 
      ? new Date(session.checkups[session.checkups.length - 1]).getTime()
      : new Date(session.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsedTime = now - lastEventTime;
      
      if (elapsedTime >= checkupIntervalMs) {
        // Overdue state: count up from when it was due
        if (!isOverdue) setIsOverdue(true);
        const overdueTime = elapsedTime - checkupIntervalMs;
        setTimerDisplay(`-${formatDuration(overdueTime).slice(3)}`); // Show mm:ss
        setProgress(100);
      } else {
        // Countdown state
        if (isOverdue) setIsOverdue(false);
        const remainingTime = checkupIntervalMs - elapsedTime;
        const currentProgress = (elapsedTime / checkupIntervalMs) * 100;
        setTimerDisplay(formatDuration(remainingTime).slice(3)); // show mm:ss
        setProgress(currentProgress);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, checkupIntervalMs, isOverdue]);

  return (
     <div className="flex items-center gap-4">
        <CircularProgress progress={progress} isOverdue={isOverdue}>
            <div className="text-center">
                <div className={cn("text-2xl font-bold tabular-nums", isOverdue ? "text-red-500" : "text-foreground")}>
                    {timerDisplay}
                </div>
            </div>
        </CircularProgress>
        <div>
            <div className={cn("font-semibold", isOverdue ? "text-red-500" : "text-foreground")}>
                {isOverdue ? "Checkup Overdue" : "Next Checkup"}
            </div>
             <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Started: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
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
  
  return (
    <div className="p-4 pb-24 space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sleep Tracker</h1>
        <p className="text-muted-foreground">Monitor sleep sessions for people in your care</p>
      </div>

      {people.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <Moon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No people added yet</h3>
          <p className="text-muted-foreground mb-4">Add people to your care to start tracking their sleep</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {people.map((person) => {
            const activeSession = getActiveSession(person.id);
            const isOverdue = activeSession ? (Date.now() - (activeSession.checkups.length > 0 ? new Date(activeSession.checkups[activeSession.checkups.length-1]).getTime() : new Date(activeSession.startTime).getTime())) >= checkupIntervalMs : false;

            return (
              <Card key={person.id} className={cn("p-4 bg-card border-border shadow-md transition-all", isOverdue && "border-red-500/50 ring-4 ring-red-500/10")}>
                {/* Top Row: Identification & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{person.name}</h3>
                      {person.age && <p className="text-sm text-muted-foreground">Age: {person.age}</p>}
                    </div>
                  </div>
                  {activeSession && (
                    <div className="text-right">
                        <Badge variant={isOverdue ? "destructive" : "default"} className={cn(isOverdue ? "bg-red-500/90" : "bg-green-500/90", "text-white")}>
                            {activeSession.status === 'active' ? 'Sleeping' : 'Completed'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                            <SessionDuration startTime={activeSession.startTime} />
                        </p>
                    </div>
                  )}
                </div>

                {activeSession ? (
                  <div className="space-y-4">
                    {/* Middle Row: Session Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                         <SessionTimer session={activeSession} checkupIntervalMs={checkupIntervalMs} />
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        onClick={() => onCheckup(activeSession.id)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Log Checkup ({activeSession.checkups.length})
                      </Button>
                      <EndSessionDialog 
                        personName={person.name} 
                        onConfirm={(notes) => onEndSleep(activeSession.id, notes)}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          End Sleep
                        </Button>
                      </EndSessionDialog>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => onStartSleep(person.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
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
