import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>, {
        id: fieldId,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error || hint ? messageId : undefined,
      })
    : children;

  return (
    <label className="field" htmlFor={fieldId}>
      <span className="field-label">{label}</span>
      {control}
      {error ? (
        <small id={messageId} className="field-error">
          {error}
        </small>
      ) : hint ? (
        <small id={messageId} className="field-hint">
          {hint}
        </small>
      ) : null}
    </label>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, className, ...input }: TextFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <input className={cn('control', className)} {...input} />
    </Field>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, className, ...area }: TextAreaFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea className={cn('control', 'control-area', className)} {...area} />
    </Field>
  );
}
