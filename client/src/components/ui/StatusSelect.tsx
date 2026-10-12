import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { STATUS_LABEL, TASK_STATUSES, type TaskStatus } from '../../types';
import { StatusDot } from './StatusDot';

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  label: string;
  variant?: 'compact' | 'field';
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function StatusSelect({
  value,
  onChange,
  label,
  variant = 'compact',
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: StatusSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 188);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const placeAbove = window.innerHeight - rect.bottom < 160 && rect.top > 160;
    setMenuStyle({
      position: 'fixed',
      left,
      width,
      zIndex: 40,
      top: placeAbove ? undefined : rect.bottom + 6,
      bottom: placeAbove ? window.innerHeight - rect.top + 6 : undefined,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  function choose(next: TaskStatus) {
    setOpen(false);
    triggerRef.current?.focus();
    if (next !== value) onChange(next);
  }

  function onTriggerKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  }

  const field = variant === 'field';

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={cn('status-trigger', field ? 'status-trigger-field' : 'status-trigger-compact')}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={field ? undefined : label}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKey}
      >
        <StatusDot status={value} />
        <span className={cn('text-left', field ? 'flex-1' : 'flex-none')}>{STATUS_LABEL[value]}</span>
        <ChevronDown className={cn('status-chevron', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <ul
              ref={menuRef}
              id={listId}
              className="status-menu"
              style={menuStyle}
              role="listbox"
              aria-label={label}
            >
              {TASK_STATUSES.map((status) => {
                const selected = status === value;
                return (
                  <li key={status} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn('status-option', selected && 'status-option-selected')}
                      onClick={() => choose(status)}
                    >
                      <StatusDot status={status} />
                      <span className="flex-1">{STATUS_LABEL[status]}</span>
                      {selected ? <Check className="size-4 text-forest-dark" aria-hidden="true" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
