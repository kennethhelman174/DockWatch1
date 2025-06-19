
"use server";

import { estimateArrivalTime as estimateArrivalTimeFlow, type EstimateArrivalTimeInput, type EstimateArrivalTimeOutput } from '@/ai/flows/estimate-arrival-time';
import { getWeatherForecast as getWeatherForecastFlow, type GetWeatherForecastInput } from '@/ai/flows/get-weather-forecast-flow';
import { getAppSupport as getAppSupportFlow, type AppSupportInput, type AppSupportOutput } from '@/ai/flows/app-support-flow'; // Added
import type { WeatherForecastOutput } from '@/types';
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

const GetWeatherForecastInputSchemaServer = z.object({
  location: z.string().min(1, "Location is required."),
});

export async function getAiWeatherForecast(
  input: GetWeatherForecastInput
): Promise<{ data?: WeatherForecastOutput; error?: string }> {
  try {
    const validatedInput = GetWeatherForecastInputSchemaServer.parse(input);
    const result = await getWeatherForecastFlow(validatedInput);
    return { data: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: `Validation failed: ${e.errors.map(err => `${err.path.join('.')} - ${err.message}`).join(', ')}` };
    }
    console.error("Error calling AI Weather Forecast flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while fetching weather forecast.";
    return { error: errorMessage };
  }
}

// New Server Action for App Support
const AppSupportInputSchemaServer = z.object({
  userQuestion: z.string().min(5, "Question must be at least 5 characters long."),
});

export async function getAppSupportResponse(
  input: AppSupportInput
): Promise<{ data?: AppSupportOutput; error?: string }> {
  try {
    const validatedInput = AppSupportInputSchemaServer.parse(input);
    const result = await getAppSupportFlow(validatedInput);
    return { data: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: `Validation failed: ${e.errors.map(err => `${err.path.join('.')} - ${err.message}`).join(', ')}` };
    }
    console.error("Error calling App Support AI flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while getting support.";
    return { error: errorMessage };
  }
}
