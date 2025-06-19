
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Dock, DockStatus } from '@/types';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DockCardProps {
  dock: Dock;
  onClick: () => void;
}

// Component for the small traffic light display
const TrafficLightDisplay = ({ activeState }: { activeState: 'red' | 'yellow' | 'green' }) => {
  const lightClasses = (light: 'red' | 'yellow' | 'green') => {
    if (light === activeState) {
      if (light === 'red') return 'bg-destructive';
      if (light === 'yellow') return 'bg-warning';
      if (light === 'green') return 'bg-success';
    }
    return 'bg-muted/50 opacity-50'; // Dimmed/inactive light
  };

  return (
    <div className="flex flex-col space-y-0.5 p-0.5 bg-gray-700 dark:bg-black rounded-sm self-center ml-2">
      <div className={cn('w-2.5 h-2.5 rounded-full', lightClasses('red'))}></div>
      <div className={cn('w-2.5 h-2.5 rounded-full', lightClasses('yellow'))}></div>
      <div className={cn('w-2.5 h-2.5 rounded-full', lightClasses('green'))}></div>
    </div>
  );
};

interface DockDisplayConfig {
  label: string;
  trafficLightState: 'red' | 'yellow' | 'green';
  trailerBarBgClass: string;
  trailerBarTextClass: string;
  trailerBarContent: (dock: Dock) => string;
  showTruckIcon: boolean;
}

const displayConfigs: Record<DockStatus, DockDisplayConfig> = {
  available: {
    label: 'Available',
    trafficLightState: 'green',
    trailerBarBgClass: 'bg-success',
    trailerBarTextClass: 'text-success-foreground',
    trailerBarContent: () => 'Available',
    showTruckIcon: false,
  },
  occupied: {
    label: 'Occupied',
    trafficLightState: 'red',
    trailerBarBgClass: 'bg-destructive',
    trailerBarTextClass: 'text-destructive-foreground',
    trailerBarContent: (dock) => 
      `${dock.currentTrailer || 'N/A'} ${dock.currentCarrier ? `- ${dock.currentCarrier}` : ''}`.trim(),
    showTruckIcon: true,
  },
  maintenance: {
    label: 'Maintenance',
    trafficLightState: 'yellow',
    trailerBarBgClass: 'bg-warning',
    trailerBarTextClass: 'text-warning-foreground',
    trailerBarContent: () => 'Under Maintenance',
    showTruckIcon: false,
  },
  scheduled: {
    label: 'Scheduled',
    trafficLightState: 'yellow',
    trailerBarBgClass: 'bg-primary',
    trailerBarTextClass: 'text-primary-foreground',
    trailerBarContent: (dock) => {
      if (dock.scheduledAppointments && dock.scheduledAppointments.length > 0) {
        const appt = dock.scheduledAppointments[0];
        const time = new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Next: ${appt.type === 'arrival' ? 'Arr' : 'Dep'} @ ${time}`;
      }
      return 'Scheduled';
    },
    showTruckIcon: true,
  },
};

export function DockCard({ dock, onClick }: DockCardProps) {
  const config = displayConfigs[dock.status];

  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col bg-card"
      onClick={onClick}
      aria-label={`Dock ${dock.number}, Status: ${config.label}, Type: ${dock.type}`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-card-foreground">Dock {dock.number}</CardTitle>
          <TrafficLightDisplay activeState={config.trafficLightState} />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-center">
        <div className={cn(
          "flex items-center w-full h-10 rounded-sm overflow-hidden",
          config.trailerBarBgClass
         )}>
          <div className={cn(
            "flex-grow px-2 py-1 text-center truncate",
            config.trailerBarTextClass,
            "text-xs font-medium"
            )}>
            {config.trailerBarContent(dock)}
          </div>
          {config.showTruckIcon && (
            <div className={cn(
              "flex-shrink-0 h-full w-10 flex items-center justify-center",
               // Use a slightly lighter/darker shade of the bar for the truck background, or a neutral one
              "bg-opacity-20 bg-black" // Example: semi-transparent black overlay
            )}>
              <Truck 
                className={cn("h-5 w-5", config.trailerBarTextClass)}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-2 text-xs text-muted-foreground">
        <p>{dock.type === 'shipping' ? 'Shipping' : 'Receiving'} Dock</p>
      </CardFooter>
    </Card>
  );
}
