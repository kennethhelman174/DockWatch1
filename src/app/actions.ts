"use server";

import { estimateArrivalTime as estimateArrivalTimeFlow, type EstimateArrivalTimeInput, type EstimateArrivalTimeOutput } from '@/ai/flows/estimate-arrival-time';
import { z } from 'zod';

const EstimateArrivalTimeInputSchema = z.object({
  weatherCondition: z.string().min(1, "Weather condition is required."),
  distanceMiles: z.number().positive("Distance must be a positive number."),
  currentTraffic: z.string().min(1, "Current traffic is required."),
  originCity: z.string().min(1, "Origin city is required."),
  destinationCity: z.string().min(1, "Destination city is required."),
});

export async function getAiEta(
  input: EstimateArrivalTimeInput
): Promise<{ data?: EstimateArrivalTimeOutput; error?: string }> {
  try {
    // Validate input on the server-side as well
    const validatedInput = EstimateArrivalTimeInputSchema.parse(input);
    const result = await estimateArrivalTimeFlow(validatedInput);
    return { data: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: `Validation failed: ${e.errors.map(err => `${err.path.join('.')} - ${err.message}`).join(', ')}` };
    }
    console.error("Error calling AI ETA flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while estimating ETA.";
    return { error: errorMessage };
  }
}
