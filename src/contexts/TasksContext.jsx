import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as api from '../lib/tasks.js';
import { friendlyError } from '../lib/errors.js';

const TasksContext = createContext(null);

/** Loads the signed-in user's tasks once and keeps the list in sync after every database change. */
export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { setTasks(await api.listTasks()); }
    catch (e) { setError(friendlyError(e, 'Could not load your tasks.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) reload(); else { setTasks([]); } }, [user, reload]);

  // Each action waits for the database. The list only changes after the database confirms.
  const add = useCallback(async (values) => {
    const row = await api.createTask(values);
    setTasks((t) => [...t, row]);
    return row;
  }, []);
  const edit = useCallback(async (id, values) => {
    const row = await api.updateTask(id, values);
    setTasks((t) => t.map((x) => (x.id === id ? row : x)));
    return row;
  }, []);
  const remove = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((t) => t.filter((x) => x.id !== id));
  }, []);
  const removeAll = useCallback(async () => {
    await api.deleteAllTasks();
    setTasks([]);
  }, []);

  return <TasksContext.Provider value={{ tasks, loading, error, reload, add, edit, remove, removeAll }}>{children}</TasksContext.Provider>;
}

export const useTasks = () => useContext(TasksContext);
