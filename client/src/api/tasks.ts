import type { Task, TaskInput } from '../types';
import { request } from './client';

export function listTasks() {
  return request<{ tasks: Task[] }>('/tasks');
}

export function createTask(body: TaskInput) {
  return request<{ task: Task }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateTask(id: string, body: Partial<TaskInput>) {
  return request<{ task: Task }>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteTask(id: string) {
  return request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' });
}
