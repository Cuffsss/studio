"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EndSessionDialogProps {
  personName: string;
  onConfirm: (notes?: string) => void;
  children: React.ReactNode;
}

export default function EndSessionDialog({ personName, onConfirm, children }: EndSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNotes(""); // Reset notes if dialog is closed without confirming
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">End Sleep Session for {personName}?</DialogTitle>
          <DialogDescription>
            This action will end the current sleep session. You can add optional notes below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this sleep session..."
            maxLength={300}
            className="bg-input border-border text-foreground"
            rows={4}
          />
          <p className="text-xs text-right text-muted-foreground">{notes.length} / 300</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Confirm & End Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
