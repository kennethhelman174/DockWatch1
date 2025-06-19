
"use client";

import * as React from 'react';
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
import { CheckCircle2, XCircle, Wrench, CalendarClock, Truck, LucideIcon, ListChecks, History, Edit3, Paperclip, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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

interface SafetyCheckItem {
  id: string;
  label: string;
}

const preUnloadingChecks: SafetyCheckItem[] = [
  { id: 'unload-wheels-chocked', label: 'Trailer wheels chocked.' },
  { id: 'unload-dock-lock', label: 'Dock lock engaged / Glad hand lock applied.' },
  { id: 'unload-floor-condition', label: 'Trailer floor condition verified (no holes, debris).' },
  { id: 'unload-dock-plate', label: 'Dock plate properly set and secured.' },
  { id: 'unload-lighting', label: 'Trailer interior lighting adequate (if applicable).' },
  { id: 'unload-cargo-shift', label: 'No signs of shifting cargo that could fall.' },
];

const preReleaseChecks: SafetyCheckItem[] = [
  { id: 'release-empty-swept', label: 'Trailer empty and swept (if required).' },
  { id: 'release-equipment-removed', label: 'All equipment removed from trailer.' },
  { id: 'release-dock-plate-stored', label: 'Dock plate stored correctly.' },
  { id: 'release-dock-lock-disengaged', label: 'Dock lock disengaged / Glad hand lock removed.' },
  { id: 'release-doors-secured', label: 'Trailer doors closed and secured.' },
  { id: 'release-area-clear', label: 'Area clear for trailer departure.' },
];

type ChecklistState = Record<string, boolean>;

export function DockDetailsModal({ dock, isOpen, onClose }: DockDetailsModalProps) {
  const { toast } = useToast();

  const [preUnloadingState, setPreUnloadingState] = React.useState<ChecklistState>({});
  const [preReleaseState, setPreReleaseState] = React.useState<ChecklistState>({});
  const [preUnloadingCompleted, setPreUnloadingCompleted] = React.useState(false);
  const [preReleaseCompleted, setPreReleaseCompleted] = React.useState(false);
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);


  React.useEffect(() => {
    if (isOpen && dock && dock.status === 'occupied') {
      const initialUnloadChecks: ChecklistState = preUnloadingChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {});
      const initialReleaseChecks: ChecklistState = preReleaseChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {});
      setPreUnloadingState(initialUnloadChecks);
      setPreReleaseState(initialReleaseChecks);
      setPreUnloadingCompleted(false);
      setPreReleaseCompleted(false);
      setOpenAccordionItems(['safety-checklists']); 
    } else {
      setOpenAccordionItems([]);
    }
  }, [isOpen, dock]);

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

  const handleChecklistChange = (
    listType: 'preUnloading' | 'preRelease',
    checkId: string,
    isChecked: boolean
  ) => {
    if (listType === 'preUnloading') {
      setPreUnloadingState(prev => ({ ...prev, [checkId]: isChecked }));
    } else {
      setPreReleaseState(prev => ({ ...prev, [checkId]: isChecked }));
    }
  };

  const handleCompleteChecklist = (listType: 'preUnloading' | 'preRelease') => {
    const allChecked = (listType === 'preUnloading' ? preUnloadingChecks : preReleaseChecks).every(check => {
      return listType === 'preUnloading' ? preUnloadingState[check.id] : preReleaseState[check.id];
    });

    if (!allChecked) {
      toast({
        title: "Incomplete Checklist",
        description: "Please complete all safety checks before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (listType === 'preUnloading') {
      setPreUnloadingCompleted(true);
      toast({
        title: "Pre-Unloading Checks Logged",
        description: `All pre-unloading safety checks for Dock ${dock.number} have been logged.`,
        variant: "success",
      });
    } else {
      setPreReleaseCompleted(true);
      toast({
        title: "Pre-Release Checks Logged",
        description: `All pre-release safety checks for Dock ${dock.number} have been logged.`,
        variant: "success",
      });
    }
  };

  const renderChecklist = (
    title: string,
    checks: SafetyCheckItem[],
    state: ChecklistState,
    handler: (checkId: string, isChecked: boolean) => void,
    isCompleted: boolean,
    completeAction: () => void
  ) => (
    <div className="space-y-3">
      <h5 className="font-medium text-sm flex items-center"><ShieldCheck className="h-4 w-4 mr-2 text-primary/80" />{title}</h5>
      <div className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
        {checks.map(check => (
          <div key={check.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${dock.id}-${check.id}`}
              checked={state[check.id] || false}
              onCheckedChange={(checked) => handler(check.id, !!checked)}
              disabled={isCompleted}
              aria-labelledby={`${dock.id}-${check.id}-label`}
            />
            <Label htmlFor={`${dock.id}-${check.id}`} id={`${dock.id}-${check.id}-label`} className={cn("text-xs", isCompleted && "text-muted-foreground line-through")}>
              {check.label}
            </Label>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        onClick={completeAction}
        disabled={isCompleted}
        className="w-full md:w-auto"
        variant={isCompleted ? "secondary" : "default"}
      >
        {isCompleted ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
        {isCompleted ? 'Checks Logged' : 'Mark All Complete & Log'}
      </Button>
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
            
            {dock.status === 'occupied' && (
              <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full">
                <AccordionItem value="safety-checklists">
                  <AccordionTrigger className="text-base font-medium hover:no-underline">
                    <div className="flex items-center">
                      <ListChecks className="h-5 w-5 mr-2 text-primary" /> Safety Checklists
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-6 p-2 border rounded-md bg-card">
                      {renderChecklist(
                        "Pre-Unloading Safety Checks",
                        preUnloadingChecks,
                        preUnloadingState,
                        (checkId, isChecked) => handleChecklistChange('preUnloading', checkId, isChecked),
                        preUnloadingCompleted,
                        () => handleCompleteChecklist('preUnloading')
                      )}
                      <Separator />
                      {renderChecklist(
                        "Pre-Release Safety Checks",
                        preReleaseChecks,
                        preReleaseState,
                        (checkId, isChecked) => handleChecklistChange('preRelease', checkId, isChecked),
                        preReleaseCompleted,
                        () => handleCompleteChecklist('preRelease')
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

    