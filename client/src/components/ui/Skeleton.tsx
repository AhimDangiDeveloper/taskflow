import { cn } from '../../lib/cn';

export function Skeleton({ short = false }: { short?: boolean }) {
  return <div className={cn('skeleton', short && 'skeleton-short')} />;
}
