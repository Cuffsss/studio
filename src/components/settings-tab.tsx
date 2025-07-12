
"use client";

import { useState } from 'react';
import { Bell, User, Trash2, Sun, Moon, Laptop, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AddPersonDialog from './add-user-dialog';
import type { Person } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsTabProps {
  people: Person[];
  onAddPerson: (person: Omit<Person, 'id' | 'notificationsEnabled'>) => void;
  onRemovePerson: (personId: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  checkupIntervalMin: number;
  onSetCheckupInterval: (minutes: number) => void;
}

export default function SettingsTab({
  people,
  onAddPerson,
  onRemovePerson,
  notificationsEnabled,
  onToggleNotifications,
  checkupIntervalMin,
  onSetCheckupInterval,
}: SettingsTabProps) {
  const { setTheme } = useTheme();
  const [interval, setInterval] = useState(checkupIntervalMin.toString());

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterval(e.target.value);
  };

  const handleIntervalSave = () => {
    const newInterval = parseInt(interval);
    if (!isNaN(newInterval) && newInterval > 0) {
      onSetCheckupInterval(newInterval);
    } else {
      // Reset to original value if input is invalid
      setInterval(checkupIntervalMin.toString());
    }
  };


  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your sleep tracking preferences</p>
      </div>

      <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-2 text-foreground">Theme</h3>
        <p className="text-sm text-muted-foreground mb-4">Select your preferred color scheme.</p>
        <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" /> Light</Button>
            <Button variant="outline" onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" /> Dark</Button>
            <Button variant="outline" onClick={() => setTheme("system")}><Laptop className="mr-2 h-4 w-4" /> System</Button>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Bell className="w-5 h-5 text-blue-400" />
          Notifications
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Get notified when checkups are due
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={onToggleNotifications}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-input"
          />
        </div>
      </Card>

      <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-4 text-foreground">App Settings</h3>
        <div className="space-y-2">
            <Label htmlFor="checkup-interval" className="text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Check-up Interval (minutes)
            </Label>
             <div className="flex items-center gap-2">
              <Input
                id="checkup-interval"
                type="number"
                value={interval}
                onChange={handleIntervalChange}
                onBlur={handleIntervalSave}
                min="1"
                className="bg-input border-border text-foreground"
              />
              <Button onClick={handleIntervalSave} variant="outline">Set</Button>
            </div>
          </div>
      </Card>

      <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <User className="w-5 h-5 text-purple-400" />
          People in Your Care
        </h3>
        
        <div className="space-y-3 mb-4">
          {people.map((person) => (
            <div key={person.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{person.name}</p>
                {person.age && <p className="text-sm text-muted-foreground">Age: {person.age}</p>}
                {person.notes && <p className="text-sm text-muted-foreground">{person.notes}</p>}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {person.name} and all their sleep data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemovePerson(person.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>

        <AddPersonDialog onAddPerson={onAddPerson} />
      </Card>

    </div>
  );
};
