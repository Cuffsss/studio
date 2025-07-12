"use client";

import { useState, useMemo } from 'react';
import type { Patient, SleepSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { formatDuration } from '@/lib/utils';

interface HistoryViewProps {
  patients: Patient[];
  sleepSessions: SleepSession[];
}

export default function HistoryView({ patients, sleepSessions }: HistoryViewProps) {
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const filteredSessions = useMemo(() => {
    return sleepSessions
      .filter(session => session.endTime) // Only show completed sessions
      .filter(session => patientFilter === 'all' || session.patientId === patientFilter)
      .filter(session => !dateFilter || format(new Date(session.startTime), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [sleepSessions, patientFilter, dateFilter]);

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select value={patientFilter} onValueChange={setPatientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by patient..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
           {dateFilter && <Button variant="ghost" onClick={() => setDateFilter(undefined)}>Clear Date</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sleep Log History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>{filteredSessions.length > 0 ? 'A list of past sleep sessions.' : 'No sleep sessions match the current filters.'}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-center">Check-ups</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map(session => {
                const duration = session.endTime ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : 0;
                return (
                  <TableRow key={session.id}>
                    <TableCell>{getPatientName(session.patientId)}</TableCell>
                    <TableCell>{format(new Date(session.startTime), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatDuration(duration)}</TableCell>
                    <TableCell className="text-center">{session.checkups.length}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
