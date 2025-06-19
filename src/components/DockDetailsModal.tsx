
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Dock, Appointment } from '@/types';
import { CheckCircle2, XCircle, Wrench, CalendarClock, Truck, LucideIcon, ListChecks, History, Edit3, Paperclip } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface DockDetailsModalProps {
  dock: Dock | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const statusConfigs: Record<Dock['status'], StatusConfig> = {
  available: { icon: CheckCircle2, label: 'Available', badgeVariant: 'success' },
  occupied: { icon: Truck, label: 'Occupied', badgeVariant: 'destructive' },
  maintenance: { icon: Wrench, label: 'Maintenance', badgeVariant: 'warning' },
  scheduled: { icon: CalendarClock, label: 'Scheduled', badgeVariant: 'default' },
};

export function DockDetailsModal({ dock, isOpen, onClose }: DockDetailsModalProps) {
  const { toast } = useToast();

  if (!dock) return null;

  const config = statusConfigs[dock.status];
  const StatusIcon = config.icon;

  const handleViewHistoryClick = () => {
    if (!dock) return;
    toast({
      title: "Feature In Progress",
      description: `Viewing full history for Dock ${dock.number} is under development.`,
    });
  };

  const handleEditDockClick = () => {
    if (!dock) return;
    toast({
      title: "Feature In Progress",
      description: `Editing capabilities for Dock ${dock.number} are under development.`,
    });
  };

  const renderAppointment = (appointment: Appointment) => (
    <div key={appointment.id} className="py-2">
      <p className="font-medium text-sm">{appointment.type === 'arrival' ? 'Arrival' : 'Departure'}: {appointment.carrier} ({appointment.trailerId})</p>
      <p className="text-xs text-muted-foreground">Time: {format(new Date(appointment.time), "MMM d, yyyy 'at' h:mm a")}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">Dock {dock.number} Details</DialogTitle>
          <DialogDescription>
            {dock.type === 'shipping' ? 'Shipping' : 'Receiving'} Dock
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-2 -mr-2">
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn("h-5 w-5", 
                dock.status === 'available' && 'text-success',
                dock.status === 'occupied' && 'text-destructive',
                dock.status === 'maintenance' && 'text-warning',
                dock.status === 'scheduled' && 'text-primary'
              )} />
              <Badge variant={config.badgeVariant} className="text-sm">{config.label}</Badge>
            </div>

            <Separator />

            {(dock.status === 'occupied' || dock.status === 'scheduled') && (
              <div>
                <h4 className="font-medium text-sm mb-1">Current Assignment</h4>
                {dock.currentCarrier && <p className="text-sm">Carrier: <span className="text-muted-foreground">{dock.currentCarrier}</span></p>}
                {dock.currentTrailer && <p className="text-sm">Trailer: <span className="text-muted-foreground">{dock.currentTrailer}</span></p>}
              </div>
            )}

            {dock.scheduledAppointments && dock.scheduledAppointments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><ListChecks className="h-4 w-4 mr-2 text-primary" />Scheduled Appointments</h4>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 divide-y">
                  {dock.scheduledAppointments.map(renderAppointment)}
                </div>
              </div>
            )}

            {dock.notes && (
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><Paperclip className="h-4 w-4 mr-2 text-primary" />Notes</h4>
                <p className="text-sm p-2 border rounded-md bg-muted/50">{dock.notes}</p>
              </div>
            )}
             <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><History className="h-4 w-4 mr-2 text-primary" />Usage History</h4>
                <Button variant="outline" size="sm" onClick={handleViewHistoryClick}>
                  View Full History
                </Button>
              </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleEditDockClick}><Edit3 className="h-4 w-4 mr-2"/>Edit Dock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
