import { type FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { register as registerThunk } from './authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Toast } from '../../componenets/Toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<string | undefined>();
  const { loading } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Light client-side validation (server still enforces Joi)
    if (!name.trim()) {
      setToast('Name is required.');
      return;
    }
    if (!email.includes('@')) {
      setToast('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setToast('Password must be at least 6 characters.');
      return;
    }

    try {
      await dispatch(registerThunk({ name, email, password })).unwrap();
      setToast('Account created! Redirecting…');
      // Give the toast a moment to show if you don't have a global provider
      setTimeout(() => navigate('/'), 100);
    } catch (err: any) {
      // Server sends useful messages like "Email already registered"
      setToast(err || 'Registration failed');
    }
  };

  const isDisabled = loading || !name || !email || password.length < 6;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 border p-6 rounded">
        <h1 className="text-2xl font-semibold">Register</h1>

        <input
          className="input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button disabled={isDisabled} className="btn w-full">
          {loading ? 'Loading...' : 'Create account'}
        </button>

        <p className="text-sm">
          Have an account?{' '}
          <Link to="/login" className="underline">
            Login
          </Link>
        </p>
      </form>

      {/* Show toasts for success/error */}
      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}
