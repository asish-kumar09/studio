
'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI chatbot that assists students.
 * It uses firebase-admin for efficient server-side database access within Genkit tools.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for server-side database access
// Use default configuration provided by Firebase App Hosting environment
const adminApp = getApps().length === 0 ? initializeApp() : getApps()[0];
const adminDb = getFirestore(adminApp);

const StudentChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The student\'s academic or general student life query.'),
  studentId: z.string().describe('The unique ID of the authenticated student.'),
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

/**
 * Tool to fetch a student's leave applications.
 * Uses adminDb to bypass security rules since it's a server-side verified request.
 */
const getStudentLeaveHistory = ai.defineTool(
  {
    name: 'getStudentLeaveHistory',
    description: 'Retrieves the list of leave applications for the student to check their status or history.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID to fetch leaves for.'),
    }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    try {
      const snapshot = await adminDb
        .collection('leaveApplications')
        .where('studentId', '==', input.studentId)
        .orderBy('applicationDate', 'desc')
        .limit(5)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in getStudentLeaveHistory tool:', error);
      return [];
    }
  }
);

export async function studentChatbotAssistance(
  input: StudentChatbotAssistanceInput
): Promise<StudentChatbotAssistanceOutput> {
  return studentChatbotAssistanceFlow(input);
}

const studentChatbotPrompt = ai.definePrompt({
  name: 'studentChatbotPrompt',
  input: {schema: StudentChatbotAssistanceInputSchema},
  output: {schema: StudentChatbotAssistanceOutputSchema},
  tools: [getStudentLeaveHistory],
  prompt: `You are an AI chatbot named StudentHub AI, designed to assist students.
You have access to tools that can fetch real-time student data.

**Current Student Context:**
- Student ID: {{{studentId}}}

**Instructions:**
1. If the student asks about their leave requests, status, or history, use the 'getStudentLeaveHistory' tool.
2. Provide concise, helpful, and supportive answers.
3. If tool data is returned, summarize it clearly for the student.

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
