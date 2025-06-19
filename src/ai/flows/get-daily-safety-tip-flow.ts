
'use server';
/**
 * @fileOverview A Genkit flow to generate a daily safety tip.
 *
 * - getDailySafetyTip - A function that generates a safety tip.
 * - DailySafetyTipOutput - The return type for the getDailySafetyTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailySafetyTipOutputSchema = z.object({
  safetyTip: z.string().describe('A concise safety tip relevant to a warehouse or distribution center environment.'),
});
export type DailySafetyTipOutput = z.infer<typeof DailySafetyTipOutputSchema>;

export async function getDailySafetyTip(): Promise<DailySafetyTipOutput> {
  return getDailySafetyTipFlow();
}

const getDailySafetyTipPrompt = ai.definePrompt({
  name: 'getDailySafetyTipPrompt',
  output: {schema: DailySafetyTipOutputSchema},
  prompt: `You are a safety expert for logistics and warehouse operations.
Generate a single, concise, and practical safety tip of the day.
The tip should be relevant to a distribution center, warehouse, or yard management environment.
Focus on common hazards, best practices, or awareness.
Keep the tip to one or two short sentences.

Example topics: forklift safety, proper lifting techniques, hazard reporting, PPE usage, situational awareness, fire safety, clear pathways, spill response.
Do not include a greeting or any preamble like "Today's safety tip is:". Just provide the tip itself.
`,
});

const getDailySafetyTipFlow = ai.defineFlow(
  {
    name: 'getDailySafetyTipFlow',
    outputSchema: DailySafetyTipOutputSchema,
  },
  async () => {
    const {output} = await getDailySafetyTipPrompt({}); // No input needed for this prompt
    if (!output) {
      throw new Error("Failed to generate a safety tip from AI.");
    }
    return output;
  }
);
