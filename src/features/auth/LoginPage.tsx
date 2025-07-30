import { type FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "./authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../../componenets/Toast";
import Button from "../../componenets/ui/Button";
import Input from "../../componenets/ui/Input";
import { Field } from "../../componenets/ui/Field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<string | undefined>();
  const { loading } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // light client-side checks (server still validates)
    if (!email.includes("@")) {
      setToast("Please enter a valid email.");
      return;
    }
    if (!password) {
      setToast("Password is required.");
      return;
    }

    try {
      // unwrap() throws if the thunk was rejected
      await dispatch(login({ email, password })).unwrap();

      setToast("Welcome back!");
      // If you don't have a global toast provider on the dashboard,
      // delay navigation just a tick so the toast renders at least once.
      setTimeout(() => navigate("/"), 50);
    } catch (err: any) {
      setToast(err || "Login failed");
    }
  };

  const isDisabled = loading || !email || !password;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border p-6 rounded"
      >
        <h1 className="text-2xl font-semibold">Login</h1>

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Signing in…" : "Login"}
        </Button>

        <p className="text-sm">
          No account?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </form>

      {/* Make sure to actually render the toast */}
      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}
