
'use server';
/**
 * @fileOverview An AI-powered assistant to answer user questions about the DockWatch application,
 * with the ability to fetch weather forecasts.
 *
 * - getAppSupport - A function that handles user queries about the app.
 * - AppSupportInput - The input type for the getAppSupport function.
 * - AppSupportOutput - The return type for the getAppSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  getWeatherForecast, 
  GetWeatherForecastInputSchema, // Renamed for clarity if it was just 'input' before
  WeatherForecastOutputSchema as GetWeatherForecastOutputSchema // Renamed for clarity
} from './get-weather-forecast-flow'; 
import type { GetWeatherForecastInput, WeatherForecastOutput as GetWeatherForecastOutput } from './get-weather-forecast-flow';


const AppSupportInputSchema = z.object({
  userQuestion: z.string().describe('The user question about the DockWatch application.'),
});
export type AppSupportInput = z.infer<typeof AppSupportInputSchema>;

const AppSupportOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user question.'),
});
export type AppSupportOutput = z.infer<typeof AppSupportOutputSchema>;

// Define the tool for getting weather forecast
const getWeatherForecastTool = ai.defineTool(
  {
    name: 'getWeatherForecast',
    description: 'Gets the current weather forecast for a specified location. Use this if the user asks about weather conditions for planning, operational decisions, or understanding potential delays related to DockWatch activities.',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: GetWeatherForecastOutputSchema,
  },
  async (input: GetWeatherForecastInput): Promise<GetWeatherForecastOutput> => {
    // Call the existing getWeatherForecastFlow function (or its wrapper)
    return getWeatherForecast(input);
  }
);

export async function getAppSupport(input: AppSupportInput): Promise<AppSupportOutput> {
  return appSupportFlow(input);
}

const appSupportPrompt = ai.definePrompt({
  name: 'appSupportPrompt',
  input: {schema: AppSupportInputSchema},
  output: {schema: AppSupportOutputSchema},
  tools: [getWeatherForecastTool], // Make the tool available to the prompt
  prompt: `You are a friendly and helpful AI assistant for the DockWatch application.
DockWatch is a yard management app for a distribution center. Its main features are:
- Dashboard: Overview of dock statuses (shipping/receiving), real-time alerts for facility and weather, filters for docks, and detailed dock information via a modal.
- ETA Calculator: An AI-powered tool to estimate shipment arrival times based on weather, distance, and traffic.
- Driver Kiosk: A sign-in page for drivers to input their details for deliveries or pickups.
- Digital Display: A live, read-only, full-screen view of dock statuses, typically used for large screens in a control room.
- Settings: Allows users to manage app appearance (theme) and notification preferences.

The user will ask you a question about how to use the DockWatch application. Provide a clear, concise, and helpful answer based on the features described above.
If the question is unclear or unrelated to DockWatch features, politely state that you can only help with DockWatch application features.
Do not invent features that don't exist based on this description. Keep your answers focused on how to use the described functionalities.

IMPORTANT: If the user's question involves needing to know the current weather for a specific location (e.g., for planning a shipment, understanding potential delays, or operational decisions), you MUST use the 'getWeatherForecast' tool to fetch this information. Then, incorporate the weather details naturally into your answer. For example, if asked "How's the weather in Miami for a shipment?", use the tool for Miami and then state the weather.

User's question: {{{userQuestion}}}
`,
});

const appSupportFlow = ai.defineFlow(
  {
    name: 'appSupportFlow',
    inputSchema: AppSupportInputSchema,
    outputSchema: AppSupportOutputSchema,
  },
  async (input) => {
    const {output} = await appSupportPrompt(input);
    if (!output) {
      throw new Error('The AI failed to provide an answer.');
    }
    return output;
  }
);
