// src/ai/agents/pro/DashboardDataAgent.ts
'use server';
/**
 * @fileOverview An AI agent to fetch data for the Pro clinical dashboard.
 * In a real application, this would fetch data from Firestore for the logged-in user.
 * For now, it returns structured mock data, replacing the Python backend endpoint.
 *
 * - getDashboardData - A function that returns tasks and recent activity.
 */

import { ai } from '@/ai/genkit';
import { ProDashboardDataSchema, TaskItemSchema, RecentActivityItemSchema } from '@/ai/schemas/pro-schemas';
import type { z } from 'zod';

export type ProDashboardData = z.infer<typeof ProDashboardDataSchema>;

export async function getDashboardData(): Promise<ProDashboardData> {
  return getDashboardDataFlow();
}

const getDashboardDataFlow = ai.defineFlow(
  {
    name: 'getDashboardDataFlow',
    inputSchema: z.void(), // No input needed for this version
    outputSchema: ProDashboardDataSchema,
  },
  async () => {
    // In a real app, this would involve fetching data from Firestore collections
    // like 'tasks' and 'activity_logs' for the specific user.
    // e.g., const tasks = await firestore.collection(`users/${userId}/tasks`).get();

    // For now, we return structured mock data.
    const mockTasks: z.infer<typeof TaskItemSchema>[] = [
      { id: 'task1', text: "Review Mr. Smith's latest CBC results", category: 'Lab Review', dueDate: 'Today', priority: 'High', completed: false },
      { id: 'task2', text: 'Follow-up call with Mrs. Jones re: medication adjustment', category: 'Follow-up', dueDate: 'Tomorrow', priority: 'Medium', completed: false },
      { id: 'task3', text: 'Patient Alert: John Doe - Critical lab value (K+ 2.5)', category: 'Patient Alert', priority: 'High', completed: false },
      { id: 'task4', text: 'On-call shift: 7 PM - 7 AM', category: 'Schedule', dueDate: 'Today', completed: false },
      { id: 'task5', text: 'Review imaging for Patient X', category: 'Lab Review', dueDate: 'Today', priority: 'Medium', completed: true },
    ];
    
    const mockActivity: z.infer<typeof RecentActivityItemSchema>[] = [
      { id: 'act1', text: 'You generated a discharge summary for patient Jane Doe.', timestamp: '2 hours ago' },
      { id: 'act2', text: 'Medico-legal documentation for Case #456 was updated.', timestamp: '5 hours ago' },
    ];

    return { tasks: mockTasks, recentActivity: mockActivity };
  }
);
