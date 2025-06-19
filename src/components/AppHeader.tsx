
"use client";

import Link from 'next/link';
import { Truck } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { mockNotifications } from '@/constants/mockData';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <div className="container mx-auto flex h-full items-center">
        <SidebarTrigger className="shrink-0" />
        <div className="flex items-center gap-2 ml-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl text-primary hidden sm:inline">DockWatch</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
           <NotificationBell notifications={mockNotifications} />
        </div>
      </div>
    </header>
  );
}
