
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Dock, Appointment, DockStatus } from '@/types';
import { CheckCircle2, XCircle, Wrench, CalendarClock, Truck, LucideIcon, ListChecks, History, Edit3, Paperclip, ShieldCheck, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Using direct Label
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DockDetailsModalProps {
  dock: Dock | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDock: (updatedData: Pick<Dock, 'id' | 'status' | 'notes'>) => void;
}

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const statusConfigs: Record<DockStatus, StatusConfig> = {
  available: { icon: CheckCircle2, label: 'Available', badgeVariant: 'success' },
  occupied: { icon: Truck, label: 'Occupied', badgeVariant: 'destructive' },
  maintenance: { icon: Wrench, label: 'Maintenance', badgeVariant: 'warning' },
  scheduled: { icon: CalendarClock, label: 'Scheduled', badgeVariant: 'default' },
};

const dockStatusesForSelect: DockStatus[] = ["available", "occupied", "maintenance", "scheduled"];


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

export function DockDetailsModal({ dock, isOpen, onClose, onUpdateDock }: DockDetailsModalProps) {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedStatus, setEditedStatus] = React.useState<DockStatus | undefined>(dock?.status);
  const [editedNotes, setEditedNotes] = React.useState<string | undefined>(dock?.notes);

  const [preUnloadingState, setPreUnloadingState] = React.useState<ChecklistState>({});
  const [preReleaseState, setPreReleaseState] = React.useState<ChecklistState>({});
  const [preUnloadingCompleted, setPreUnloadingCompleted] = React.useState(false);
  const [preReleaseCompleted, setPreReleaseCompleted] = React.useState(false);
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);


  React.useEffect(() => {
    if (isOpen && dock) {
      setEditedStatus(dock.status);
      setEditedNotes(dock.notes || "");

      const initialUnloadChecks: ChecklistState = preUnloadingChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {});
      const initialReleaseChecks: ChecklistState = preReleaseChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {});
      setPreUnloadingState(initialUnloadChecks);
      setPreReleaseState(initialReleaseChecks);
      setPreUnloadingCompleted(dock.preUnloadingChecksCompleted || false);
      setPreReleaseCompleted(dock.preReleaseChecksCompleted || false);
      
      if (dock.status === 'occupied' && !isEditing) {
        setOpenAccordionItems(['safety-checklists']);
      } else {
        setOpenAccordionItems(prev => prev.filter(item => item !== 'safety-checklists'));
      }
    } else if (!isOpen) {
      setIsEditing(false);
      setOpenAccordionItems([]);
    }
  }, [isOpen, dock, isEditing]);


  if (!dock) return null;

  const currentDockStatusConfig = statusConfigs[dock.status];
  const StatusIcon = currentDockStatusConfig.icon;

  const handleViewHistoryClick = () => {
    toast({
      title: "Feature In Progress",
      description: `Viewing full history for Dock ${dock.number} is under development.`,
    });
  };

  const handleEditDockClick = () => {
    setIsEditing(true);
    setOpenAccordionItems(prev => prev.filter(item => item !== 'safety-checklists'));
  };
  
  const handleSaveChangesClick = () => {
    if (!editedStatus) {
        toast({ title: "Error", description: "Status cannot be empty.", variant: "destructive" });
        return;
    }
    onUpdateDock({
      id: dock.id,
      status: editedStatus,
      notes: editedNotes || "", 
    });
    setIsEditing(false);
    if (editedStatus === 'occupied') {
        setOpenAccordionItems(['safety-checklists']);
    }
    toast({
      title: "Dock Updated",
      description: `Dock ${dock.number} details have been saved.`,
      variant: "success",
    });
  };

  const handleCancelEditClick = () => {
    setIsEditing(false);
    if (dock) {
      setEditedStatus(dock.status);
      setEditedNotes(dock.notes || "");
      if (dock.status === 'occupied') {
        setOpenAccordionItems(['safety-checklists']);
      } else {
        setOpenAccordionItems(prev => prev.filter(item => item !== 'safety-checklists'));
      }
    }
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
        description: `All pre-unloading safety checks for Dock ${dock.number} have been logged. (Client-side)`,
        variant: "success",
      });
    } else {
      setPreReleaseCompleted(true);
      toast({
        title: "Pre-Release Checks Logged",
        description: `All pre-release safety checks for Dock ${dock.number} have been logged. (Client-side)`,
        variant: "success",
      });
    }
  };

  const renderChecklist = (
    title: string,
    checks: SafetyCheckItem[],
    state: ChecklistState,
    handler: (checkId: string, isChecked: boolean) => void,
    isOverallCompleted: boolean,
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
              disabled={isOverallCompleted || isEditing}
              aria-labelledby={`${dock.id}-${check.id}-label`}
            />
            <Label htmlFor={`${dock.id}-${check.id}`} id={`${dock.id}-${check.id}-label`} className={cn("text-xs", (isOverallCompleted || isEditing) && "text-muted-foreground line-through")}>
              {check.label}
            </Label>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        onClick={completeAction}
        disabled={isOverallCompleted || isEditing}
        className="w-full md:w-auto"
        variant={isOverallCompleted ? "secondary" : "default"}
      >
        {isOverallCompleted ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
        {isOverallCompleted ? 'Checks Logged' : 'Mark All Complete & Log'}
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">
            {isEditing ? `Editing Dock ${dock.number}` : `Dock ${dock.number} Details`}
          </DialogTitle>
          <DialogDescription>
            {dock.type === 'shipping' ? 'Shipping' : 'Receiving'} Dock
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 -mr-2"> {/* Changed to flex-1 for better growth */}
          <div className="space-y-4 py-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dock-status-edit">Status</Label>
                  <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as DockStatus)}>
                    <SelectTrigger id="dock-status-edit">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dockStatusesForSelect.map(s => (
                        <SelectItem key={s} value={s}>{statusConfigs[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dock-notes-edit">Notes</Label>
                  <Textarea
                    id="dock-notes-edit"
                    placeholder="Enter notes for this dock..."
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={cn("h-5 w-5",
                    dock.status === 'available' && 'text-success',
                    dock.status === 'occupied' && 'text-destructive',
                    dock.status === 'maintenance' && 'text-warning',
                    dock.status === 'scheduled' && 'text-primary'
                  )} />
                  <Badge variant={currentDockStatusConfig.badgeVariant} className="text-sm">{currentDockStatusConfig.label}</Badge>
                </div>
                 <Separator />
              </>
            )}

            {(dock.status === 'occupied' || dock.status === 'scheduled') && !isEditing && (
              <div>
                <h4 className="font-medium text-sm mb-1">Current Assignment</h4>
                {dock.currentCarrier && <p className="text-sm">Carrier: <span className="text-muted-foreground">{dock.currentCarrier}</span></p>}
                {dock.currentTrailer && <p className="text-sm">Trailer: <span className="text-muted-foreground">{dock.currentTrailer}</span></p>}
                 {!dock.currentCarrier && !dock.currentTrailer && <p className="text-sm text-muted-foreground">No assignment details.</p>}
              </div>
            )}
            
            {dock.status === 'occupied' && !isEditing && (
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

            {!isEditing && dock.notes && (
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><Paperclip className="h-4 w-4 mr-2 text-primary" />Notes</h4>
                <p className="text-sm p-2 border rounded-md bg-muted/50 whitespace-pre-wrap">{dock.notes}</p>
              </div>
            )}
            
            {!isEditing && dock.scheduledAppointments && dock.scheduledAppointments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><ListChecks className="h-4 w-4 mr-2 text-primary" />Scheduled Appointments</h4>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 divide-y">
                  {dock.scheduledAppointments.map(renderAppointment)}
                </div>
              </div>
            )}

            {!isEditing && (
             <div>
                <h4 className="font-medium text-sm mb-1 flex items-center"><History className="h-4 w-4 mr-2 text-primary" />Usage History</h4>
                <Button variant="outline" size="sm" onClick={handleViewHistoryClick}>
                  View Full History
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t"> {/* Ensure footer is outside ScrollArea and at bottom */}
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEditClick}>Cancel</Button>
              <Button onClick={handleSaveChangesClick}><Save className="h-4 w-4 mr-2"/>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handleEditDockClick}><Edit3 className="h-4 w-4 mr-2"/>Edit Dock</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
