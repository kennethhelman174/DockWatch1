// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI-powered tool that estimates the arrival time of incoming shipments based on weather, distance, and current traffic conditions.
 *
 * - estimateArrivalTime - A function that handles the arrival time estimation process.
 * - EstimateArrivalTimeInput - The input type for the estimateArrivalTime function.
 * - EstimateArrivalTimeOutput - The return type for the estimateArrivalTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateArrivalTimeInputSchema = z.object({
  weatherCondition: z.string().describe('The weather conditions at the origin.'),
  distanceMiles: z.number().describe('The distance in miles from the origin to the destination.'),
  currentTraffic: z.string().describe('The current traffic conditions between the origin and the destination.'),
  originCity: z.string().describe('The city where the shipment is originating from.'),
  destinationCity: z.string().describe('The city where the shipment is going to.'),
});

export type EstimateArrivalTimeInput = z.infer<typeof EstimateArrivalTimeInputSchema>;

const EstimateArrivalTimeOutputSchema = z.object({
  estimatedTimeArrival: z
    .string()
    .describe(
      'The estimated time of arrival (ETA) of the shipment, given as a date and time in ISO 8601 format.'
    ),
  confidenceLevel: z
    .string()
    .describe(
      'A qualitative description of the confidence level in the ETA, such as High, Medium, or Low.'
    ),
  reasoning: z
    .string()
    .describe('A brief explanation of the factors that influenced the ETA calculation.'),
});

export type EstimateArrivalTimeOutput = z.infer<typeof EstimateArrivalTimeOutputSchema>;

export async function estimateArrivalTime(input: EstimateArrivalTimeInput): Promise<EstimateArrivalTimeOutput> {
  return estimateArrivalTimeFlow(input);
}

const estimateArrivalTimePrompt = ai.definePrompt({
  name: 'estimateArrivalTimePrompt',
  input: {schema: EstimateArrivalTimeInputSchema},
  output: {schema: EstimateArrivalTimeOutputSchema},
  prompt: `You are an expert logistics manager specializing in estimating shipment arrival times.

  Given the following information, estimate the arrival time of the shipment. Include a confidence level (High, Medium, Low) and reasoning for the estimate.

  Origin City: {{{originCity}}}
  Destination City: {{{destinationCity}}}
  Weather Conditions: {{{weatherCondition}}}
  Distance (miles): {{{distanceMiles}}}
  Current Traffic: {{{currentTraffic}}}

  Provide the estimated arrival time in ISO 8601 format.
  `,
});

const estimateArrivalTimeFlow = ai.defineFlow(
  {
    name: 'estimateArrivalTimeFlow',
    inputSchema: EstimateArrivalTimeInputSchema,
    outputSchema: EstimateArrivalTimeOutputSchema,
  },
  async input => {
    const {output} = await estimateArrivalTimePrompt(input);
    return output!;
  }
);
