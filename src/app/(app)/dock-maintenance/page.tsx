
"use client";

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Wrench, CalendarIcon, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import type { MaintenanceRecord, MaintenanceType, Dock } from '@/types';
import { allMockDocks as importedAllMockDocks, mockMaintenanceRecords as importedMockMaintenanceRecords } from '@/constants/mockData';
import { cn } from '@/lib/utils';

const maintenanceRecordFormSchema = z.object({
  dockNumber: z.coerce.number({ required_error: "Dock number is required."}).int().positive(),
  type: z.enum(['preventive', 'corrective'], { required_error: "Maintenance type is required."}),
  datePerformed: z.date({ required_error: "Date performed is required."}),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  performedBy: z.string().optional(),
  nextPmDueDateUpdate: z.date().optional(),
});

type MaintenanceRecordFormData = z.infer<typeof maintenanceRecordFormSchema>;

export default function DockMaintenancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const [clientDocks, setClientDocks] = React.useState<Dock[]>([]);
  const [clientMaintenanceRecords, setClientMaintenanceRecords] = React.useState<MaintenanceRecord[]>([]);

  React.useEffect(() => {
    setClientDocks(importedAllMockDocks);
    setClientMaintenanceRecords(importedMockMaintenanceRecords.sort((a,b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime()));
  }, []);

  const maintenanceForm = useForm<MaintenanceRecordFormData>({
    resolver: zodResolver(maintenanceRecordFormSchema),
    defaultValues: {
      description: "",
      performedBy: "",
    },
  });

  const onMaintenanceSubmit: SubmitHandler<MaintenanceRecordFormData> = async (data) => {
    setIsLoading(true);
    console.log("New Maintenance Record Data:", data);

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      dockNumber: data.dockNumber,
      type: data.type as MaintenanceType,
      datePerformed: data.datePerformed.toISOString(),
      description: data.description,
      performedBy: data.performedBy,
      nextPmDueDateUpdate: data.nextPmDueDateUpdate?.toISOString(),
    };

    // Simulate API call & update client state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setClientMaintenanceRecords(prev => [newRecord, ...prev].sort((a,b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime()));

    if (newRecord.nextPmDueDateUpdate && newRecord.type === 'preventive') {
      setClientDocks(prevDocks => prevDocks.map(d => 
        d.number === newRecord.dockNumber ? { ...d, nextPmDueDate: newRecord.nextPmDueDateUpdate } : d
      ));
    }
    
    setIsLoading(false);
    toast({
      title: "Maintenance Record Added",
      description: `Maintenance for Dock ${data.dockNumber} has been logged.`,
      variant: "success",
    });
    maintenanceForm.reset();
    setIsDialogOpen(false);
  };
  
  const getPmStatusClassName = (dateString?: string): string => {
    if (!dateString) return "text-muted-foreground";
    const date = new Date(dateString);
    if (isPast(date)) return "text-destructive font-semibold";
    if (differenceInDays(date, new Date()) <= 7) return "text-warning font-medium";
    return "text-green-600";
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Wrench className="mr-3 h-8 w-8 text-primary" /> Dock Maintenance Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor upcoming PMs, view history, and log new maintenance activities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Preventive Maintenance</CardTitle>
          <CardDescription>Overview of next PM due dates for all docks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Dock #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Next PM Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDocks.sort((a,b) => a.number - b.number).map((dock) => (
                <TableRow key={dock.id}>
                  <TableCell className="font-medium">{dock.number}</TableCell>
                  <TableCell>{dock.type.charAt(0).toUpperCase() + dock.type.slice(1)}</TableCell>
                  <TableCell>
                     <span className={cn("capitalize",
                        dock.status === "available" && "text-green-600",
                        dock.status === "occupied" && "text-red-600",
                        dock.status === "maintenance" && "text-amber-600",
                        dock.status === "scheduled" && "text-blue-600"
                      )}>
                        {dock.status}
                      </span>
                  </TableCell>
                  <TableCell className={cn("text-right", getPmStatusClassName(dock.nextPmDueDate))}>
                    {dock.nextPmDueDate ? format(new Date(dock.nextPmDueDate), 'PPP') : 'N/A'}
                    {dock.nextPmDueDate && isPast(new Date(dock.nextPmDueDate)) && <AlertTriangle className="inline-block ml-1 h-4 w-4" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Maintenance Log</CardTitle>
            <CardDescription>History of all performed maintenance activities.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Log New Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Log New Maintenance Record</DialogTitle>
                <DialogDescription>
                  Fill in the details for the maintenance activity.
                </DialogDescription>
              </DialogHeader>
              <Form {...maintenanceForm}>
                <form onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={maintenanceForm.control}
                    name="dockNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dock Number</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dock..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientDocks.map(dock => (
                              <SelectItem key={dock.id} value={dock.number.toString()}>
                                Dock {dock.number} ({dock.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="datePerformed"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date Performed</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Work</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the work performed..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="performedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performed By (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Facility Team, John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={maintenanceForm.control}
                    name="nextPmDueDateUpdate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>New Next PM Due Date (Optional)</FormLabel>
                         <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date if PM completed</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline" onClick={() => { maintenanceForm.reset(); setIsDialogOpen(false); }}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Log Record
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Dock #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Performed By</TableHead>
                 <TableHead className="text-right">Updated PM Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientMaintenanceRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No maintenance records yet.
                  </TableCell>
                </TableRow>
              )}
              {clientMaintenanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.dockNumber}</TableCell>
                  <TableCell className="capitalize">{record.type}</TableCell>
                  <TableCell>{format(new Date(record.datePerformed), 'PPP')}</TableCell>
                  <TableCell className="max-w-xs truncate" title={record.description}>{record.description}</TableCell>
                  <TableCell>{record.performedBy || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {record.nextPmDueDateUpdate ? format(new Date(record.nextPmDueDateUpdate), 'PPP') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
            Displaying {clientMaintenanceRecords.length} maintenance records. Log is client-side for prototype.
        </CardFooter>
      </Card>
    </div>
  );
}
