
'use server';
/**
 * @fileOverview A Genkit flow to get weather forecast information.
 *
 * - getWeatherForecast - A function that fetches weather forecast.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function (imported from weather-schemas).
 * - WeatherForecastOutput - The return type for the getWeatherForecast function (imported from weather-schemas).
 */

import {ai} from '@/ai/genkit';
import {
  GetWeatherForecastInputSchema,
  type GetWeatherForecastInput,
  WeatherForecastOutputSchema,
  type WeatherForecastOutput
} from '@/ai/schemas/weather-schemas';

export async function getWeatherForecast(input: GetWeatherForecastInput): Promise<WeatherForecastOutput> {
  return getWeatherForecastFlow(input);
}

const getWeatherForecastPrompt = ai.definePrompt({
  name: 'getWeatherForecastPrompt',
  input: {schema: GetWeatherForecastInputSchema},
  output: {schema: WeatherForecastOutputSchema},
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
    outputSchema: WeatherForecastOutputSchema,
  },
  async (input) => {
    const {output} = await getWeatherForecastPrompt(input);
    if (!output) {
      throw new Error("Failed to get weather forecast from AI.");
    }
    return output;
  }
);
