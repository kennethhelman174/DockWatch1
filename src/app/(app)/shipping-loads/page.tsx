
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const shippingLoadFormSchema = z.object({
  carrierName: z.string().min(2, { message: "Carrier name must be at least 2 characters." }),
  trailerId: z.string().min(3, { message: "Trailer ID must be at least 3 characters." }),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Scheduled date is required." }),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Scheduled time must be in HH:MM format." }),
  destination: z.string().min(2, { message: "Destination must be at least 2 characters." }),
  cargoDescription: z.string().min(10, { message: "Cargo description must be at least 10 characters." }),
  billOfLading: z.custom<FileList>().optional(), // Handled separately
});

type ShippingLoadFormData = z.infer<typeof shippingLoadFormSchema>;

export default function ShippingLoadsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ShippingLoadFormData>({
    resolver: zodResolver(shippingLoadFormSchema),
    defaultValues: {
      carrierName: "",
      trailerId: "",
      scheduledDate: "",
      scheduledTime: "",
      destination: "",
      cargoDescription: "",
    },
  });

  async function onSubmit(values: ShippingLoadFormData) {
    setIsLoading(true);
    
    const billOfLadingFile = fileInputRef.current?.files?.[0];
    const formDataWithFile = {
      ...values,
      billOfLading: billOfLadingFile ? { name: billOfLadingFile.name, type: billOfLadingFile.type, size: billOfLadingFile.size } : undefined,
    };

    console.log("New Shipping Load Data:", formDataWithFile);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Shipping Load Added!",
      description: `Load for ${values.carrierName} (Trailer: ${values.trailerId}) to ${values.destination} has been scheduled.`,
      variant: "success",
      duration: 5000,
    });
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Send className="mr-3 h-8 w-8 text-primary" /> Manage Shipping Loads
        </h1>
        <p className="text-muted-foreground mt-1">
          Add and schedule new outgoing shipments.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Add New Shipping Load</CardTitle>
          <CardDescription>
            Fill in the details for the new shipment.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carrierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FedEx Freight" {...field} />
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
                        <Input placeholder="e.g., FDXU567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chicago, IL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Pallets of electronics, 2000 lbs" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel htmlFor="billOfLadingFile">Bill of Lading (Optional)</FormLabel>
                <FormControl>
                  <Input id="billOfLadingFile" type="file" ref={fileInputRef} className="pt-2"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Load...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Add Shipping Load
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
