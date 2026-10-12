import { Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { ApiError } from '../api';
import type { Task, TaskInput, TaskStatus } from '../types';
import { Button, Field, Modal, ModalClose, ModalTitle, StatusSelect, TextAreaField, TextField } from './ui';

interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function TaskModal({ mode, task, defaultStatus, onClose, onSubmit, onDelete }: TaskModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (title.trim().length > 120) next.title = 'Title must be 120 characters or fewer';
    if (description.trim().length > 1000) next.description = 'Description must be 1000 characters or fewer';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSubmitting(true);
    try {
      await onDelete();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal titleId={titleId} onClose={onClose} locked={submitting} focusKey={confirmingDelete}>
      {confirmingDelete ? (
        <div>
          <ModalTitle id={titleId}>Delete this task?</ModalTitle>
          <p className="confirm-copy">{`“${task?.title ?? 'This task'}” will be removed from your board. This cannot be undone.`}</p>
          <div className="modal-actions-end">
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={submitting}>
              Keep task
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting…' : 'Delete task'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <ModalTitle id={titleId}>{mode === 'create' ? 'New task' : 'Edit task'}</ModalTitle>
            <ModalClose onClick={onClose} />
          </div>
          <TextField
            label="Title"
            value={title}
            maxLength={120}
            placeholder="Draft the kickoff notes"
            error={errors.title}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((current) => ({ ...current, title: '' }));
            }}
          />
          <TextAreaField
            label="Description"
            rows={4}
            value={description}
            maxLength={1000}
            placeholder="What needs to happen, and any useful detail."
            error={errors.description}
            hint={`${description.length}/1000`}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Field label="Status">
            <StatusSelect variant="field" value={status} label="Status" onChange={setStatus} />
          </Field>
          <div className="modal-actions">
            {mode === 'edit' && onDelete ? (
              <Button variant="text" danger icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="modal-actions-end">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
