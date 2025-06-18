"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Dock, DockStatus } from '@/types';
import { CheckCircle2, XCircle, Wrench, CalendarClock, Truck, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DockCardProps {
  dock: Dock;
  onClick: () => void;
}

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  textColor: string;
  borderColor: string;
  iconColor: string;
}

const statusConfigs: Record<DockStatus, StatusConfig> = {
  available: {
    icon: CheckCircle2,
    label: 'Available',
    badgeVariant: 'success',
    textColor: 'text-success-foreground', // On success bg
    borderColor: 'border-success',
    iconColor: 'text-success',
  },
  occupied: {
    icon: Truck,
    label: 'Occupied',
    badgeVariant: 'destructive',
    textColor: 'text-destructive-foreground', // On destructive bg
    borderColor: 'border-destructive',
    iconColor: 'text-destructive',
  },
  maintenance: {
    icon: Wrench,
    label: 'Maintenance',
    badgeVariant: 'warning',
    textColor: 'text-warning-foreground', // On warning bg
    borderColor: 'border-warning',
    iconColor: 'text-warning',
  },
  scheduled: {
    icon: CalendarClock,
    label: 'Scheduled',
    badgeVariant: 'default', // Primary
    textColor: 'text-primary-foreground', // On primary bg
    borderColor: 'border-primary',
    iconColor: 'text-primary',
  },
};


export function DockCard({ dock, onClick }: DockCardProps) {
  const config = statusConfigs[dock.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col",
        config.borderColor,
        "border-2" // Ensure border is visible
      )}
      onClick={onClick}
      aria-label={`Dock ${dock.number}, Status: ${config.label}, Type: ${dock.type}`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-headline">Dock {dock.number}</CardTitle>
          <StatusIcon className={cn("h-6 w-6", config.iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <Badge variant={config.badgeVariant} className={cn(config.textColor, "text-xs")}>
          {config.label}
        </Badge>
        {dock.status === 'occupied' && dock.currentCarrier && (
          <p className="text-xs text-muted-foreground mt-2">Carrier: {dock.currentCarrier}</p>
        )}
        {dock.status === 'occupied' && dock.currentTrailer && (
          <p className="text-xs text-muted-foreground">Trailer: {dock.currentTrailer}</p>
        )}
         {dock.status === 'scheduled' && dock.scheduledAppointments && dock.scheduledAppointments.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Next: {dock.scheduledAppointments[0].type === 'arrival' ? 'Arrival' : 'Departure'} at {new Date(dock.scheduledAppointments[0].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 text-xs text-muted-foreground">
        <p>{dock.type === 'shipping' ? 'Shipping' : 'Receiving'} Dock</p>
      </CardFooter>
    </Card>
  );
}
