
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ActiveTab } from '@/lib/types';

interface AnimatedTabsProps {
  items: { id: ActiveTab; title: string; icon: React.ReactNode }[];
  active: ActiveTab;
  setActiveTab: (id: ActiveTab) => void;
}

export default function AnimatedTabs({ items, active, setActiveTab }: AnimatedTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<ActiveTab | null>(null);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-card/80 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-3 rounded-full transition-colors",
              "text-muted-foreground hover:text-foreground",
              active === item.id && "text-foreground"
            )}
            onClick={() => setActiveTab(item.id)}
            onMouseEnter={() => setHoveredTab(item.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div className="flex flex-col items-center gap-1">
              {item.icon}
              <span className="text-xs">{item.title}</span>
            </div>
            {hoveredTab === item.id && (
              <motion.div
                layoutId="hover-bg"
                className="absolute inset-0 w-full h-full bg-muted/50 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {active === item.id && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 w-full h-full bg-primary/20 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
