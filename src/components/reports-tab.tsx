
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import type { Person, SleepLog } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { FileQuestion } from 'lucide-react';

interface ReportsTabProps {
  logs: SleepLog[];
  people: Person[];
}

export default function ReportsTab({ logs, people }: ReportsTabProps) {
  
  const averageSleepData = useMemo(() => {
    const personSleepTotals: { [personId: string]: { totalDurationMs: number, sessionCount: number } } = {};

    logs.forEach(log => {
      if (log.action === 'start') {
        const endLog = logs.find(l => l.sessionId === log.sessionId && l.action === 'end');
        if (endLog) {
          const durationMs = endLog.timestamp.getTime() - log.timestamp.getTime();
          if (!personSleepTotals[log.personId]) {
            personSleepTotals[log.personId] = { totalDurationMs: 0, sessionCount: 0 };
          }
          personSleepTotals[log.personId].totalDurationMs += durationMs;
          personSleepTotals[log.personId].sessionCount++;
        }
      }
    });

    return people.map(person => {
      const totals = personSleepTotals[person.id];
      const averageMs = totals && totals.sessionCount > 0 ? totals.totalDurationMs / totals.sessionCount : 0;
      return {
        name: person.name,
        'Average Sleep (hours)': parseFloat((averageMs / (1000 * 60 * 60)).toFixed(2)),
      };
    }).filter(d => d['Average Sleep (hours)'] > 0);
  }, [logs, people]);


  const sessionsLast7Days = useMemo(() => {
    const dateCounts: { [date: string]: number } = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dateCounts[dateString] = 0;
    }

    logs.forEach(log => {
        if (log.action === 'start' && log.timestamp >= sevenDaysAgo) {
            const dateString = log.timestamp.toISOString().split('T')[0];
            if (dateCounts[dateString] !== undefined) {
                dateCounts[dateString]++;
            }
        }
    });

    return Object.entries(dateCounts)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Sleep Sessions': count
      }))
      .reverse(); 

  }, [logs]);

  const hasData = logs.length > 0 && people.length > 0;

  if (!hasData) {
    return (
      <div className="p-4 pb-24 space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Visualize sleep patterns and trends</p>
        </div>
        <Card className="p-8 text-center bg-card border-border">
          <FileQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Not Enough Data</h3>
          <p className="text-muted-foreground">Track some sleep sessions to see reports here.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Visualize sleep patterns and trends</p>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle>Average Sleep Duration</CardTitle>
          <CardDescription>Average time spent sleeping per session for each person.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {averageSleepData.length > 0 ? (
                <BarChart data={averageSleepData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))"
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Average Sleep (hours)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No completed sleep sessions to report.
                </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle>Sleep Sessions Over Last 7 Days</CardTitle>
          <CardDescription>Total number of sleep sessions started each day.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sessionsLast7Days}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))"
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="Sleep Sessions" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
