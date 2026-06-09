'use client';

import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-[#E8DCCB]/50 dark:border-white/5">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button className="p-2 md:hidden text-foreground hover:bg-[#E8DCCB]/30 rounded-full transition-colors">
            <Menu size={24} strokeWidth={2} />
          </button>
          
          <div className="flex items-center gap-2">
            {/* Minimalist Logo placeholder */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[#8FA7B3] flex items-center justify-center text-white font-heading font-bold">
              ED
            </div>
            {title ? (
              <h1 className="text-xl font-heading font-semibold text-foreground">{title}</h1>
            ) : (
              <h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">EntreDos</h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="p-2 relative text-foreground hover:bg-[#E8DCCB]/30 rounded-full transition-colors"
          >
            <Bell size={22} strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-alert border-2 border-background"></span>
          </motion.button>
          <div className="hidden md:flex w-8 h-8 rounded-full bg-[#E8DCCB] items-center justify-center text-primary font-semibold text-sm border border-transparent cursor-pointer">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
