import type { ReactNode } from 'react';

export function Banner({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="banner" role="alert">
      <p>{message}</p>
      {children}
    </div>
  );
}
