"use client";

import { useEffect, useState } from 'react';
import { Moon, User, CheckCircle, Square, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Person, SleepSession } from "@/lib/types";

interface TrackerTabProps {
  people: Person[];
  activeSessions: SleepSession[];
  onStartSleep: (personId: string) => void;
  onCheckup: (sessionId: string) => void;
  onEndSleep: (sessionId: string) => void;
}

const TimeSince: React.FC<{ date: Date }> = ({ date }) => {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
      setTimeSince(`${diffMinutes}m ago`);
    };

    update();
    const interval = setInterval(update, 60000); // update every minute
    return () => clearInterval(interval);
  }, [date]);

  return <span>{timeSince}</span>;
}

export default function TrackerTab({
  people,
  activeSessions,
  onStartSleep,
  onCheckup,
  onEndSleep
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
        <div className="space-y-3">
          {people.map((person) => {
            const activeSession = getActiveSession(person.id);
            const timeSinceLastCheckup = activeSession ? getTimeSinceLastCheckup(activeSession) : 0;
            const needsCheckup = timeSinceLastCheckup >= 10;

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
                      "text-white",
                      needsCheckup ? "bg-red-500" : "bg-green-500"
                    )}>
                      {activeSession.status === 'active' ? 'Sleeping' : 'Completed'}
                    </Badge>
                  )}
                </div>

                {activeSession ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Started: {new Date(activeSession.startTime).toLocaleTimeString()}
                      {activeSession.checkups.length > 0 && (
                        <span className="ml-4">
                          Last checkup: <TimeSince date={activeSession.checkups[activeSession.checkups.length - 1]} />
                        </span>
                      )}
                    </div>
                    
                    {needsCheckup && (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-400 font-medium">
                          ⚠️ Checkup needed ({timeSinceLastCheckup} minutes since last check)
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
                        Check Up ({activeSession.checkups.length})
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
