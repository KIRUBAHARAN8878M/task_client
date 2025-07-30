import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/http';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low'|'medium'|'high';
  status: 'todo'|'inprogress'|'done';
  dueDate?: string;
  owner: string;
  teamIds?: string[];
  createdAt: string;
}

export const fetchTasks = createAsyncThunk('tasks/fetch', async (query: Record<string,string|number> = {}, { rejectWithValue }) => {
  const params = new URLSearchParams(query as any).toString();
  try { return await apiFetch<{ data: Task[]; total: number; page: number; limit: number }>(`/tasks?${params}`); }
  catch (e:any) { return rejectWithValue(e.message); }
});

export const createTask = createAsyncThunk('tasks/create', async (body: Partial<Task>, { rejectWithValue }) => {
  try { return await apiFetch<Task>('/tasks', { method:'POST', body: JSON.stringify(body) }); }
  catch (e:any) { return rejectWithValue(e.message); }
});


export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, body }: { id: string; body: Partial<Task> }, { rejectWithValue }) => {
    try {
      return await apiFetch<Task>(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body) //  must be stringified
      });
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string, { rejectWithValue }) => {
  try { await apiFetch(`/tasks/${id}`, { method:'DELETE' }); return id; }
  catch (e:any) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'tasks',
  initialState: { items: [] as Task[], total: 0, loading: false, error: undefined as string|undefined },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, s => { s.loading = true; s.error = undefined; });
    b.addCase(fetchTasks.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload.data; s.total = payload.total; });
    b.addCase(fetchTasks.rejected, (s, a:any) => { s.loading = false; s.error = a.payload || a.error.message; });

    b.addCase(createTask.fulfilled, (s, { payload }) => { s.items.unshift(payload); s.total += 1; });
    b.addCase(updateTask.fulfilled, (s, { payload }) => { s.items = s.items.map(t => t._id === payload._id ? payload : t); });
    b.addCase(deleteTask.fulfilled, (s, { payload }) => { s.items = s.items.filter(t => t._id !== payload); s.total -= 1; });
  }
});

export default slice.reducer;
