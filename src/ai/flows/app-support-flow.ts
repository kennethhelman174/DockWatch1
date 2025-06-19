
'use server';
/**
 * @fileOverview An AI-powered assistant to answer user questions about the DockWatch application.
 *
 * - getAppSupport - A function that handles user queries about the app.
 * - AppSupportInput - The input type for the getAppSupport function.
 * - AppSupportOutput - The return type for the getAppSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppSupportInputSchema = z.object({
  userQuestion: z.string().describe('The user question about the DockWatch application.'),
});
export type AppSupportInput = z.infer<typeof AppSupportInputSchema>;

const AppSupportOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user question.'),
});
export type AppSupportOutput = z.infer<typeof AppSupportOutputSchema>;

export async function getAppSupport(input: AppSupportInput): Promise<AppSupportOutput> {
  return appSupportFlow(input);
}

const appSupportPrompt = ai.definePrompt({
  name: 'appSupportPrompt',
  input: {schema: AppSupportInputSchema},
  output: {schema: AppSupportOutputSchema},
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
