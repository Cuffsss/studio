"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ActiveTab } from '@/lib/types';

interface AnimatedTabsProps {
  items: { id: ActiveTab; title: string; icon: React.ReactNode }[];
  activeTab: ActiveTab;
  setActiveTab: (id: ActiveTab) => void;
}

export default function AnimatedTabs({ items, activeTab, setActiveTab }: AnimatedTabsProps) {
  const [isHover, setIsHover] = useState<string | null>(null);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg shadow-purple-500/20">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-3 rounded-full transition-colors",
              "text-white/80 hover:text-white",
              activeTab === item.id && "text-white"
            )}
            onClick={() => setActiveTab(item.id)}
            onMouseEnter={() => setIsHover(item.id)}
            onMouseLeave={() => setIsHover(null)}
          >
            <div className="flex flex-col items-center gap-1">
              {item.icon}
              <span className="text-xs">{item.title}</span>
            </div>
            {isHover === item.id && (
              <motion.div
                layoutId="hover-bg"
                className="absolute inset-0 w-full h-full bg-white/10 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {activeTab === item.id && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 w-full h-full bg-white/20 rounded-full"
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
