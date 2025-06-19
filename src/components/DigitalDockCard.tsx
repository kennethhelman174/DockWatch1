
"use client";

import * as React from 'react';
import type { Dock } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Truck, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceStrict } from 'date-fns';

interface DigitalDockCardProps {
  dock: Dock;
  currentTime: Date;
}

export function DigitalDockCard({ dock, currentTime }: DigitalDockCardProps) {
  const occupiedDuration = React.useMemo(() => {
    if (dock.status === 'occupied' && dock.occupiedSince) {
      try {
        return formatDistanceStrict(new Date(dock.occupiedSince), currentTime, { addSuffix: false });
      } catch (error) {
        console.error("Error formatting date for dock", dock.number, error);
        return "Error";
      }
    }
    return null;
  }, [dock.status, dock.occupiedSince, currentTime]);

  const getSafetyCheckIcon = (completed?: boolean) => {
    if (completed === true) {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    if (completed === false) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <MinusCircle className="h-5 w-5 text-muted-foreground" />; // Not applicable or not started
  };

  const cardBorderColor = dock.type === 'shipping' ? 'border-blue-500' : 'border-orange-500';

  return (
    <Card className={cn("flex flex-col shadow-md h-full", cardBorderColor, "border-2")}>
      <CardHeader className="p-3 bg-card-foreground/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">Dock {dock.number}</CardTitle>
          <Badge className={cn(
            "text-xs px-2 py-0.5",
            dock.type === 'shipping' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
          )}>
            {dock.type === 'shipping' ? 'SHIPPING' : 'RECEIVING'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        {dock.status === 'occupied' || dock.status === 'scheduled' ? (
          <>
            <div className="flex items-center text-sm">
              <Truck className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-semibold">{dock.currentCarrier || 'N/A'}</p>
                <p className="text-muted-foreground">{dock.currentTrailer || 'N/A'}</p>
              </div>
            </div>
            {dock.status === 'occupied' && occupiedDuration && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>At Dock: {occupiedDuration}</span>
              </div>
            )}
             {dock.status === 'scheduled' && dock.scheduledAppointments && dock.scheduledAppointments.length > 0 && (
                <div className="flex items-center text-sm text-primary">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Scheduled: {new Date(dock.scheduledAppointments[0].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">{dock.status.toUpperCase()}</p>
          </div>
        )}
      </CardContent>
      {(dock.status === 'occupied') && (
        <CardFooter className="p-3 border-t bg-card-foreground/5 space-x-3">
          <div className="flex items-center text-xs" title="Pre-Unloading Checks">
            {getSafetyCheckIcon(dock.preUnloadingChecksCompleted)}
            <span className="ml-1.5 hidden sm:inline">Pre-Unload</span>
            <span className="ml-1.5 sm:hidden">Unload</span>
          </div>
          <div className="flex items-center text-xs" title="Pre-Release Checks">
            {getSafetyCheckIcon(dock.preReleaseChecksCompleted)}
            <span className="ml-1.5 hidden sm:inline">Pre-Release</span>
            <span className="ml-1.5 sm:hidden">Release</span>
          </div>
        </CardFooter>
      )}
       {(dock.status !== 'occupied' && dock.status !== 'available') && (
         <CardFooter className="p-3 border-t bg-card-foreground/5">
            <p className="text-sm text-muted-foreground w-full text-center">{dock.status === 'maintenance' ? 'Under Maintenance' : 'Status: ' + dock.status.toUpperCase()}</p>
         </CardFooter>
       )}
        {dock.status === 'available' && (
         <CardFooter className="p-3 border-t bg-success/10">
            <p className="text-sm text-success-foreground w-full text-center font-semibold">AVAILABLE</p>
         </CardFooter>
       )}
    </Card>
  );
}

// Minimal Badge component for use within DigitalDockCard if ui/badge is too heavy or not desired
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={cn("inline-flex items-center rounded-md font-semibold", className)}>
    {children}
  </span>
);
