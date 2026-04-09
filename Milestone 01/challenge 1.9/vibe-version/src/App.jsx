import { useState, useId } from 'react';
import './App.css';

// ── TaskItem ──────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li
      className={`task-item${task.done ? ' task-item--done' : ''}`}
      onClick={() => onToggle(task.id)}
      role="checkbox"
      aria-checked={task.done}
      tabIndex={0}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle(task.id)}
    >
      <span className="task-item__check" aria-hidden="true">
        <span className="task-item__check-icon">✓</span>
      </span>
      <span className="task-item__label">{task.title}</span>
      <button
        className="task-item__delete"
        aria-label={`Delete "${task.title}"`}
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        tabIndex={-1}
      >
        ×
      </button>
    </li>
  );
}

// ── TaskInput ─────────────────────────────────────────────────────────────────
function TaskInput({ onAdd }) {
  const [value, setValue] = useState('');
  const inputId = useId();

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <div className="input-area">
      <label htmlFor={inputId} className="sr-only">New task title</label>
      <input
        id={inputId}
        className="input-area__field"
        type="text"
        placeholder="Add a new task…"
        value={value}
        maxLength={120}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        autoFocus
      />
      <button
        id="add-task-btn"
        className="input-area__btn"
        onClick={handleAdd}
        aria-label="Add task"
      >
        + Add
      </button>
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Active', 'Completed'];

function Filters({ current, onChange }) {
  return (
    <div className="filters" role="tablist" aria-label="Task filter">
      {FILTERS.map((f) => (
        <button
          key={f}
          id={`filter-${f.toLowerCase()}`}
          className={`filters__btn${current === f ? ' filters__btn--active' : ''}`}
          onClick={() => onChange(f)}
          role="tab"
          aria-selected={current === f}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
let nextId = 1;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  const addTask = (title) => {
    setTasks((prev) => [
      { id: nextId++, title, done: false },
      ...prev,
    ]);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'Active')    return !t.done;
    if (filter === 'Completed') return t.done;
    return true;
  });

  const remaining = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <main className="app" aria-label="Task Manager">
      {/* Header */}
      <header className="header">
        <div className="header__badge">
          <span className="header__badge-dot" />
          Personal Workspace
        </div>
        <h1 className="header__title">Task Manager</h1>
        <p className="header__subtitle">Stay organized, stay productive.</p>
      </header>

      {/* Card */}
      <section className="card" aria-label="Task board">
        {/* Input */}
        <TaskInput onAdd={addTask} />

        {/* Filters */}
        <Filters current={filter} onChange={setFilter} />

        {/* Task list */}
        <ul className="task-list" aria-live="polite" aria-label="Tasks">
          {filtered.length === 0 ? (
            <li className="task-list__empty" aria-live="polite">
              <span className="task-list__empty-icon">
                {filter === 'Completed' ? '🎉' : '📋'}
              </span>
              <span>
                {filter === 'Completed'
                  ? 'No completed tasks yet'
                  : filter === 'Active'
                  ? 'All tasks done — great work!'
                  : 'No tasks yet. Add one above!'}
              </span>
            </li>
          ) : (
            filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </ul>

        {/* Footer */}
        <footer className="footer">
          <span className="footer__count" aria-live="polite">
            <strong>{remaining}</strong>{' '}
            {remaining === 1 ? 'task' : 'tasks'} remaining
          </span>
          <button
            id="clear-completed-btn"
            className="footer__clear"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            aria-label="Clear all completed tasks"
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}
