import { type FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { register as registerThunk } from "./authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Toast } from "../../componenets/Toast";
import Button from "../../componenets/ui/Button";
import Input from "../../componenets/ui/Input";
import { Field } from "../../componenets/ui/Field";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<string | undefined>();
  const { loading } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Light client-side validation (server still enforces Joi)
    if (!name.trim()) {
      setToast("Name is required.");
      return;
    }
    if (!email.includes("@")) {
      setToast("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setToast("Password must be at least 6 characters.");
      return;
    }

    try {
      await dispatch(registerThunk({ name, email, password })).unwrap();
      setToast("Account created! Redirecting…");
      // Give the toast a moment to show if you don't have a global provider
      setTimeout(() => navigate("/"), 100);
    } catch (err: any) {
      // Server sends useful messages like "Email already registered"
      setToast(err || "Registration failed");
    }
  };

  const isDisabled = loading || !name || !email || password.length < 6;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border p-6 rounded"
      >
        <h1 className="text-2xl font-semibold">Register</h1>

        <Field label="Name" htmlFor="name" required>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          required
          hint="At least 6 characters."
        >
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>

        <p className="text-sm">
          Have an account?{" "}
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
