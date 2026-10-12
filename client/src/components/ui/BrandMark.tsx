import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export function BrandMark({ to }: { to?: string }) {
  if (to) {
    return (
      <Link to={to} className={cn('brand-mark', 'brand-mark-light')}>
        TaskFlow
      </Link>
    );
  }

  return <p className={cn('brand-mark', 'brand-mark-dark')}>TaskFlow</p>;
}
