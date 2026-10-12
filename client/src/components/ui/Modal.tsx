import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  titleId: string;
  onClose: () => void;
  locked?: boolean;
  focusKey?: unknown;
  children: ReactNode;
}

export function Modal({ titleId, onClose, locked = false, focusKey, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);
  onCloseRef.current = onClose;
  lockedRef.current = locked;

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialogRef.current;

    const focusable = () =>
      [...(node?.querySelectorAll<HTMLElement>('button, input, textarea, select') ?? [])].filter(
        (element) => !element.hasAttribute('disabled'),
      );

    const preferred = node?.querySelector<HTMLElement>('input, textarea, select');
    (preferred ?? focusable()[0])?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lockedRef.current) return;
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [focusKey]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={() => onCloseRef.current()}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="modal-title">
      {children}
    </h2>
  );
}

export function ModalClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn btn-icon"
      onClick={onClick}
      aria-label="Close"
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  );
}
