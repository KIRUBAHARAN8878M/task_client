import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/http';
import { setAccessToken } from '../../lib/token';
import type { AuthState, User } from './types';

type Creds = { email: string; password: string; name?: string };

export const register = createAsyncThunk('auth/register', async (payload: Creds, { rejectWithValue }) => {
  try { return await apiFetch<{ user: User; accessToken: string }>('/auth/register', { method:'POST', body: JSON.stringify(payload) }); }
  catch (e:any) { return rejectWithValue(e.message); }
});

export const login = createAsyncThunk('auth/login', async (payload: Creds, { rejectWithValue }) => {
  try { return await apiFetch<{ user: User; accessToken: string }>('/auth/login', { method:'POST', body: JSON.stringify(payload) }); }
  catch (e:any) { return rejectWithValue(e.message); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiFetch('/auth/logout', { method:'POST' });
  return true;
});

const initialState: AuthState = { user: null, loading: false };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    bootstrap(state, { payload }: { payload: { user: User | null; accessToken: string | null } }) {
      if (payload.accessToken) setAccessToken(payload.accessToken);
      state.user = payload.user;
    }
  },
  extraReducers: (b) => {
    b.addCase(register.pending, s => { s.loading = true; s.error = undefined; });
    b.addCase(register.fulfilled, (s, { payload }) => { s.loading = false; s.user = payload.user; setAccessToken(payload.accessToken); });
    b.addCase(register.rejected, (s, a:any) => { s.loading = false; s.error = a.payload || a.error.message; });

    b.addCase(login.pending, s => { s.loading = true; s.error = undefined; });
    b.addCase(login.fulfilled, (s, { payload }) => { s.loading = false; s.user = payload.user; setAccessToken(payload.accessToken); });
    b.addCase(login.rejected, (s, a:any) => { s.loading = false; s.error = a.payload || a.error.message; });

    b.addCase(logout.fulfilled, (s) => { s.user = null; setAccessToken(null); });
  }
});

export const { bootstrap } = slice.actions;
export default slice.reducer;
