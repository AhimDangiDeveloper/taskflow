import type { Task, TaskStatus } from './task';

export interface ColumnCopy {
  status: TaskStatus;
  hint: string;
  empty: string;
}

export interface KanbanBoardProps {
  tasks: Task[];
  allCount: number;
  loading: boolean;
  query: string;
  onEdit: (task: Task) => void;
  onCreate: (status: TaskStatus) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

export type ModalState = { mode: 'create'; status: TaskStatus } | { mode: 'edit'; task: Task };
