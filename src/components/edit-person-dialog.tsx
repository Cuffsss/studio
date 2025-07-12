
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Person } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  age: z.coerce.number().int().positive().optional(),
  notes: z.string().max(200).optional(),
});


interface EditPersonDialogProps {
  person: Person;
  onEditPerson: (personId: string, data: Omit<Person, 'id' | 'notificationsEnabled'>) => void;
  children: React.ReactNode;
}

export default function EditPersonDialog({ person, onEditPerson, children }: EditPersonDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: person.name,
      age: person.age,
      notes: person.notes,
    },
  });

  useEffect(() => {
    form.reset({
        name: person.name,
        age: person.age,
        notes: person.notes,
    })
  }, [person, form])


  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onEditPerson(person.id, {
      name: values.name.trim(),
      age: values.age,
      notes: values.notes?.trim() || undefined
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit {person.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name" className="text-foreground">Name *</Label>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      maxLength={50}
                      className="bg-input border-border text-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="age" className="text-foreground">Age (optional)</Label>
                  <FormControl>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      className="bg-input border-border text-foreground"
                      {...field}
                      onChange={event => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="notes" className="text-foreground">Notes (optional)</Label>
                   <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes"
                      maxLength={200}
                      className="bg-input border-border text-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
