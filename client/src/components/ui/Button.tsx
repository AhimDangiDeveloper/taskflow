import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'text' | 'add' | 'icon' | 'drag' | 'card';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  danger?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  text: 'btn-text',
  add: 'btn-add',
  icon: 'btn-icon',
  drag: 'btn-drag',
  card: 'btn-card',
};

export function Button({ variant = 'primary', danger, icon, className, type = 'button', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('btn', VARIANT_CLASS[variant], danger && 'text-danger', className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
