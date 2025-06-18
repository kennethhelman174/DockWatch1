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
import { Loader2, CheckCircle, AlertTriangle, Clock, BarChart, Route } from 'lucide-react';
import type { EstimateArrivalTimeInput, EstimateArrivalTimeOutput } from '@/ai/flows/estimate-arrival-time';
import { getAiEta } from '@/app/actions'; // Server action
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  originCity: z.string().min(2, { message: "Origin city must be at least 2 characters." }),
  destinationCity: z.string().min(2, { message: "Destination city must be at least 2 characters." }),
  distanceMiles: z.coerce.number().positive({ message: "Distance must be a positive number." }),
  weatherCondition: z.string().min(3, { message: "Weather condition must be described." }),
  currentTraffic: z.string().min(3, { message: "Traffic condition must be described." }),
});

type FormData = z.infer<typeof formSchema>;

export function EtaForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [etaResult, setEtaResult] = React.useState<EstimateArrivalTimeOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originCity: "",
      destinationCity: "",
      distanceMiles: 100,
      weatherCondition: "",
      currentTraffic: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setEtaResult(null);
    
    const inputForAi: EstimateArrivalTimeInput = {
        ...values
    };

    const result = await getAiEta(inputForAi);

    setIsLoading(false);
    if (result.data) {
      setEtaResult(result.data);
      toast({
        title: "ETA Calculated",
        description: "The estimated time of arrival has been successfully calculated.",
        variant: "default", // Default is not green, need to style success toasts
      });
    } else if (result.error) {
      setEtaResult(null);
      toast({
        title: "Error Calculating ETA",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Truck className="mr-2 h-6 w-6 text-primary" />
            AI-Powered ETA Calculator
          </CardTitle>
          <CardDescription>
            Estimate shipment arrival times based on various factors.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="originCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="distanceMiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (miles)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weatherCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Sunny with light breeze, Heavy rain and thunderstorms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentTraffic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Traffic Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Light traffic, Heavy congestion on I-95" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Estimate Arrival Time'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {etaResult && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center text-primary">
              <CheckCircle className="mr-2 h-6 w-6" />
              Estimated Arrival Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4" />ETA</h3>
              <p className="text-lg font-semibold">
                {new Date(etaResult.estimatedTimeArrival).toLocaleString(undefined, { 
                  dateStyle: 'medium', timeStyle: 'short' 
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><BarChart className="mr-2 h-4 w-4" />Confidence Level</h3>
              <p className="text-lg">{etaResult.confidenceLevel}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Route className="mr-2 h-4 w-4" />Reasoning</h3>
              <p className="text-sm bg-muted/50 p-3 rounded-md">{etaResult.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
