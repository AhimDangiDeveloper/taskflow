import { TASK_STATUSES, type TaskStatus } from '../types';

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}
