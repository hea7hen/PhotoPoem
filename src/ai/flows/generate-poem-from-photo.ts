// 'use server'
'use server';
/**
 * @fileOverview Generates a poem based on the content of an uploaded photo.
 *
 * - generatePoemFromPhoto - A function that handles the poem generation process.
 * - GeneratePoemFromPhotoInput - The input type for the generatePoemFromPhoto function.
 * - GeneratePoemFromPhotoOutput - The return type for the generatePoemFromPhoto function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemFromPhotoInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the uploaded photo.'),
});
export type GeneratePoemFromPhotoInput = z.infer<typeof GeneratePoemFromPhotoInputSchema>;

const GeneratePoemFromPhotoOutputSchema = z.object({
  poem: z.string().describe('The generated poem based on the photo.'),
});
export type GeneratePoemFromPhotoOutput = z.infer<typeof GeneratePoemFromPhotoOutputSchema>;

export async function generatePoemFromPhoto(input: GeneratePoemFromPhotoInput): Promise<GeneratePoemFromPhotoOutput> {
  return generatePoemFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromPhotoPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the uploaded photo.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem based on the photo.'),
    }),
  },
  prompt: `You are a creative poet. Analyze the visual elements of the photo and write a poem inspired by its content. Consider the theme, mood, and imagery present in the photo.

Photo: {{media url=photoUrl}}
`,
});

const generatePoemFromPhotoFlow = ai.defineFlow<
  typeof GeneratePoemFromPhotoInputSchema,
  typeof GeneratePoemFromPhotoOutputSchema
>({
  name: 'generatePoemFromPhotoFlow',
  inputSchema: GeneratePoemFromPhotoInputSchema,
  outputSchema: GeneratePoemFromPhotoOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
