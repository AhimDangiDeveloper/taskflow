import { LogOut, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { errorMessage } from '../api';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskModal } from '../components/TaskModal';
import { Avatar, Banner, BrandMark, Button, SearchField, StatusDot } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { greeting } from '../lib/format';
import type { ModalState, Task, TaskInput, TaskStatus } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const moveVersion = useRef<Record<string, number>>({});

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.listTasks();
      setTasks(data.tasks);
    } catch (error) {
      setLoadError(errorMessage(error, 'Could not load tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const visibleTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(needle));
  }, [tasks, query]);

  async function moveTask(id: string, status: TaskStatus) {
    const version = (moveVersion.current[id] ?? 0) + 1;
    moveVersion.current[id] = version;
    const previous = tasks;
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
    try {
      const data = await api.updateTask(id, { status });
      if (moveVersion.current[id] !== version) return;
      setTasks((current) => current.map((task) => (task.id === id ? data.task : task)));
    } catch (error) {
      if (moveVersion.current[id] !== version) return;
      setTasks(previous);
      push('error', errorMessage(error, 'Could not move task'));
    }
  }

  async function saveTask(input: TaskInput) {
    try {
      if (modal?.mode === 'edit') {
        const data = await api.updateTask(modal.task.id, input);
        setTasks((current) => current.map((task) => (task.id === data.task.id ? data.task : task)));
        push('success', 'Task updated');
      } else {
        const data = await api.createTask(input);
        setTasks((current) => [data.task, ...current]);
        push('success', 'Task created');
      }
      setModal(null);
    } catch (error) {
      push('error', errorMessage(error, 'Could not save task'));
      throw error;
    }
  }

  async function removeTask() {
    if (modal?.mode !== 'edit') return;
    const id = modal.task.id;
    try {
      await api.deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setModal(null);
      push('success', 'Task deleted');
    } catch (error) {
      push('error', errorMessage(error, 'Could not delete task'));
      throw error;
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const firstName = user?.name.split(' ')[0] ?? '';
  const todo = tasks.filter((task) => task.status === 'To-Do').length;
  const inProgress = tasks.filter((task) => task.status === 'In-Progress').length;
  const done = tasks.filter((task) => task.status === 'Done').length;

  return (
    <div className="shell">
      <header className="topbar">
        <BrandMark />
        <div className="userbar">
          <Avatar name={user?.name} />
          <div className="user-meta">
            <strong>{user?.name}</strong>
            <span className="user-email">{user?.email}</span>
          </div>
          <Button variant="ghost" icon={<LogOut className="size-4" aria-hidden="true" />} onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <section className="toolbar">
        <div>
          <p className="eyebrow">
            {greeting()}, {firstName}
          </p>
          <h1 className="page-title">Your board</h1>
          <ul className="stat-row">
            <Stat status="To-Do" label="To do" value={loading ? '–' : todo} />
            <Stat status="In-Progress" label="In progress" value={loading ? '–' : inProgress} />
            <Stat status="Done" label="Done" value={loading ? '–' : done} />
          </ul>
        </div>
        <div className="toolbar-actions">
          <SearchField value={query} onChange={setQuery} />
          <Button className="shrink-0" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setModal({ mode: 'create', status: 'To-Do' })}>
            New task
          </Button>
        </div>
      </section>

      {loadError ? (
        <Banner message={loadError}>
          <Button variant="ghost" onClick={() => void loadTasks()}>
            Try again
          </Button>
        </Banner>
      ) : (
        <KanbanBoard
          tasks={visibleTasks}
          allCount={tasks.length}
          loading={loading}
          query={query.trim()}
          onEdit={(task) => setModal({ mode: 'edit', task })}
          onCreate={(status) => setModal({ mode: 'create', status })}
          onMove={(id, status) => void moveTask(id, status)}
        />
      )}

      {modal ? (
        <TaskModal
          mode={modal.mode}
          task={modal.mode === 'edit' ? modal.task : undefined}
          defaultStatus={modal.mode === 'create' ? modal.status : modal.task.status}
          onClose={() => setModal(null)}
          onSubmit={saveTask}
          onDelete={modal.mode === 'edit' ? removeTask : undefined}
        />
      ) : null}
    </div>
  );
}

function Stat({ status, label, value }: { status: TaskStatus; label: string; value: string | number }) {
  return (
    <li className="stat">
      <StatusDot status={status} />
      {label} <strong className="stat-value">{value}</strong>
    </li>
  );
}
