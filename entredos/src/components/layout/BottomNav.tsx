'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Plus, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Inicio', icon: Home, href: '/' },
  { name: 'Metas', icon: Target, href: '/metas' },
  { name: 'Add', icon: Plus, href: '/nuevo', isFab: true },
  { name: 'Insights', icon: Sparkles, href: '/insights' },
  { name: 'Perfil', icon: User, href: '/perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent md:hidden">
      <nav className="flex items-center justify-between bg-white dark:bg-[#2A2A32] px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#E8DCCB] dark:border-[#1E1E24]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <div key={item.name} className="relative -top-6">
                <Link href={item.href} className="group flex flex-col items-center">
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 group-hover:bg-primary/90 transition-colors"
                  >
                    <Icon strokeWidth={2.5} size={24} />
                  </motion.div>
                </Link>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="group relative flex flex-col items-center w-12">
              <div className="relative flex items-center justify-center h-10 w-10">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-[#E8DCCB]/50 dark:bg-white/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(
                    "relative z-10 transition-colors duration-200",
                    isActive ? "text-primary dark:text-[#E8DCCB]" : "text-[#8FA7B3] group-hover:text-primary dark:group-hover:text-white"
                  )}
                />
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-medium mt-1 transition-colors duration-200",
                isActive ? "text-primary dark:text-[#E8DCCB]" : "text-[#8FA7B3] group-hover:text-primary dark:group-hover:text-white"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
