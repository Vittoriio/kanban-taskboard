export type TaskStatus = 'Planned' | 'Pending' | 'Completed';

export type TaskPriority = 'High' | 'Medium' | 'Low' | 'None';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  date?: string; // YYYY-MM-DD
  comments?: number;
  assignees?: string[];
  order?: number;
}