
/**
 * @fileOverview Zod schemas and TypeScript types for dock management functionality.
 *
 * Exports:
 * - ClearDockInputSchema: Zod schema for clearing a dock input.
 * - ClearDockInput: TypeScript type for clearing a dock input.
 * - ClearDockOutputSchema: Zod schema for clearing a dock output.
 * - ClearDockOutput: TypeScript type for clearing a dock output.
 */

import {z} from 'genkit';

export const ClearDockInputSchema = z.object({
  dockNumber: z.number().int().positive().describe('The number of the dock to be cleared (e.g., 103).'),
});
export type ClearDockInput = z.infer<typeof ClearDockInputSchema>;

export const ClearDockOutputSchema = z.object({
  message: z.string().describe("A confirmation message indicating the result of the clear dock operation."),
});
export type ClearDockOutput = z.infer<typeof ClearDockOutputSchema>;
