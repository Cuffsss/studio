"use client";

import type { ActiveTab } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, History, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: History },
  { id: 'users', label: 'Manage', icon: Users },
] as const;

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-t-lg">
      <div className="grid grid-cols-3 gap-2 p-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className="flex flex-col h-auto py-2 items-center justify-center"
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
