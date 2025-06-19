
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

const kioskFormSchema = z.object({
  driverName: z.string().min(2, { message: "Driver name must be at least 2 characters." }),
  licensePlate: z.string().min(3, { message: "License plate must be at least 3 characters." }),
  carrierCompany: z.string().min(2, { message: "Carrier company must be at least 2 characters." }),
  trailerId: z.string().min(3, { message: "Trailer ID must be at least 3 characters." }),
  purposeOfVisit: z.enum(["delivery", "pickup"], { required_error: "Purpose of visit is required." }),
  appointmentId: z.string().optional(),
});

type KioskFormData = z.infer<typeof kioskFormSchema>;

export function DriverKioskForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<KioskFormData>({
    resolver: zodResolver(kioskFormSchema),
    defaultValues: {
      driverName: "",
      licensePlate: "",
      carrierCompany: "",
      trailerId: "",
      appointmentId: "",
    },
  });

  async function onSubmit(values: KioskFormData) {
    setIsLoading(true);
    console.log("Driver Kiosk Sign-In Data:", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Sign-In Successful!",
      description: `Welcome, ${values.driverName}. Your information has been recorded.`,
      variant: "success",
      duration: 5000,
    });
    form.reset(); // Reset form after successful submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Truck License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABC 123XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="carrierCompany"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier Company</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Swift Logistics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trailerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trailer ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., TR00123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purposeOfVisit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Visit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., APPT54321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Complete Sign-In
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
