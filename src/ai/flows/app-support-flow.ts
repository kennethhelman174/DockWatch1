
'use server';
/**
 * @fileOverview An AI-powered assistant to answer user questions about the DockWatch application,
 * with the ability to fetch weather forecasts and manage docks.
 *
 * - getAppSupport - A function that handles user queries about the app.
 * - AppSupportInput - The input type for the getAppSupport function.
 * - AppSupportOutput - The return type for the getAppSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeatherForecast } from './get-weather-forecast-flow';
import {
  GetWeatherForecastInputSchema,
  WeatherForecastOutputSchema as GetWeatherForecastOutputSchema,
  type GetWeatherForecastInput,
  type WeatherForecastOutput as GetWeatherForecastOutput
} from '@/ai/schemas/weather-schemas';
import {
  ClearDockInputSchema,
  ClearDockOutputSchema,
  type ClearDockInput,
  type ClearDockOutput,
} from '@/ai/schemas/dock-management-schemas';


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
    return getWeatherForecast(input);
  }
);

// Define the tool for clearing a dock
const clearDockTool = ai.defineTool(
  {
    name: 'clearDockTool',
    description: "Clears a specified dock, making it available. Use this tool if the user explicitly asks to clear a dock or make a dock available by its number (e.g., 'clear dock 103', 'make dock 105 available'). The input should be the dock number.",
    inputSchema: ClearDockInputSchema,
    outputSchema: ClearDockOutputSchema,
  },
  async (input: ClearDockInput): Promise<ClearDockOutput> => {
    // In a real application, this would interact with a backend service or database
    // to update the dock's status. For this prototype, we simulate the action.
    console.log(`AI Tool: Simulating clearing dock ${input.dockNumber}`);
    // Here you might also want to update some central state or trigger an event
    // if your architecture supports it for client-side updates.
    // For now, the AI will just relay this message.
    return { message: `Dock ${input.dockNumber} has been notionally cleared and set to available. The main dashboard may not reflect this change immediately without a manual update or refresh.` };
  }
);

export async function getAppSupport(input: AppSupportInput): Promise<AppSupportOutput> {
  return appSupportFlow(input);
}

const appSupportPrompt = ai.definePrompt({
  name: 'appSupportPrompt',
  input: {schema: AppSupportInputSchema},
  output: {schema: AppSupportOutputSchema},
  tools: [getWeatherForecastTool, clearDockTool], // Make tools available
  prompt: `You are a friendly and helpful AI assistant for the DockWatch application.
DockWatch is a yard management app for a distribution center. Its main features are:
- Dashboard: Overview of dock statuses (shipping/receiving), real-time alerts for facility and weather, filters for docks, and detailed dock information via a modal.
- ETA Calculator: An AI-powered tool to estimate shipment arrival times based on weather, distance, and traffic.
- Driver Kiosk: A sign-in page for drivers to input their details for deliveries or pickups.
- Digital Display: A live, read-only, full-screen view of dock statuses, typically used for large screens in a control room.
- Settings: Allows users to manage app appearance (theme) and notification preferences.
- Help & Support: You are part of this feature.

The user will ask you a question about how to use the DockWatch application or request an action. Provide a clear, concise, and helpful answer/response.
If the question is unclear or unrelated to DockWatch features or capabilities, politely state that you can only help with DockWatch application features.
Do not invent features that don't exist based on this description. Keep your answers focused on how to use the described functionalities or perform supported actions.

IMPORTANT INSTRUCTIONS FOR TOOL USE:
1.  Weather Forecast: If the user's question involves needing to know the current weather for a specific location (e.g., for planning a shipment, understanding potential delays, or operational decisions), you MUST use the 'getWeatherForecast' tool to fetch this information. Then, incorporate the weather details naturally into your answer. For example, if asked "How's the weather in Miami for a shipment?", use the tool for Miami and then state the weather.
2.  Clear Dock: If the user asks to perform an action like clearing a dock (e.g., "clear dock 102", "make dock 105 available", "empty dock 110"), you MUST use the 'clearDockTool'. You will need to extract the dock number from the user's request to pass to the tool. After the tool responds, relay the outcome to the user. For example, if the user says 'Can you clear dock 103 for me?', use the tool and then respond with the message from the tool, such as 'Dock 103 has been notionally cleared and set to available.'

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
