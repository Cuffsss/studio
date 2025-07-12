"use client";

import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Bell, BellOff, User, Users } from 'lucide-react';
import { AddUserDialog } from '@/components/add-user-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ManageUsersProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'notificationsEnabled'>) => void;
  onRemovePatient: (patientId: string) => void;
  onToggleNotifications: (patientId: string) => void;
}

export default function ManageUsers({ patients, onAddPatient, onRemovePatient, onToggleNotifications }: ManageUsersProps) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Users /> Manage Patients</CardTitle>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <PlusCircle className="mr-2" /> Add Patient
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {patients.length > 0 ? (
            patients.map(patient => (
              <Card key={patient.id} className="p-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {patient.name} and all their associated sleep data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemovePatient(patient.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Label htmlFor={`notif-switch-${patient.id}`} className="flex items-center gap-2 cursor-pointer">
                        {patient.notificationsEnabled ? <Bell className="text-primary" /> : <BellOff className="text-muted-foreground" />}
                        Notifications
                    </Label>
                    <Switch
                        id={`notif-switch-${patient.id}`}
                        checked={patient.notificationsEnabled}
                        onCheckedChange={() => onToggleNotifications(patient.id)}
                    />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
                <User className="mx-auto h-12 w-12" />
                <p className="mt-4">No patients found. Add one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddUserDialog 
        isOpen={isAddUserDialogOpen}
        setIsOpen={setIsAddUserDialogOpen}
        onAddPatient={onAddPatient}
      />
    </div>
  );
}
