
"use client";

import * as React from 'react';
import { DigitalDockCard } from '@/components/DigitalDockCard';
import { allMockDocks as importedAllMockDocks } from '@/constants/mockData';
import type { Dock } from '@/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function DigitalDisplayPage() {
  const [clientDocks, setClientDocks] = React.useState<Dock[]>([]);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    // Initialize docks from mock data on client side
    setClientDocks(importedAllMockDocks);
  }, []);

  React.useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update current time every 30 seconds for duration display

    return () => clearInterval(timerId);
  }, []);

  const activeDocks = React.useMemo(() => {
    return clientDocks.filter(dock => dock.status === 'occupied' || dock.status === 'scheduled');
  }, [clientDocks]);

  const availableDocks = React.useMemo(() => {
    return clientDocks.filter(dock => dock.status === 'available');
  }, [clientDocks]);
  
  const maintenanceDocks = React.useMemo(() => {
    return clientDocks.filter(dock => dock.status === 'maintenance');
  }, [clientDocks]);


  const shippingDocksToDisplay = activeDocks.filter(d => d.type === 'shipping');
  const receivingDocksToDisplay = activeDocks.filter(d => d.type === 'receiving');

  const availableShippingDocks = availableDocks.filter(d => d.type === 'shipping');
  const availableReceivingDocks = availableDocks.filter(d => d.type === 'receiving');

  const maintenanceShippingDocks = maintenanceDocks.filter(d => d.type === 'shipping');
  const maintenanceReceivingDocks = maintenanceDocks.filter(d => d.type === 'receiving');


  const renderDockSection = (docks: Dock[], title: string) => (
    <section className="mb-6">
      <h2 className="text-3xl font-bold mb-4 px-4 text-primary">{title} ({docks.length})</h2>
      {docks.length === 0 ? (
        <p className="px-4 text-muted-foreground">No docks currently in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-4">
          {docks.map((dock) => (
            <DigitalDockCard key={dock.id} dock={dock} currentTime={currentTime} />
          ))}
        </div>
      )}
    </section>
  );
  
  const renderMinimalDockList = (docks: Dock[], title: string, titleColor: string = "text-primary") => (
     <section className="mb-6">
      <h3 className={cn("text-2xl font-semibold mb-3 px-4", titleColor)}>{title} ({docks.length})</h3>
      {docks.length === 0 ? (
         <p className="px-4 text-sm text-muted-foreground">None</p>
      ) : (
      <div className="flex flex-wrap gap-2 px-4">
        {docks.map(dock => (
          <span key={dock.id} className={cn(
            "px-3 py-1 rounded-md text-sm font-medium",
            dock.type === 'shipping' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
            )}>
            {dock.number}
          </span>
        ))}
      </div>
      )}
    </section>
  );


  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="p-4 bg-background shadow-md">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">DockWatch - Live Status</h1>
         <p className="text-muted-foreground">Last updated: {currentTime.toLocaleTimeString()}</p>
      </header>
      <ScrollArea className="flex-grow p-2">
        <div className="space-y-6">
            {renderDockSection(shippingDocksToDisplay, "Active Shipping Docks")}
            {renderDockSection(receivingDocksToDisplay, "Active Receiving Docks")}
            
            <Separator className="my-6"/>

            {renderMinimalDockList(availableShippingDocks, "Available Shipping Docks", "text-green-600")}
            {renderMinimalDockList(availableReceivingDocks, "Available Receiving Docks", "text-green-600")}

            <Separator className="my-6"/>

            {renderMinimalDockList(maintenanceShippingDocks, "Shipping Docks Under Maintenance", "text-amber-600")}
            {renderMinimalDockList(maintenanceReceivingDocks, "Receiving Docks Under Maintenance", "text-amber-600")}
        </div>
      </ScrollArea>
       <footer className="p-2 text-center text-xs text-muted-foreground border-t bg-background">
        Data refreshes automatically. For detailed interaction, please use the main dashboard.
      </footer>
    </div>
  );
}
