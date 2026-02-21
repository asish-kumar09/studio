'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating professional summaries and impactful bullet points for a resume.
 *
 * - generateResumeContent - A function that handles the resume content generation process.
 * - AIResumeContentGenerationInput - The input type for the generateResumeContent function.
 * - AIResumeContentGenerationOutput - The return type for the generateResumeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIResumeContentGenerationInputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('A list of key skills the student possesses.'),
  experiences: z
    .array(
      z.object({
        title: z.string().describe('Job title or role.'),
        company: z.string().describe('Company name.'),
        duration: z.string().describe('Duration of employment (e.g., "Jan 2020 - Dec 2022").'),
        description: z
          .string()
          .describe('Original description of responsibilities or achievements.'),
      })
    )
    .describe('A list of work experiences.'),
});
export type AIResumeContentGenerationInput = z.infer<
  typeof AIResumeContentGenerationInputSchema
>;

const AIResumeContentGenerationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A professional summary (2-3 sentences) highlighting key qualifications and career goals.'
    ),
  experienceBulletPoints: z
    .array(
      z.object({
        title: z.string().describe('Job title or role.'),
        company: z.string().describe('Company name.'),
        bulletPoints: z
          .array(z.string())
          .describe(
            '3-5 concise, action-oriented bullet points for the work experience, focusing on achievements and impact.'
          ),
      })
    )
    .describe('Generated bullet points for each work experience.'),
});
export type AIResumeContentGenerationOutput = z.infer<
  typeof AIResumeContentGenerationOutputSchema
>;

export async function generateResumeContent(
  input: AIResumeContentGenerationInput
): Promise<AIResumeContentGenerationOutput> {
  return aiResumeContentGenerationFlow(input);
}

const resumeContentPrompt = ai.definePrompt({
  name: 'resumeContentGenerationPrompt',
  input: {schema: AIResumeContentGenerationInputSchema},
  output: {schema: AIResumeContentGenerationOutputSchema},
  prompt: `You are an expert resume writer. Your task is to generate a professional summary and impactful bullet points for a resume based on the provided skills and work experiences.

Carefully review the provided skills and detailed descriptions of past work experiences. For each experience, extract key responsibilities and achievements to form 3-5 concise, action-oriented bullet points that highlight impact and measurable results where possible. Also, craft a compelling professional summary that is 2-3 sentences long, tailored to the overall profile suggested by the skills and experiences.

**Skills:**
{{#if skills}}
{{#each skills}}
- {{{this}}}
{{/each}}
{{else}}
No specific skills provided. Please infer general skills from experiences.
{{/if}}

**Work Experiences:**
{{#if experiences}}
{{#each experiences}}
  **Role:** {{{title}}}
  **Company:** {{{company}}}
  **Duration:** {{{duration}}}
  **Original Description/Responsibilities:**
  {{{description}}}

{{/each}}
{{else}}
No work experiences provided.
{{/if}}

Please provide the output in a JSON format matching the following structure exactly. Ensure that each experience in 'experienceBulletPoints' includes the 'title' and 'company' fields as provided in the input, along with the newly generated 'bulletPoints'.

`,
});

const aiResumeContentGenerationFlow = ai.defineFlow(
  {
    name: 'aiResumeContentGenerationFlow',
    inputSchema: AIResumeContentGenerationInputSchema,
    outputSchema: AIResumeContentGenerationOutputSchema,
  },
  async input => {
    const {output} = await resumeContentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate resume content.');
    }
    return output;
  }
);
