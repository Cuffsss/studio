
"use client";

import { useState, useRef } from "react";
import { Play, CheckCircle, Square, Clock, Copy, Archive, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SleepLog, Person } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ArchiveTabProps {
  logs: SleepLog[];
  people: Person[];
}

export default function ArchiveTab({ logs, people }: ArchiveTabProps) {
  const [filterDate, setFilterDate] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const logsContainerRef = useRef<HTMLDivElement>(null);


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

  const exportToPdf = async () => {
    if (filteredLogs.length === 0) {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "No logs to export."
        });
        return;
    }

    setIsExporting(true);
    toast({ title: "Exporting...", description: "Generating PDF, please wait." });

    // Create a temporary element for PDF generation
    const pdfElement = document.createElement("div");
    pdfElement.style.position = "absolute";
    pdfElement.style.left = "-9999px";
    pdfElement.style.background = "white";
    pdfElement.style.padding = "20px";
    pdfElement.style.fontFamily = "sans-serif";
    pdfElement.style.color = "black";
    pdfElement.style.width = "800px";

    const personFilterText = selectedPerson === "all" ? "All People" : people.find(p => p.id === selectedPerson)?.name || 'Unknown Person';
    const dateFilterText = filterDate ? new Date(filterDate).toLocaleDateString() : 'All Dates';

    let tableHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Sleep Log Report</h1>
      <p style="font-size: 14px; margin-bottom: 16px;">Filters: ${personFilterText} | ${dateFilterText}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Timestamp</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Person</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Action</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Notes</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    filteredLogs.forEach(log => {
        tableHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.timestamp.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.personName}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${log.action}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.notes || ''}</td>
            </tr>
        `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    pdfElement.innerHTML = tableHTML;
    document.body.appendChild(pdfElement);

    try {
        const canvas = await html2canvas(pdfElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        const personFilter = selectedPerson === "all" ? "all-people" : people.find(p => p.id === selectedPerson)?.name || 'person';
        const dateFilter = filterDate || 'all-dates';
        pdf.save(`sleep-logs-${personFilter.replace(/\s+/g, '_')}-${dateFilter}.pdf`);

        toast({ title: "Export Successful", description: "Your PDF has been downloaded." });

    } catch (error) {
        console.error("PDF Export Error:", error);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "An error occurred while generating the PDF."
        });
    } finally {
        setIsExporting(false);
        document.body.removeChild(pdfElement);
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
          <div className="flex flex-col sm:flex-row gap-2">
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
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              <Copy className="w-4 h-4 mr-2" />
              Copy Logs ({filteredLogs.length})
            </Button>
             <Button onClick={exportToPdf} disabled={isExporting} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export to PDF'}
            </Button>
          </div>
        </div>
      </Card>

      <div ref={logsContainerRef} className="space-y-2">
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
