
/**
 * @fileOverview Zod schemas and TypeScript types for weather forecast functionality.
 *
 * Exports:
 * - GetWeatherForecastInputSchema: Zod schema for weather forecast input.
 * - GetWeatherForecastInput: TypeScript type for weather forecast input.
 * - WeatherForecastOutputSchema: Zod schema for weather forecast output.
 * - WeatherForecastOutput: TypeScript type for weather forecast output.
 */

import {z} from 'genkit';

export const GetWeatherForecastInputSchema = z.object({
  location: z.string().describe('The city and state, or zip code for which to get the weather forecast (e.g., "San Francisco, CA" or "94107").'),
});
export type GetWeatherForecastInput = z.infer<typeof GetWeatherForecastInputSchema>;

export const WeatherForecastOutputSchema = z.object({
  location: z.string().describe("The location for which the forecast is provided."),
  temperature: z.string().describe("The current temperature, including units (e.g., 72°F or 22°C)."),
  condition: z.string().describe("A brief description of the current weather conditions (e.g., Sunny, Partly Cloudy, Light Rain)."),
  iconName: z.string().describe("A suggested icon name from lucide-react (e.g., 'CloudSun', 'CloudRain', 'Wind', 'Thermometer', 'Sun', 'Moon', 'Cloud'). Try to match the condition appropriately."),
  shortTermForecast: z.string().describe("A brief forecast for the next few hours (e.g., 'Clear skies for the next 3 hours, then increasing cloudiness.')."),
  precipitationChance: z.string().optional().describe("Chance of precipitation if applicable (e.g., '30% chance of rain')."),
});
export type WeatherForecastOutput = z.infer<typeof WeatherForecastOutputSchema>;
