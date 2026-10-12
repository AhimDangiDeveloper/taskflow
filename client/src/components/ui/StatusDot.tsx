import type { TaskStatus } from '../../types';
import { cn } from '../../lib/cn';

const TONE_CLASS: Record<TaskStatus, string> = {
  'To-Do': 'dot-todo',
  'In-Progress': 'dot-progress',
  Done: 'dot-done',
};

export function StatusDot({ status }: { status: TaskStatus }) {
  return <i className={cn('dot', TONE_CLASS[status])} aria-hidden="true" />;
}
