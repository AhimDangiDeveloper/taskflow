export const TASK_STATUSES = ['To-Do', 'In-Progress', 'Done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  'To-Do': 'To do',
  'In-Progress': 'In progress',
  Done: 'Done',
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
}
