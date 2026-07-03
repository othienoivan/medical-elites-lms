import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { loginUser } from "../firebase/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(error.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-8 text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-600">
            Login to continue your Medical Elites learning journey.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">Email Address</label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Password</label>

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-700 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </Card>
    </main>
  );
}