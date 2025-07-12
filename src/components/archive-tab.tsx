"use client";

import { useState } from "react";
import { Play, CheckCircle, Square, Clock, Copy, Archive, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SleepLog, Person } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ArchiveTabProps {
  logs: SleepLog[];
  people: Person[];
}

export default function ArchiveTab({ logs, people }: ArchiveTabProps) {
  const [filterDate, setFilterDate] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const { toast } = useToast();

  const filteredLogs = logs.filter(log => {
    const matchesName = selectedPerson === "all" || log.personId === selectedPerson;
    const matchesDate = !filterDate || log.timestamp.toISOString().split('T')[0] === filterDate;
    return matchesName && matchesDate;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const logText = filteredLogs.map(log =>
        `${log.timestamp.toLocaleString()} - ${log.personName}: ${log.action.toUpperCase()}${log.notes ? `\n  Notes: ${log.notes}` : ''}`
      ).join('\n');
      
      navigator.clipboard.writeText(logText);
      toast({ title: "Copied!", description: "Logs copied to clipboard."});
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'start': return <Play className="w-4 h-4 text-green-400" />;
      case 'checkup': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'end': return <Square className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sleep Archive</h1>
        <p className="text-muted-foreground">View and export sleep tracking history</p>
      </div>

      <Card className="p-4 bg-card border-border shadow-md">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedPerson} onValueChange={setSelectedPerson}>
              <SelectTrigger className="flex-1 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by person" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All People</SelectItem>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 bg-input border-border text-foreground"
            />
          </div>
          
          <Button onClick={copyToClipboard} variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Copy className="w-4 h-4 mr-2" />
            Copy Logs to Clipboard ({filteredLogs.length} entries)
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center bg-card border-border">
            <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No logs found</h3>
            <p className="text-muted-foreground">No sleep tracking data matches your filters</p>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="p-3 bg-card border-border shadow-sm">
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{log.personName}</span>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      {log.action.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.timestamp.toLocaleString()}
                  </p>
                  {log.notes && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm text-foreground border border-border/50">
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Notes:</span>
                        </p>
                      <p className="pl-6 text-muted-foreground">{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
