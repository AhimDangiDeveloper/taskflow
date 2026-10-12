import type { ReactNode } from 'react';
import { BrandMark } from './ui';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <BrandMark to="/login" />
        <h1 className="auth-display">Move work forward, one column at a time.</h1>
        <p className="auth-lede">A private board for what is waiting, what is in motion, and what is finished.</p>
        <div className="brand-board" aria-hidden="true">
          <BrandColumn label="To do" bars={['bg-cream/80', 'bg-cream/80']} />
          <BrandColumn label="In progress" bars={['w-[70%] bg-[#8dcea8]']} />
          <BrandColumn label="Done" bars={['bg-[#e7c27a]', 'bg-[#e7c27a]']} />
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <h2 className="auth-heading">{title}</h2>
          <p className="lede">{subtitle}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}

function BrandColumn({ label, bars }: { label: string; bars: string[] }) {
  return (
    <div className="brand-column">
      <span className="brand-label">{label}</span>
      {bars.map((bar, index) => (
        <i key={`${label}-${index}`} className={`brand-bar ${bar}`} />
      ))}
    </div>
  );
}
