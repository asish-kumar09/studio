'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI chatbot that assists students.
 *
 * - studentChatbotAssistance - A function that handles student queries and provides helpful answers.
 * - StudentChatbotAssistanceInput - The input type for the studentChatbotAssistance function.
 * - StudentChatbotAssistanceOutput - The return type for the studentChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudentChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The student\'s academic or general student life query.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('Previous messages in the conversation for context.'),
});
export type StudentChatbotAssistanceInput = z.infer<typeof StudentChatbotAssistanceInputSchema>;

const StudentChatbotAssistanceOutputSchema = z.object({
  answer: z.string().describe('A relevant and helpful answer to the student\'s query.'),
});
export type StudentChatbotAssistanceOutput = z.infer<typeof StudentChatbotAssistanceOutputSchema>;

export async function studentChatbotAssistance(
  input: StudentChatbotAssistanceInput
): Promise<StudentChatbotAssistanceOutput> {
  return studentChatbotAssistanceFlow(input);
}

const studentChatbotPrompt = ai.definePrompt({
  name: 'studentChatbotPrompt',
  input: {schema: StudentChatbotAssistanceInputSchema},
  output: {schema: StudentChatbotAssistanceOutputSchema},
  prompt: `You are an AI chatbot named StudentHub AI, designed to assist students with their academic queries and general student life questions.
Your goal is to provide relevant, accurate, and helpful answers to the best of your abilities.
Base your answers on general knowledge and maintain a supportive, encouraging tone.

{{#if history}}
**Conversation History:**
{{#each history}}
- {{{role}}}: {{{content}}}
{{/each}}
{{/if}}

**Current Student Query:** {{{query}}}`,
});

const studentChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'studentChatbotAssistanceFlow',
    inputSchema: StudentChatbotAssistanceInputSchema,
    outputSchema: StudentChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await studentChatbotPrompt(input);
    return output!;
  }
);
