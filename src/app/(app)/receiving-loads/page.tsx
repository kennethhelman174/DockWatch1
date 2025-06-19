
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
import { Loader2, ArchiveRestore, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const receivingLoadFormSchema = z.object({
  carrierName: z.string().min(2, { message: "Carrier name must be at least 2 characters." }),
  trailerId: z.string().min(3, { message: "Trailer ID must be at least 3 characters." }),
  expectedDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Expected date is required." }),
  expectedTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Expected time must be in HH:MM format." }),
  origin: z.string().min(2, { message: "Origin must be at least 2 characters." }),
  cargoDescription: z.string().min(10, { message: "Cargo description must be at least 10 characters." }),
  billOfLading: z.custom<FileList>().optional(), // Handled separately
});

type ReceivingLoadFormData = z.infer<typeof receivingLoadFormSchema>;

export default function ReceivingLoadsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ReceivingLoadFormData>({
    resolver: zodResolver(receivingLoadFormSchema),
    defaultValues: {
      carrierName: "",
      trailerId: "",
      expectedDate: "",
      expectedTime: "",
      origin: "",
      cargoDescription: "",
    },
  });

  async function onSubmit(values: ReceivingLoadFormData) {
    setIsLoading(true);

    const billOfLadingFile = fileInputRef.current?.files?.[0];
    const formDataWithFile = {
      ...values,
      billOfLading: billOfLadingFile ? { name: billOfLadingFile.name, type: billOfLadingFile.type, size: billOfLadingFile.size } : undefined,
    };
    
    console.log("New Receiving Load Data:", formDataWithFile);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Receiving Load Added!",
      description: `Incoming load from ${values.carrierName} (Trailer: ${values.trailerId}) from ${values.origin} has been logged.`,
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
          <ArchiveRestore className="mr-3 h-8 w-8 text-primary" /> Manage Receiving Loads
        </h1>
        <p className="text-muted-foreground mt-1">
          Add and log new incoming shipments.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Add New Receiving Load</CardTitle>
          <CardDescription>
            Fill in the details for the new incoming shipment.
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
                        <Input placeholder="e.g., UPS Freight" {...field} />
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
                        <Input placeholder="e.g., UPSU123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Time (HH:MM)</FormLabel>
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
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dallas, TX" {...field} />
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
                      <Textarea placeholder="e.g., Mixed goods, 1500 lbs" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                <FormLabel htmlFor="billOfLadingFileReceiving">Bill of Lading (Optional)</FormLabel>
                <FormControl>
                  <Input id="billOfLadingFileReceiving" type="file" ref={fileInputRef} className="pt-2"/>
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
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Add Receiving Load
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
