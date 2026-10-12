import { GripHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BOARD_COLUMNS } from '../lib/columns';
import { cn } from '../lib/cn';
import { formatDate } from '../lib/format';
import { isTaskStatus } from '../lib/status';
import { STATUS_LABEL, type KanbanBoardProps, type Task, type TaskStatus } from '../types';
import { Button, EmptyState, Skeleton, StatusDot, StatusSelect } from './ui';

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : closestCorners(args);
};

export function KanbanBoard(props: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeTask = props.tasks.find((task) => task.id === activeId) ?? null;

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const task = props.tasks.find((item) => item.id === active.id);
    if (!task) return;

    const overId = String(over.id);
    const nextStatus = isTaskStatus(overId) ? overId : props.tasks.find((item) => item.id === overId)?.status;
    if (!nextStatus || nextStatus === task.status) return;
    props.onMove(task.id, nextStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={(event) => setActiveId(String(event.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="board">
        {BOARD_COLUMNS.map((column) => (
          <Column key={column.status} {...column} {...props} tasks={props.tasks.filter((task) => task.status === column.status)} />
        ))}
      </div>
      <DragOverlay>{activeTask ? <OverlayCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  hint,
  empty,
  tasks,
  loading,
  query,
  allCount,
  onEdit,
  onCreate,
  onMove,
}: KanbanBoardProps & { status: TaskStatus; hint: string; empty: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'column',
        status === 'To-Do' && 'column-todo',
        status === 'In-Progress' && 'column-progress',
        status === 'Done' && 'column-done',
        isOver && 'column-over',
      )}
    >
      <header className="column-head">
        <div>
          <h2 className="column-title">
            <StatusDot status={status} />
            {STATUS_LABEL[status]}
          </h2>
          <p className="column-hint">{hint}</p>
        </div>
        <span className="count">{loading ? '–' : tasks.length}</span>
      </header>
      <div className="column-body">
        {loading ? (
          <>
            <Skeleton />
            <Skeleton short />
          </>
        ) : tasks.length === 0 ? (
          <EmptyState>{query && allCount > 0 ? 'No matching tasks.' : empty}</EmptyState>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onMove={onMove} />)
        )}
      </div>
      <Button variant="add" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onCreate(status)}>
        Add task
      </Button>
    </section>
  );
}

function OverlayCard({ task }: { task: Task }) {
  return (
    <div className={cardFace(task.status, true)}>
      <TaskFace task={task} />
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onMove,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  return (
    <article ref={setNodeRef} className={cn(isDragging && 'card-dragging')} style={{ transform: CSS.Translate.toString(transform) }}>
      <div className={cardFace(task.status)}>
        <Button
          variant="drag"
          icon={<GripHorizontal className="size-4" aria-hidden="true" />}
          aria-label={`Drag ${task.title}`}
          {...listeners}
          {...attributes}
        >
          Drag
        </Button>
        <TaskFace task={task} onEdit={onEdit} onMove={onMove} />
      </div>
    </article>
  );
}

function TaskFace({
  task,
  onEdit,
  onMove,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
  onMove?: (id: string, status: TaskStatus) => void;
}) {
  return (
    <>
      {onEdit ? (
        <Button variant="card" onClick={() => onEdit(task)}>
          {task.title}
        </Button>
      ) : (
        <h3 className="btn-card">{task.title}</h3>
      )}
      {task.description ? <p className="card-copy">{task.description}</p> : null}
      <footer className="card-foot">
        <time className="card-date" dateTime={task.createdAt}>
          {formatDate(task.createdAt)}
        </time>
        {onMove ? (
          <StatusSelect value={task.status} label={`Move ${task.title}`} onChange={(status) => onMove(task.id, status)} />
        ) : (
          <span className="status-pill">
            <StatusDot status={task.status} />
            {STATUS_LABEL[task.status]}
          </span>
        )}
      </footer>
    </>
  );
}

function cardFace(status: TaskStatus, overlay = false) {
  return cn(
    'card',
    status === 'To-Do' && 'card-todo',
    status === 'In-Progress' && 'card-progress',
    status === 'Done' && 'card-done',
    overlay && 'card-overlay',
  );
}
