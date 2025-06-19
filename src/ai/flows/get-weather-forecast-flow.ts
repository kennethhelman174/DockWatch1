
'use server';
/**
 * @fileOverview A Genkit flow to get weather forecast information.
 *
 * - getWeatherForecast - A function that fetches weather forecast.
 * - GetWeatherForecastInputSchema - Zod schema for the input.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function.
 * - WeatherForecastOutputSchema - Zod schema for the output (defined in src/types and re-declared here for Genkit).
 * - WeatherForecastOutput - The return type for the getWeatherForecast function (defined in src/types).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { WeatherForecastOutput as WeatherForecastOutputTypeFromTypes } from '@/types'; // Import the shared type

export const GetWeatherForecastInputSchema = z.object({
  location: z.string().describe('The city and state, or zip code for which to get the weather forecast (e.g., "San Francisco, CA" or "94107").'),
});
export type GetWeatherForecastInput = z.infer<typeof GetWeatherForecastInputSchema>;

// Re-define the Zod schema for the output for Genkit, matching WeatherForecastOutput from src/types
export const WeatherForecastOutputSchema = z.object({
  location: z.string().describe("The location for which the forecast is provided."),
  temperature: z.string().describe("The current temperature, including units (e.g., 72°F or 22°C)."),
  condition: z.string().describe("A brief description of the current weather conditions (e.g., Sunny, Partly Cloudy, Light Rain)."),
  iconName: z.string().describe("A suggested icon name from lucide-react (e.g., 'CloudSun', 'CloudRain', 'Wind', 'Thermometer', 'Sun', 'Moon', 'Cloud'). Try to match the condition appropriately."),
  shortTermForecast: z.string().describe("A brief forecast for the next few hours (e.g., 'Clear skies for the next 3 hours, then increasing cloudiness.')."),
  precipitationChance: z.string().optional().describe("Chance of precipitation if applicable (e.g., '30% chance of rain')."),
});
// Ensure this type alias matches the structure from WeatherForecastOutputSchema
export type WeatherForecastOutput = z.infer<typeof WeatherForecastOutputSchema>;


export async function getWeatherForecast(input: GetWeatherForecastInput): Promise<WeatherForecastOutput> {
  return getWeatherForecastFlow(input);
}

const getWeatherForecastPrompt = ai.definePrompt({
  name: 'getWeatherForecastPrompt',
  input: {schema: GetWeatherForecastInputSchema},
  output: {schema: WeatherForecastOutputSchema}, // Use the Zod schema here
  prompt: `You are a helpful weather assistant. Provide a concise weather forecast for the given location: {{{location}}}.

  Your response should include:
  - The location itself.
  - The current temperature with units.
  - A brief description of current conditions.
  - A suggested lucide-react icon name that best represents the current weather (e.g., 'Sun' for sunny, 'CloudRain' for rain, 'Cloud' for cloudy, 'CloudSun' for partly cloudy).
  - A short-term forecast for the next few hours.
  - Chance of precipitation, if relevant.

  Return the information in the specified JSON format.
  Example for a sunny day:
  {
    "location": "Cupertino, CA",
    "temperature": "75°F",
    "condition": "Sunny",
    "iconName": "Sun",
    "shortTermForecast": "Clear skies expected for the rest of the day.",
    "precipitationChance": "0%"
  }
  Example for a rainy day:
  {
    "location": "Seattle, WA",
    "temperature": "55°F",
    "condition": "Light Rain",
    "iconName": "CloudRain",
    "shortTermForecast": "Intermittent light rain continuing for the next 4 hours.",
    "precipitationChance": "60%"
  }
  `,
});

const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: WeatherForecastOutputSchema, // Use the Zod schema here
  },
  async (input) => {
    const {output} = await getWeatherForecastPrompt(input);
    if (!output) {
      throw new Error("Failed to get weather forecast from AI.");
    }
    return output;
  }
);

// Ensure the type used for the flow matches the actual output type from the Zod schema
async function ensureOutputTypeMatch(input: GetWeatherForecastInput): Promise<WeatherForecastOutputTypeFromTypes> {
    const result: WeatherForecastOutput = await getWeatherForecastFlow(input);
    return result; // This works because WeatherForecastOutput (from Zod) and WeatherForecastOutputTypeFromTypes (from types.ts) are structurally identical
}
