
"use client";

import { useState } from 'react';
import type { User } from 'next-auth';
import { Bell, User as UserIcon, Trash2, Sun, Moon, Laptop, Clock, Edit, LogOut, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AddPersonDialog from './add-user-dialog';
import EditPersonDialog from './edit-person-dialog';
import type { Person } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsTabProps {
  people: Person[];
  onAddPerson: (person: Omit<Person, 'id' | 'notificationsEnabled'>) => void;
  onEditPerson: (personId: string, data: Omit<Person, 'id' | 'notificationsEnabled'>) => void;
  onRemovePerson: (personId: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  checkupIntervalMin: number;
  onSetCheckupInterval: (minutes: number) => void;
  alarmIntervalMin: number;
  onSetAlarmInterval: (minutes: number) => void;
  onLogout: () => void;
  currentUser: User | null;
}

export default function SettingsTab({
  people,
  onAddPerson,
  onEditPerson,
  onRemovePerson,
  notificationsEnabled,
  onToggleNotifications,
  checkupIntervalMin,
  onSetCheckupInterval,
  alarmIntervalMin,
  onSetAlarmInterval,
  onLogout,
  currentUser,
}: SettingsTabProps) {
  const { setTheme } = useTheme();
  const [checkupInterval, setCheckupInterval] = useState(checkupIntervalMin.toString());
  const [alarmInterval, setAlarmInterval] = useState(alarmIntervalMin.toString());

  const handleIntervalChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };
  
  const handleIntervalSave = (value: string, onSave: (val: number) => void, originalValue: number, setter: React.Dispatch<React.SetStateAction<string>>) => () => {
    const newInterval = parseInt(value);
    if (!isNaN(newInterval) && newInterval > 0) {
      onSave(newInterval);
    } else {
      setter(originalValue.toString());
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences</p>
      </div>

       <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-2 text-foreground">My Account</h3>
        <div className="text-sm text-muted-foreground">
            <p>Email: <span className="font-medium text-foreground">{currentUser?.email}</span></p>
        </div>
      </Card>


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
          <UserIcon className="w-5 h-5 text-purple-400" />
          People in Your Care
        </h3>
        
        <div className="space-y-3 mb-4">
          {people.length > 0 ? people.map((person) => (
            <div key={person.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{person.name}</p>
                {person.age && <p className="text-sm text-muted-foreground">Age: {person.age}</p>}
                {person.notes && <p className="text-sm text-muted-foreground">{person.notes}</p>}
              </div>
              <div className="flex items-center">
                 <EditPersonDialog person={person} onEditPerson={onEditPerson}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </EditPersonDialog>
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
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">No people added yet. Add someone to start tracking.</p>}
        </div>

        <AddPersonDialog onAddPerson={onAddPerson} />
      </Card>

       <Card className="p-4 bg-card border-border shadow-md">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Bell className="w-5 h-5 text-blue-400" />
          App Settings
        </h3>
        <div className="flex items-center justify-between mb-4">
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
        <div className="space-y-4">
            <div className='space-y-2'>
                <Label htmlFor="checkup-interval" className="text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check-up Timer (minutes)
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                    id="checkup-interval"
                    type="number"
                    value={checkupInterval}
                    onChange={handleIntervalChange(setCheckupInterval)}
                    onBlur={handleIntervalSave(checkupInterval, onSetCheckupInterval, checkupIntervalMin, setCheckupInterval)}
                    min="1"
                    className="bg-input border-border text-foreground"
                    />
                    <Button onClick={handleIntervalSave(checkupInterval, onSetCheckupInterval, checkupIntervalMin, setCheckupInterval)} variant="outline">Set</Button>
                </div>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="alarm-interval" className="text-foreground flex items-center gap-2">
                    <BellRing className="w-4 h-4" />
                    Alarm Sound Interval (minutes)
                </Label>
                 <CardDescription>How often the alarm sounds when a check-up is overdue.</CardDescription>
                <div className="flex items-center gap-2">
                    <Input
                    id="alarm-interval"
                    type="number"
                    value={alarmInterval}
                    onChange={handleIntervalChange(setAlarmInterval)}
                    onBlur={handleIntervalSave(alarmInterval, onSetAlarmInterval, alarmIntervalMin, setAlarmInterval)}
                    min="1"
                    className="bg-input border-border text-foreground"
                    />
                    <Button onClick={handleIntervalSave(alarmInterval, onSetAlarmInterval, alarmIntervalMin, setAlarmInterval)} variant="outline">Set</Button>
                </div>
            </div>
          </div>
      </Card>

      <Button variant="destructive" onClick={onLogout} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

    </div>
  );
};
